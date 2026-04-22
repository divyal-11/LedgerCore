-- Window Function: Running balance per account (like a bank statement)
-- Uses SUM() OVER with ROWS UNBOUNDED PRECEDING

SELECT
  je.entry_date,
  je.entry_number,
  je.description                                AS transaction_desc,
  jl.description                                AS line_desc,
  jl.debit,
  jl.credit,
  -- Running balance respects the account's normal balance type
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
JOIN accounts a         ON a.id  = jl.account_id
WHERE jl.account_id = $1          -- parameterized
  AND je.status = 'POSTED'
ORDER BY je.entry_date, je.entry_number, jl.line_number;
