# LedgerCore — Double-Entry Accounting Engine

> PostgreSQL · Node.js · Next.js · TypeScript · Docker  
> *Every debit has a credit. Every query is a story.*

---

## What Is LedgerCore?

LedgerCore is a **production-grade double-entry bookkeeping engine** where:

- Every financial transaction is recorded as a **journal entry** with balanced debits and credits
- The sum of all debits **always equals** the sum of all credits — enforced at the **database constraint level**
- The entire P&L, Balance Sheet, and Trial Balance are generated **purely from SQL**
- The chart of accounts is a **recursive tree** traversed with CTEs
- Running balances are computed with **window functions**, not application loops

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  NEXT.JS 14 FRONTEND (http://localhost:3000)                   │
│  Dashboard │ Chart of Accounts │ Journal Entries │ Statements  │
├────────────────────────────────────────────────────────────────┤
│  NODE.JS + EXPRESS BACKEND (http://localhost:3001)              │
│  /api/accounts │ /api/journal │ /api/statements │ /api/periods │
├────────────────────────────────────────────────────────────────┤
│  POSTGRESQL 15 DATABASE                                        │
│  Recursive CTEs │ Window Functions │ Constraint Triggers       │
│  Materialized Views │ ACID Transactions │ CHECK Constraints    │
└────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 14 + TypeScript | App Router, SSR |
| Styling | Vanilla CSS (dark theme) | Bloomberg Terminal-inspired |
| Backend | Node.js + Express | Thin API layer |
| Database | PostgreSQL 15 | CTEs, window functions, triggers |
| DB Driver | `pg` (node-postgres) | Raw SQL — no ORM |
| Container | Docker + Docker Compose | Reproducible environments |

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd ledgercore

# 2. Copy environment file
cp .env.example .env

# 3. Start everything
docker compose up --build -d

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001/api/health
```

That's it. The database automatically runs all migrations and seeds on first start.

## Features

### Database Layer (9 Migrations)
- **Enums**: `account_type`, `account_normal_balance`, `entry_status`
- **Accounts table**: Self-referential tree with depth, path, parent FK (deferred)
- **Fiscal periods**: Date CHECK constraint, close functionality
- **Journal entries**: Status lifecycle (DRAFT → POSTED → VOID)
- **Journal lines**: Debit-or-credit constraint, non-zero check, unique line numbers
- **Balance trigger**: `fn_check_balanced_entry()` — database-enforced double-entry
- **Materialized view**: `mv_trial_balance` with concurrent refresh
- **Seed data**: 28 GAAP accounts, 3 fiscal periods, 30 realistic transactions
- **Performance indexes**: On all frequently queried columns

### Backend API (18 Endpoints)

| Module | Endpoints |
|--------|-----------|
| **Accounts** | List, tree (CTE), detail, ledger (window fn), balance, create, deactivate |
| **Journal** | List (filterable), detail, create (ACID), post, void (with auto-reversal) |
| **Statements** | Trial balance (materialized view), refresh, P&L (CTE), balance sheet, dashboard |
| **Periods** | List, detail, create, close, summary |

### Frontend (9 Pages)

| Page | Key Feature |
|------|-------------|
| **Dashboard** | 4 KPI cards, dynamic Recharts visualizations (Revenue vs Expenses Trend & Asset Composition Donut), recent entries |
| **Chart of Accounts** | Recursive tree with indentation, account creation CRUD form, clickable leaf accounts |
| **Account Detail** | Individual account ledger with running balance and custom date range filtering |
| **General Ledger** | Account selector + full transaction history with custom date range filtering |
| **Journal Entries** | Filterable list (All/Posted/Draft/Void) |
| **New Journal Entry** | ⭐ Live balance indicator, dynamic lines, auto-post |
| **Fiscal Periods** | Create new periods and securely close finished periods |
| **Trial Balance** | Materialized view data, refresh button, balance check |
| **Profit & Loss** | Date range picker, revenue/expense sections, net income |
| **Balance Sheet** | As-of date, A=L+E verification, net income in equity |

## SQL Concepts Demonstrated

### 1. Recursive CTE — Account Tree
```sql
WITH RECURSIVE account_tree AS (
  SELECT id, code, name, depth, ARRAY[id] AS ancestors
  FROM accounts WHERE parent_id IS NULL
  UNION ALL
  SELECT a.id, a.code, a.name, at.depth + 1, at.ancestors || a.id
  FROM accounts a JOIN account_tree at ON a.parent_id = at.id
)
SELECT * FROM account_tree ORDER BY path;
```

### 2. Window Functions — Running Balance
```sql
SUM(CASE a.normal_balance
  WHEN 'DEBIT'  THEN jl.debit - jl.credit
  WHEN 'CREDIT' THEN jl.credit - jl.debit
END) OVER (
  PARTITION BY jl.account_id
  ORDER BY je.entry_date, je.entry_number
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
) AS running_balance
```

### 3. Constraint Trigger — Balance Enforcement
```sql
CREATE CONSTRAINT TRIGGER trg_balanced_entry
  AFTER INSERT OR UPDATE ON journal_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION fn_check_balanced_entry();
```

### 4. Materialized View — Pre-computed Trial Balance
```sql
CREATE MATERIALIZED VIEW mv_trial_balance AS
SELECT a.id, a.code, a.name, SUM(jl.debit), SUM(jl.credit)
FROM accounts a LEFT JOIN journal_lines jl ON ...
GROUP BY a.id;
-- Refreshed with: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trial_balance;
```

### 5. ACID Transactions — Atomic Posting
```
BEGIN → INSERT journal_entry → INSERT lines → trigger validates → UPDATE status → COMMIT
(If trigger rejects, entire transaction rolls back)
```

## Project Structure

```
ledgercore/
├── docker-compose.yml
├── .env / .env.example
├── packages/
│   ├── database/
│   │   └── migrations/          # 9 SQL migration files + seeds
│   ├── backend/
│   │   └── src/
│   │       ├── config/          # Database pool
│   │       ├── middleware/      # Error handler, logger, validation
│   │       ├── routes/          # accounts, journal, statements, periods
│   │       ├── services/        # Business logic + SQL queries
│   │       └── queries/         # Raw SQL files (reference)
│   └── frontend/
│       └── src/
│           ├── app/             # Next.js App Router pages
│           │   └── (dashboard)/ # Sidebar layout + all pages
│           └── lib/             # API client, formatters
```

## API Examples

### Create a Journal Entry
```bash
curl -X POST http://localhost:3001/api/journal \
  -H "Content-Type: application/json" \
  -d '{
    "entry_date": "2024-04-01",
    "description": "Office supplies purchased",
    "auto_post": true,
    "lines": [
      {"account_id": "<expense-uuid>", "debit": 500, "credit": 0},
      {"account_id": "<cash-uuid>", "debit": 0, "credit": 500}
    ]
  }'
```

### Get Trial Balance
```bash
curl http://localhost:3001/api/statements/trial-balance
```

### Get P&L for Q1 2024
```bash
curl "http://localhost:3001/api/statements/profit-loss?from=2024-01-01&to=2024-03-31"
```

## Design System

- **Theme**: Financial Dark (Bloomberg Terminal-inspired)
- **Colors**: Navy background, blue accents, green credits, red debits, amber warnings, purple equity
- **Typography**: JetBrains Mono (numbers), Inter (body), Space Grotesk (headers)
- **Components**: KPI cards, data tables, badges, balance indicators, statement sections

---

*LedgerCore — Where every debit tells half the story.*  
*Built with PostgreSQL, Node.js, Next.js, and a deep respect for double-entry bookkeeping.*
