-- P&L Statement: Pure SQL with CTEs
-- Groups revenue and expense accounts, computes net income for a date range

WITH
  revenue AS (
    SELECT a.id, a.code, a.name,
      COALESCE(SUM(jl.credit - jl.debit), 0) AS amount
    FROM accounts a
    LEFT JOIN journal_lines jl ON jl.account_id = a.id
    LEFT JOIN journal_entries je
      ON je.id = jl.entry_id
      AND je.status = 'POSTED'
      AND je.entry_date BETWEEN $1 AND $2
    WHERE a.type = 'REVENUE' AND a.is_leaf = true
    GROUP BY a.id, a.code, a.name
  ),
  expenses AS (
    SELECT a.id, a.code, a.name,
      COALESCE(SUM(jl.debit - jl.credit), 0) AS amount
    FROM accounts a
    LEFT JOIN journal_lines jl ON jl.account_id = a.id
    LEFT JOIN journal_entries je
      ON je.id = jl.entry_id
      AND je.status = 'POSTED'
      AND je.entry_date BETWEEN $1 AND $2
    WHERE a.type = 'EXPENSE' AND a.is_leaf = true
    GROUP BY a.id, a.code, a.name
  ),
  totals AS (
    SELECT
      (SELECT COALESCE(SUM(amount), 0) FROM revenue) AS total_revenue,
      (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS total_expenses
  )
SELECT
  'REVENUE'        AS section, r.code, r.name, r.amount, NULL::numeric AS subtotal
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
ORDER BY section, code;
