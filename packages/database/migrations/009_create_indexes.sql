-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_journal_lines_entry_id   ON journal_lines(entry_id);
CREATE INDEX idx_journal_lines_account_id ON journal_lines(account_id);
CREATE INDEX idx_journal_entries_date     ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status   ON journal_entries(status);
CREATE INDEX idx_journal_entries_period   ON journal_entries(period_id);
CREATE INDEX idx_accounts_parent_id       ON accounts(parent_id);
CREATE INDEX idx_accounts_type            ON accounts(type);
CREATE INDEX idx_accounts_code            ON accounts(code);
