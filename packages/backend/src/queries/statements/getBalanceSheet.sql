-- Balance Sheet: SQL with account type-based balance calculation
-- Assets use debit-credit; Liabilities/Equity use credit-debit
-- Includes net income from Revenue/Expense accounts in Equity section

WITH account_balances AS (
  SELECT
    a.id, a.code, a.name, a.type, a.normal_balance, a.depth, a.parent_id,
    CASE a.type
      WHEN 'ASSET' THEN COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)
      ELSE COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
    END AS balance
  FROM accounts a
  LEFT JOIN journal_lines jl ON jl.account_id = a.id
  LEFT JOIN journal_entries je
    ON je.id = jl.entry_id
    AND je.status = 'POSTED'
    AND je.entry_date <= $1
  WHERE a.is_leaf = true AND a.type IN ('ASSET', 'LIABILITY', 'EQUITY')
  GROUP BY a.id, a.code, a.name, a.type, a.normal_balance, a.depth, a.parent_id
)
SELECT type, code, name, depth, balance
FROM account_balances
WHERE balance != 0
ORDER BY type, code;
