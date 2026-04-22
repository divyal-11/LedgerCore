-- ============================================================
-- CRITICAL CONSTRAINT: DEBITS MUST EQUAL CREDITS PER ENTRY
-- ============================================================
CREATE OR REPLACE FUNCTION fn_check_balanced_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_total_debits  NUMERIC;
  v_total_credits NUMERIC;
BEGIN
  SELECT
    COALESCE(SUM(debit), 0),
    COALESCE(SUM(credit), 0)
  INTO v_total_debits, v_total_credits
  FROM journal_lines
  WHERE entry_id = NEW.entry_id;

  IF v_total_debits <> v_total_credits THEN
    RAISE EXCEPTION
      'Journal entry % is unbalanced: debits=% credits=%',
      NEW.entry_id, v_total_debits, v_total_credits;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_balanced_entry
  AFTER INSERT OR UPDATE ON journal_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION fn_check_balanced_entry();
