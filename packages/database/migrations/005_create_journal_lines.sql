-- ============================================================
-- JOURNAL LINES (Debit/Credit Lines)
-- ============================================================
CREATE TABLE journal_lines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id     UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id   UUID NOT NULL REFERENCES accounts(id),
  line_number  INTEGER NOT NULL,
  description  TEXT,
  debit        NUMERIC(19, 4) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit       NUMERIC(19, 4) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  CONSTRAINT chk_debit_or_credit
    CHECK (
      (debit > 0 AND credit = 0) OR
      (credit > 0 AND debit = 0)
    ),
  CONSTRAINT chk_nonzero
    CHECK (debit + credit > 0),
  CONSTRAINT uq_entry_line UNIQUE (entry_id, line_number)
);
