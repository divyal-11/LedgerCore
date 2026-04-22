-- ACID Transaction: Post a journal entry
-- Everything inside BEGIN...COMMIT is atomic
-- If the trigger fn_check_balanced_entry fails, EVERYTHING rolls back

BEGIN;

  -- 1. Create journal header
  INSERT INTO journal_entries (entry_date, description, reference, period_id)
  VALUES ($1, $2, $3, $4)
  RETURNING id INTO v_entry_id;

  -- 2. Insert debit line
  INSERT INTO journal_lines (entry_id, account_id, line_number, description, debit, credit)
  VALUES (v_entry_id, $5, 1, $6, $7, 0);

  -- 3. Insert credit line
  INSERT INTO journal_lines (entry_id, account_id, line_number, description, debit, credit)
  VALUES (v_entry_id, $8, 2, $9, 0, $10);

  -- 4. Mark as POSTED (trigger fires here, validates balance)
  UPDATE journal_entries
  SET status = 'POSTED', posted_at = now()
  WHERE id = v_entry_id;

  -- 5. Refresh the materialized view
  PERFORM fn_refresh_trial_balance();

COMMIT;
-- If any step fails (especially the balance trigger), entire transaction rolls back
