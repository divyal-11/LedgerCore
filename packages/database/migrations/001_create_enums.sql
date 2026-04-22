-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE account_normal_balance AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE entry_status AS ENUM ('DRAFT', 'POSTED', 'VOID');
