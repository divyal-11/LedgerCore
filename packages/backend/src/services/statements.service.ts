import pool from '../config/database';

export const statementsService = {
  // Trial balance from materialized view
  async getTrialBalance() {
    const { rows } = await pool.query(
      'SELECT * FROM mv_trial_balance ORDER BY account_code'
    );

    const totalDebits = rows.reduce((s, r) => s + Number(r.total_debits), 0);
    const totalCredits = rows.reduce((s, r) => s + Number(r.total_credits), 0);

    return {
      rows,
      totals: { total_debits: totalDebits, total_credits: totalCredits },
      is_balanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  },

  // Refresh materialized view
  async refreshTrialBalance() {
    await pool.query('SELECT fn_refresh_trial_balance()');
    return { refreshed: true, timestamp: new Date().toISOString() };
  },

  // Profit & Loss statement
  async getProfitAndLoss(from: string, to: string) {
    const { rows } = await pool.query(`
      WITH
        revenue AS (
          SELECT a.id, a.code, a.name,
            COALESCE(SUM(jl.credit - jl.debit), 0) AS amount
          FROM accounts a
          LEFT JOIN (
            journal_lines jl
            INNER JOIN journal_entries je ON je.id = jl.entry_id
              AND je.status = 'POSTED'
              AND je.entry_date BETWEEN $1 AND $2
          ) ON jl.account_id = a.id
          WHERE a.type = 'REVENUE' AND a.is_leaf = true
          GROUP BY a.id, a.code, a.name
        ),
        expenses AS (
          SELECT a.id, a.code, a.name,
            COALESCE(SUM(jl.debit - jl.credit), 0) AS amount
          FROM accounts a
          LEFT JOIN (
            journal_lines jl
            INNER JOIN journal_entries je ON je.id = jl.entry_id
              AND je.status = 'POSTED'
              AND je.entry_date BETWEEN $1 AND $2
          ) ON jl.account_id = a.id
          WHERE a.type = 'EXPENSE' AND a.is_leaf = true
          GROUP BY a.id, a.code, a.name
        ),
        totals AS (
          SELECT
            (SELECT COALESCE(SUM(amount), 0) FROM revenue) AS total_revenue,
            (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS total_expenses
        )
      SELECT
        'REVENUE' AS section, r.code, r.name, r.amount, NULL::numeric AS subtotal
      FROM revenue r WHERE r.amount != 0
      UNION ALL
      SELECT 'REVENUE_TOTAL', NULL, 'Total Revenue', NULL, t.total_revenue FROM totals t
      UNION ALL
      SELECT 'EXPENSE', e.code, e.name, e.amount, NULL FROM expenses e WHERE e.amount != 0
      UNION ALL
      SELECT 'EXPENSE_TOTAL', NULL, 'Total Expenses', NULL, t.total_expenses FROM totals t
      UNION ALL
      SELECT 'NET_INCOME', NULL, 'Net Income / (Loss)', NULL, t.total_revenue - t.total_expenses
      FROM totals t
      ORDER BY section, code
    `, [from, to]);

    return { period: { from, to }, rows };
  },

  // Balance sheet
  async getBalanceSheet(asOf: string) {
    const { rows } = await pool.query(`
      WITH account_balances AS (
        SELECT
          a.id, a.code, a.name, a.type, a.normal_balance, a.depth, a.parent_id,
          CASE a.type
            WHEN 'ASSET' THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
            ELSE COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
          END AS balance
        FROM accounts a
        LEFT JOIN (
          journal_lines jl
          INNER JOIN journal_entries je ON je.id = jl.entry_id
            AND je.status = 'POSTED'
            AND je.entry_date <= $1
        ) ON jl.account_id = a.id
        WHERE a.is_leaf = true AND a.type IN ('ASSET', 'LIABILITY', 'EQUITY')
        GROUP BY a.id, a.code, a.name, a.type, a.normal_balance, a.depth, a.parent_id
      )
      SELECT type, code, name, depth, balance
      FROM account_balances
      WHERE balance != 0
      ORDER BY type, code
    `, [asOf]);

    // Compute net income (Revenue - Expenses) to include in equity
    const netIncomeResult = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN a.type = 'REVENUE' THEN jl.credit - jl.debit ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN a.type = 'EXPENSE' THEN jl.debit - jl.credit ELSE 0 END), 0) AS net_income
      FROM accounts a
      JOIN journal_lines jl ON jl.account_id = a.id
      JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED' AND je.entry_date <= $1
      WHERE a.type IN ('REVENUE', 'EXPENSE') AND a.is_leaf = true
    `, [asOf]);

    const netIncome = Number(netIncomeResult.rows[0]?.net_income || 0);

    const assets = rows.filter(r => r.type === 'ASSET');
    const liabilities = rows.filter(r => r.type === 'LIABILITY');
    const equity = rows.filter(r => r.type === 'EQUITY');

    // Add net income as a virtual equity row
    if (Math.abs(netIncome) > 0.01) {
      equity.push({ type: 'EQUITY', code: '—', name: 'Current Period Net Income', depth: 1, balance: netIncome.toFixed(4) });
    }

    const totalAssets = assets.reduce((s, r) => s + Number(r.balance), 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + Number(r.balance), 0);
    const totalEquity = equity.reduce((s, r) => s + Number(r.balance), 0);

    return {
      as_of: asOf,
      assets,
      liabilities,
      equity,
      totals: {
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        total_liabilities_and_equity: totalLiabilities + totalEquity,
      },
      is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  },

  // Dashboard summary
  async getDashboardSummary() {
    // Total assets
    const assets = await pool.query(`
      SELECT COALESCE(SUM(
        CASE a.normal_balance
          WHEN 'DEBIT'  THEN jl.debit - jl.credit
          WHEN 'CREDIT' THEN jl.credit - jl.debit
        END
      ), 0) AS total
      FROM accounts a
      JOIN journal_lines jl ON jl.account_id = a.id
      JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED'
      WHERE a.type = 'ASSET' AND a.is_leaf = true
    `);

    // Total revenue (current period)
    const revenue = await pool.query(`
      SELECT COALESCE(SUM(jl.credit - jl.debit), 0) AS total
      FROM accounts a
      JOIN journal_lines jl ON jl.account_id = a.id
      JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED'
      WHERE a.type = 'REVENUE' AND a.is_leaf = true
    `);

    // Total expenses
    const expenses = await pool.query(`
      SELECT COALESCE(SUM(jl.debit - jl.credit), 0) AS total
      FROM accounts a
      JOIN journal_lines jl ON jl.account_id = a.id
      JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED'
      WHERE a.type = 'EXPENSE' AND a.is_leaf = true
    `);

    // Asset Composition
    const assetComposition = await pool.query(`
      SELECT a.name, COALESCE(SUM(jl.debit - jl.credit), 0)::numeric AS value
      FROM accounts a
      JOIN journal_lines jl ON jl.account_id = a.id
      JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED'
      WHERE a.type = 'ASSET' AND a.is_leaf = true
      GROUP BY a.name
      HAVING COALESCE(SUM(jl.debit - jl.credit), 0) > 0
    `);

    // Trend Data (Monthly Revenue vs Expenses)
    const trendData = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', je.entry_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', je.entry_date) AS month_date,
        COALESCE(SUM(CASE WHEN a.type = 'REVENUE' THEN jl.credit - jl.debit ELSE 0 END), 0)::numeric AS revenue,
        COALESCE(SUM(CASE WHEN a.type = 'EXPENSE' THEN jl.debit - jl.credit ELSE 0 END), 0)::numeric AS expenses
      FROM journal_entries je
      JOIN journal_lines jl ON jl.entry_id = je.id
      JOIN accounts a ON a.id = jl.account_id
      WHERE a.type IN ('REVENUE', 'EXPENSE') AND je.status = 'POSTED'
      GROUP BY DATE_TRUNC('month', je.entry_date)
      ORDER BY month_date
    `);

    // Recent entries
    const recent = await pool.query(`
      SELECT je.*, COALESCE(SUM(jl.debit), 0) AS total_amount
      FROM journal_entries je
      LEFT JOIN journal_lines jl ON jl.entry_id = je.id
      GROUP BY je.id
      ORDER BY je.entry_date DESC, je.entry_number DESC
      LIMIT 10
    `);

    // Entry counts
    const counts = await pool.query(`
      SELECT status, COUNT(*) AS count FROM journal_entries GROUP BY status
    `);

    const totalRevenue = Number(revenue.rows[0]?.total || 0);
    const totalExpenses = Number(expenses.rows[0]?.total || 0);

    return {
      total_assets: Number(assets.rows[0]?.total || 0),
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_income: totalRevenue - totalExpenses,
      recent_entries: recent.rows,
      entry_counts: counts.rows,
      asset_composition: assetComposition.rows.map(r => ({ name: r.name, value: Number(r.value) })),
      trend_data: trendData.rows.map(r => ({ month: r.month, revenue: Number(r.revenue), expenses: Number(r.expenses) })),
    };
  },
};
