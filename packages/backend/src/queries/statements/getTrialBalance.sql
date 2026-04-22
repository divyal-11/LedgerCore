-- Trial Balance from Materialized View
-- Pre-computed for speed; refreshed on demand after posting entries

SELECT * FROM mv_trial_balance ORDER BY account_code;
