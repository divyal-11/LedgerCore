-- ============================================================
-- CHART OF ACCOUNTS (Self-Referential Tree)
-- ============================================================
CREATE TABLE accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  type          account_type NOT NULL,
  normal_balance account_normal_balance NOT NULL,
  parent_id     UUID REFERENCES accounts(id),
  is_leaf       BOOLEAN NOT NULL DEFAULT true,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  depth         INTEGER NOT NULL DEFAULT 0,
  path          TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE accounts
  ADD CONSTRAINT fk_accounts_parent
  FOREIGN KEY (parent_id) REFERENCES accounts(id)
  DEFERRABLE INITIALLY DEFERRED;
