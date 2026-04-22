import pool from '../config/database';

export const periodsService = {
  async list() {
    const { rows } = await pool.query('SELECT * FROM fiscal_periods ORDER BY start_date');
    return rows;
  },

  async getById(id: string) {
    const { rows } = await pool.query('SELECT * FROM fiscal_periods WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create(data: { name: string; start_date: string; end_date: string }) {
    const { rows } = await pool.query(
      `INSERT INTO fiscal_periods (name, start_date, end_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.start_date, data.end_date]
    );
    return rows[0];
  },

  async close(id: string) {
    const { rows } = await pool.query(
      `UPDATE fiscal_periods SET is_closed = true, closed_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0] || null;
  },

  async getSummary(id: string) {
    const period = await this.getById(id);
    if (!period) return null;

    const { rows } = await pool.query(`
      SELECT
        COUNT(DISTINCT je.id) AS entry_count,
        COALESCE(SUM(jl.debit), 0) AS total_debits,
        COALESCE(SUM(jl.credit), 0) AS total_credits
      FROM journal_entries je
      JOIN journal_lines jl ON jl.entry_id = je.id
      WHERE je.period_id = $1 AND je.status = 'POSTED'
    `, [id]);

    return { ...period, ...rows[0] };
  },
};
