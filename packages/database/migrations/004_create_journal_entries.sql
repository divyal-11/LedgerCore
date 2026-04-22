-- ============================================================
-- JOURNAL ENTRIES (Transaction Header)
-- ============================================================
CREATE TABLE journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number  SERIAL UNIQUE NOT NULL,
  entry_date    DATE NOT NULL,
  description   TEXT NOT NULL,
  reference     VARCHAR(100),
  period_id     UUID REFERENCES fiscal_periods(id),
  status        entry_status NOT NULL DEFAULT 'DRAFT',
  posted_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_posted_has_date
    CHECK (status != 'POSTED' OR posted_at IS NOT NULL)
);
