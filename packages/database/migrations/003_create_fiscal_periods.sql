-- ============================================================
-- FISCAL PERIODS
-- ============================================================
CREATE TABLE fiscal_periods (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  is_closed  BOOLEAN NOT NULL DEFAULT false,
  closed_at  TIMESTAMPTZ,
  CONSTRAINT chk_period_dates CHECK (end_date > start_date)
);
