-- ============================================================
-- MATERIALIZED VIEW: TRIAL BALANCE
-- ============================================================
CREATE MATERIALIZED VIEW mv_trial_balance AS
SELECT
  a.id            AS account_id,
  a.code          AS account_code,
  a.name          AS account_name,
  a.type          AS account_type,
  a.normal_balance,
  COALESCE(SUM(jl.debit), 0)   AS total_debits,
  COALESCE(SUM(jl.credit), 0)  AS total_credits,
  CASE a.normal_balance
    WHEN 'DEBIT'  THEN COALESCE(SUM(jl.debit), 0)  - COALESCE(SUM(jl.credit), 0)
    WHEN 'CREDIT' THEN COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)
  END AS balance
FROM accounts a
LEFT JOIN journal_lines jl  ON jl.account_id = a.id
LEFT JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'POSTED'
WHERE a.is_leaf = true
GROUP BY a.id, a.code, a.name, a.type, a.normal_balance
WITH DATA;

CREATE UNIQUE INDEX idx_mv_trial_balance_account_id ON mv_trial_balance(account_id);

-- Refresh function called after posting journal entries
CREATE OR REPLACE FUNCTION fn_refresh_trial_balance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trial_balance;
END;
$$ LANGUAGE plpgsql;
