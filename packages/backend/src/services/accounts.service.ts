import pool from '../config/database';

export const accountsService = {
  // Get all accounts as flat list
  async getAll() {
    const { rows } = await pool.query(
      'SELECT * FROM accounts WHERE is_active = true ORDER BY code'
    );
    return rows;
  },

  // Get account tree using recursive CTE
  async getTree() {
    const { rows } = await pool.query(`
      WITH RECURSIVE account_tree AS (
        SELECT
          id, code, name, type, normal_balance, parent_id,
          is_leaf, depth, path,
          ARRAY[id] AS ancestors
        FROM accounts
        WHERE parent_id IS NULL AND is_active = true

        UNION ALL

        SELECT
          a.id, a.code, a.name, a.type, a.normal_balance, a.parent_id,
          a.is_leaf, at.depth + 1,
          at.path || ' > ' || a.name,
          at.ancestors || a.id
        FROM accounts a
        INNER JOIN account_tree at ON a.parent_id = at.id
        WHERE a.is_active = true
      )
      SELECT
        id, code, name, type, normal_balance,
        parent_id, is_leaf, depth, path,
        REPEAT('  ', depth) || name AS indented_name
      FROM account_tree
      ORDER BY path
    `);
    return rows;
  },

  // Get single account by ID
  async getById(id: string) {
    const { rows } = await pool.query(
      'SELECT * FROM accounts WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  // Get account ledger with running balance (window function)
  async getLedger(accountId: string, from?: string, to?: string) {
    let dateFilter = '';
    const params: any[] = [accountId];
    
    if (from && to) {
      dateFilter = 'AND entry_date BETWEEN $2 AND $3';
      params.push(from, to);
    } else if (from) {
      dateFilter = 'AND entry_date >= $2';
      params.push(from);
    } else if (to) {
      dateFilter = 'AND entry_date <= $2';
      params.push(to);
    }

    const { rows } = await pool.query(`
      WITH ledger_full AS (
        SELECT
          je.entry_date,
          je.entry_number,
          je.description AS transaction_desc,
          jl.description AS line_desc,
          jl.debit,
          jl.credit,
          SUM(
            CASE a.normal_balance
              WHEN 'DEBIT'  THEN jl.debit  - jl.credit
              WHEN 'CREDIT' THEN jl.credit - jl.debit
            END
          ) OVER (
            PARTITION BY jl.account_id
            ORDER BY je.entry_date, je.entry_number, jl.line_number
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) AS running_balance
        FROM journal_lines jl
        JOIN journal_entries je ON je.id = jl.entry_id
        JOIN accounts a ON a.id = jl.account_id
        WHERE jl.account_id = $1
          AND je.status = 'POSTED'
      )
      SELECT * FROM ledger_full
      WHERE 1=1 ${dateFilter}
      ORDER BY entry_date, entry_number
    `, params);
    return rows;
  },

  // Get current balance for an account
  async getBalance(accountId: string) {
    const { rows } = await pool.query(`
      SELECT
        a.id, a.code, a.name, a.type, a.normal_balance,
        COALESCE(SUM(jl.debit), 0) AS total_debits,
        COALESCE(SUM(jl.credit), 0) AS total_credits,
        CASE a.normal_balance
          WHEN 'DEBIT'  THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
          WHEN 'CREDIT' THEN COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
        END AS balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON jl.account_id = a.id
      LEFT JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED'
      WHERE a.id = $1
      GROUP BY a.id, a.code, a.name, a.type, a.normal_balance
    `, [accountId]);
    return rows[0] || null;
  },

  // Create new account
  async create(data: {
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    parent_id?: string;
    description?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If parent_id provided, set parent's is_leaf to false
      if (data.parent_id) {
        await client.query(
          'UPDATE accounts SET is_leaf = false WHERE id = $1',
          [data.parent_id]
        );
      }

      // Get parent info for depth and path
      let depth = 0;
      let path = data.code;
      if (data.parent_id) {
        const parent = await client.query('SELECT depth, path FROM accounts WHERE id = $1', [data.parent_id]);
        if (parent.rows[0]) {
          depth = parent.rows[0].depth + 1;
          path = parent.rows[0].path + ' > ' + data.name;
        }
      }

      const { rows } = await client.query(
        `INSERT INTO accounts (code, name, type, normal_balance, parent_id, description, depth, path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [data.code, data.name, data.type, data.normal_balance, data.parent_id || null, data.description || null, depth, path]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Deactivate account (soft delete)
  async deactivate(id: string) {
    const { rows } = await pool.query(
      'UPDATE accounts SET is_active = false, updated_at = now() WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] || null;
  },
};
