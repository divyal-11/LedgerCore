import pool from '../config/database';

interface JournalLine {
  account_id: string;
  description?: string;
  debit: number;
  credit: number;
}

export const journalService = {
  // List journal entries with pagination
  async list(params: { status?: string; limit?: number; offset?: number }) {
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (params.status) {
      conditions.push(`je.status = $${idx++}`);
      values.push(params.status);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    values.push(limit, offset);

    const { rows } = await pool.query(`
      SELECT
        je.*,
        COALESCE(SUM(jl.debit), 0) AS total_debits,
        COALESCE(SUM(jl.credit), 0) AS total_credits,
        COUNT(jl.id) AS line_count
      FROM journal_entries je
      LEFT JOIN journal_lines jl ON jl.entry_id = je.id
      ${where}
      GROUP BY je.id
      ORDER BY je.entry_date DESC, je.entry_number DESC
      LIMIT $${idx++} OFFSET $${idx}
    `, values);

    return rows;
  },

  // Get single entry with all lines
  async getById(id: string) {
    const entry = await pool.query(
      'SELECT * FROM journal_entries WHERE id = $1',
      [id]
    );
    if (!entry.rows[0]) return null;

    const lines = await pool.query(
      `SELECT jl.*, a.code AS account_code, a.name AS account_name, a.type AS account_type
       FROM journal_lines jl
       JOIN accounts a ON a.id = jl.account_id
       WHERE jl.entry_id = $1
       ORDER BY jl.line_number`,
      [id]
    );

    return { ...entry.rows[0], lines: lines.rows };
  },

  // Create journal entry (DRAFT by default)
  async create(data: {
    entry_date: string;
    description: string;
    reference?: string;
    period_id?: string;
    lines: JournalLine[];
    auto_post?: boolean;
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validate: debits must equal credits
      const totalDebits = data.lines.reduce((sum, l) => sum + Number(l.debit), 0);
      const totalCredits = data.lines.reduce((sum, l) => sum + Number(l.credit), 0);

      if (Math.abs(totalDebits - totalCredits) > 0.001) {
        throw Object.assign(
          new Error(`Journal entry is unbalanced: debits=${totalDebits} credits=${totalCredits}`),
          { status: 400 }
        );
      }

      // Check period is not closed
      if (data.period_id) {
        const period = await client.query(
          'SELECT is_closed FROM fiscal_periods WHERE id = $1',
          [data.period_id]
        );
        if (period.rows[0]?.is_closed) {
          throw Object.assign(new Error('Cannot post to a closed period'), { status: 400 });
        }
      }

      const status = data.auto_post ? 'POSTED' : 'DRAFT';
      const posted_at = data.auto_post ? 'now()' : 'NULL';

      const entry = await client.query(
        `INSERT INTO journal_entries (entry_date, description, reference, period_id, status, posted_at)
         VALUES ($1, $2, $3, $4, $5, ${posted_at})
         RETURNING *`,
        [data.entry_date, data.description, data.reference || null, data.period_id || null, status]
      );

      const entryId = entry.rows[0].id;

      // Insert all lines
      for (let i = 0; i < data.lines.length; i++) {
        const line = data.lines[i];
        await client.query(
          `INSERT INTO journal_lines (entry_id, account_id, line_number, description, debit, credit)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [entryId, line.account_id, i + 1, line.description || null, line.debit, line.credit]
        );
      }

      // If auto-posted, refresh materialized view
      if (data.auto_post) {
        await client.query('SELECT fn_refresh_trial_balance()');
      }

      await client.query('COMMIT');
      return this.getById(entryId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Post a DRAFT entry
  async post(id: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const entry = await client.query(
        'SELECT * FROM journal_entries WHERE id = $1',
        [id]
      );
      if (!entry.rows[0]) throw Object.assign(new Error('Entry not found'), { status: 404 });
      if (entry.rows[0].status !== 'DRAFT') {
        throw Object.assign(new Error('Only DRAFT entries can be posted'), { status: 400 });
      }

      // Check period is not closed
      if (entry.rows[0].period_id) {
        const period = await client.query(
          'SELECT is_closed FROM fiscal_periods WHERE id = $1',
          [entry.rows[0].period_id]
        );
        if (period.rows[0]?.is_closed) {
          throw Object.assign(new Error('Cannot post to a closed period'), { status: 400 });
        }
      }

      await client.query(
        `UPDATE journal_entries SET status = 'POSTED', posted_at = now(), updated_at = now()
         WHERE id = $1`,
        [id]
      );

      await client.query('SELECT fn_refresh_trial_balance()');
      await client.query('COMMIT');

      return this.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Void a POSTED entry (creates reversing entry)
  async void(id: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const entry = await client.query(
        'SELECT * FROM journal_entries WHERE id = $1',
        [id]
      );
      if (!entry.rows[0]) throw Object.assign(new Error('Entry not found'), { status: 404 });
      if (entry.rows[0].status !== 'POSTED') {
        throw Object.assign(new Error('Only POSTED entries can be voided'), { status: 400 });
      }

      // Mark original as VOID
      await client.query(
        `UPDATE journal_entries SET status = 'VOID', updated_at = now() WHERE id = $1`,
        [id]
      );

      // Get original lines
      const lines = await client.query(
        'SELECT * FROM journal_lines WHERE entry_id = $1 ORDER BY line_number',
        [id]
      );

      // Create reversing entry
      const reversal = await client.query(
        `INSERT INTO journal_entries (entry_date, description, reference, period_id, status, posted_at)
         VALUES ($1, $2, $3, $4, 'POSTED', now())
         RETURNING *`,
        [
          entry.rows[0].entry_date,
          `VOID: ${entry.rows[0].description}`,
          `VOID-${entry.rows[0].reference || entry.rows[0].entry_number}`,
          entry.rows[0].period_id,
        ]
      );

      // Insert reversed lines (swap debit/credit)
      for (let i = 0; i < lines.rows.length; i++) {
        const line = lines.rows[i];
        await client.query(
          `INSERT INTO journal_lines (entry_id, account_id, line_number, description, debit, credit)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [reversal.rows[0].id, line.account_id, i + 1, `Reversal: ${line.description || ''}`, line.credit, line.debit]
        );
      }

      await client.query('SELECT fn_refresh_trial_balance()');
      await client.query('COMMIT');

      return { voided: entry.rows[0], reversal: reversal.rows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
