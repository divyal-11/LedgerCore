-- ============================================================
-- SEED: CHART OF ACCOUNTS (GAAP-style)
-- ============================================================
INSERT INTO accounts (id, code, name, type, normal_balance, is_leaf, parent_id, depth, path) VALUES
-- ASSETS
('10000000-0000-0000-0000-000000000001', '1000', 'Assets',                        'ASSET',     'DEBIT',  false, NULL, 0, '1000'),
('11000000-0000-0000-0000-000000000001', '1100', 'Current Assets',                'ASSET',     'DEBIT',  false, '10000000-0000-0000-0000-000000000001', 1, '1000 > Current Assets'),
('11100000-0000-0000-0000-000000000001', '1110', 'Cash and Cash Equivalents',     'ASSET',     'DEBIT',  true,  '11000000-0000-0000-0000-000000000001', 2, '1000 > Current Assets > Cash and Cash Equivalents'),
('11200000-0000-0000-0000-000000000001', '1120', 'Accounts Receivable',           'ASSET',     'DEBIT',  true,  '11000000-0000-0000-0000-000000000001', 2, '1000 > Current Assets > Accounts Receivable'),
('11300000-0000-0000-0000-000000000001', '1130', 'Inventory',                     'ASSET',     'DEBIT',  true,  '11000000-0000-0000-0000-000000000001', 2, '1000 > Current Assets > Inventory'),
('11400000-0000-0000-0000-000000000001', '1140', 'Prepaid Expenses',              'ASSET',     'DEBIT',  true,  '11000000-0000-0000-0000-000000000001', 2, '1000 > Current Assets > Prepaid Expenses'),
('12000000-0000-0000-0000-000000000001', '1200', 'Fixed Assets',                  'ASSET',     'DEBIT',  false, '10000000-0000-0000-0000-000000000001', 1, '1000 > Fixed Assets'),
('12100000-0000-0000-0000-000000000001', '1210', 'Equipment',                     'ASSET',     'DEBIT',  true,  '12000000-0000-0000-0000-000000000001', 2, '1000 > Fixed Assets > Equipment'),
('12110000-0000-0000-0000-000000000001', '1211', 'Accumulated Depreciation - Equipment', 'ASSET', 'CREDIT', true, '12000000-0000-0000-0000-000000000001', 2, '1000 > Fixed Assets > Accumulated Depreciation - Equipment'),

-- LIABILITIES
('20000000-0000-0000-0000-000000000001', '2000', 'Liabilities',                   'LIABILITY', 'CREDIT', false, NULL, 0, '2000'),
('21000000-0000-0000-0000-000000000001', '2100', 'Current Liabilities',           'LIABILITY', 'CREDIT', false, '20000000-0000-0000-0000-000000000001', 1, '2000 > Current Liabilities'),
('21100000-0000-0000-0000-000000000001', '2110', 'Accounts Payable',              'LIABILITY', 'CREDIT', true,  '21000000-0000-0000-0000-000000000001', 2, '2000 > Current Liabilities > Accounts Payable'),
('21200000-0000-0000-0000-000000000001', '2120', 'Accrued Liabilities',           'LIABILITY', 'CREDIT', true,  '21000000-0000-0000-0000-000000000001', 2, '2000 > Current Liabilities > Accrued Liabilities'),
('21300000-0000-0000-0000-000000000001', '2130', 'Unearned Revenue',              'LIABILITY', 'CREDIT', true,  '21000000-0000-0000-0000-000000000001', 2, '2000 > Current Liabilities > Unearned Revenue'),

-- EQUITY
('30000000-0000-0000-0000-000000000001', '3000', 'Equity',                        'EQUITY',    'CREDIT', false, NULL, 0, '3000'),
('31000000-0000-0000-0000-000000000001', '3100', 'Common Stock',                  'EQUITY',    'CREDIT', true,  '30000000-0000-0000-0000-000000000001', 1, '3000 > Common Stock'),
('32000000-0000-0000-0000-000000000001', '3200', 'Retained Earnings',             'EQUITY',    'CREDIT', true,  '30000000-0000-0000-0000-000000000001', 1, '3000 > Retained Earnings'),
('33000000-0000-0000-0000-000000000001', '3300', 'Dividends Paid',                'EQUITY',    'DEBIT',  true,  '30000000-0000-0000-0000-000000000001', 1, '3000 > Dividends Paid'),

-- REVENUE
('40000000-0000-0000-0000-000000000001', '4000', 'Revenue',                       'REVENUE',   'CREDIT', false, NULL, 0, '4000'),
('41000000-0000-0000-0000-000000000001', '4100', 'Sales Revenue',                 'REVENUE',   'CREDIT', true,  '40000000-0000-0000-0000-000000000001', 1, '4000 > Sales Revenue'),
('42000000-0000-0000-0000-000000000001', '4200', 'Service Revenue',               'REVENUE',   'CREDIT', true,  '40000000-0000-0000-0000-000000000001', 1, '4000 > Service Revenue'),
('49000000-0000-0000-0000-000000000001', '4900', 'Other Income',                  'REVENUE',   'CREDIT', true,  '40000000-0000-0000-0000-000000000001', 1, '4000 > Other Income'),

-- EXPENSES
('50000000-0000-0000-0000-000000000001', '5000', 'Expenses',                      'EXPENSE',   'DEBIT',  false, NULL, 0, '5000'),
('51000000-0000-0000-0000-000000000001', '5100', 'Cost of Goods Sold',            'EXPENSE',   'DEBIT',  true,  '50000000-0000-0000-0000-000000000001', 1, '5000 > Cost of Goods Sold'),
('52000000-0000-0000-0000-000000000001', '5200', 'Salaries and Wages',            'EXPENSE',   'DEBIT',  true,  '50000000-0000-0000-0000-000000000001', 1, '5000 > Salaries and Wages'),
('53000000-0000-0000-0000-000000000001', '5300', 'Rent Expense',                  'EXPENSE',   'DEBIT',  true,  '50000000-0000-0000-0000-000000000001', 1, '5000 > Rent Expense'),
('54000000-0000-0000-0000-000000000001', '5400', 'Utilities Expense',             'EXPENSE',   'DEBIT',  true,  '50000000-0000-0000-0000-000000000001', 1, '5000 > Utilities Expense'),
('59000000-0000-0000-0000-000000000001', '5900', 'Other Expenses',                'EXPENSE',   'DEBIT',  true,  '50000000-0000-0000-0000-000000000001', 1, '5000 > Other Expenses');

-- ============================================================
-- SEED: FISCAL PERIODS
-- ============================================================
INSERT INTO fiscal_periods (id, name, start_date, end_date) VALUES
('a0000000-0000-0000-0000-000000000001', 'FY2024-Q1', '2024-01-01', '2024-03-31'),
('a0000000-0000-0000-0000-000000000002', 'FY2024-Q2', '2024-04-01', '2024-06-30'),
('a0000000-0000-0000-0000-000000000003', 'FY2024-Q3', '2024-07-01', '2024-09-30');

-- ============================================================
-- SEED: SAMPLE JOURNAL ENTRIES (30 realistic transactions)
-- Each JE is wrapped in BEGIN/COMMIT so the DEFERRABLE trigger
-- sees both debit + credit lines before it validates balance.
-- ============================================================

-- JE-1: Initial capital investment
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000001', '2024-01-01', 'Initial capital investment by founders', 'CAP-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-01 09:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000001', '11100000-0000-0000-0000-000000000001', 1, 100000.0000, 0, 'Cash received from founders'),
('e0000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 2, 0, 100000.0000, 'Common stock issued');
COMMIT;

-- JE-2: Purchase equipment
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000002', '2024-01-05', 'Purchase office equipment', 'PO-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-05 10:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000002', '12100000-0000-0000-0000-000000000001', 1, 50000.0000, 0, 'Equipment purchased'),
('e0000000-0000-0000-0000-000000000002', '11100000-0000-0000-0000-000000000001', 2, 0, 50000.0000, 'Cash payment for equipment');
COMMIT;

-- JE-3: Purchase inventory on credit
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000003', '2024-01-10', 'Purchase inventory from supplier on account', 'PO-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-10 11:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000003', '11300000-0000-0000-0000-000000000001', 1, 15000.0000, 0, 'Inventory received'),
('e0000000-0000-0000-0000-000000000003', '21100000-0000-0000-0000-000000000001', 2, 0, 15000.0000, 'Amount owed to supplier');
COMMIT;

-- JE-4: Sales revenue - cash
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000004', '2024-01-15', 'Product sales - cash received', 'INV-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-15 14:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000004', '11100000-0000-0000-0000-000000000001', 1, 8000.0000, 0, 'Cash from customer'),
('e0000000-0000-0000-0000-000000000004', '41000000-0000-0000-0000-000000000001', 2, 0, 8000.0000, 'Product sales revenue');
COMMIT;

-- JE-5: COGS for sale
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000005', '2024-01-15', 'Cost of goods sold for INV-001', 'COGS-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-15 14:05:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000005', '51000000-0000-0000-0000-000000000001', 1, 3000.0000, 0, 'Cost of goods sold'),
('e0000000-0000-0000-0000-000000000005', '11300000-0000-0000-0000-000000000001', 2, 0, 3000.0000, 'Inventory reduced');
COMMIT;

-- JE-6: Sales on credit
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000006', '2024-01-20', 'Service revenue billed to client', 'INV-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-20 09:30:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000006', '11200000-0000-0000-0000-000000000001', 1, 12000.0000, 0, 'Accounts receivable - client'),
('e0000000-0000-0000-0000-000000000006', '42000000-0000-0000-0000-000000000001', 2, 0, 12000.0000, 'Service revenue earned');
COMMIT;

-- JE-7: Pay rent
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000007', '2024-01-25', 'January office rent payment', 'CHK-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-25 10:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000007', '53000000-0000-0000-0000-000000000001', 1, 3000.0000, 0, 'January rent'),
('e0000000-0000-0000-0000-000000000007', '11100000-0000-0000-0000-000000000001', 2, 0, 3000.0000, 'Rent payment');
COMMIT;

-- JE-8: Pay salaries
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000008', '2024-01-31', 'January payroll', 'PAY-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-31 16:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000008', '52000000-0000-0000-0000-000000000001', 1, 8500.0000, 0, 'Salaries expense'),
('e0000000-0000-0000-0000-000000000008', '11100000-0000-0000-0000-000000000001', 2, 0, 8500.0000, 'Salary payment');
COMMIT;

-- JE-9: Utilities
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000009', '2024-01-31', 'January utilities bill', 'UTIL-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-01-31 16:30:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000009', '54000000-0000-0000-0000-000000000001', 1, 500.0000, 0, 'Electricity and water'),
('e0000000-0000-0000-0000-000000000009', '21100000-0000-0000-0000-000000000001', 2, 0, 500.0000, 'Utilities payable');
COMMIT;

-- JE-10: Customer payment on receivable
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000010', '2024-02-05', 'Customer payment on INV-002', 'REC-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-05 11:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000010', '11100000-0000-0000-0000-000000000001', 1, 12000.0000, 0, 'Cash from client'),
('e0000000-0000-0000-0000-000000000010', '11200000-0000-0000-0000-000000000001', 2, 0, 12000.0000, 'AR cleared');
COMMIT;

-- JE-11: Pay vendor
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000011', '2024-02-10', 'Vendor payment for inventory PO-002', 'CHK-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-10 09:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000011', '21100000-0000-0000-0000-000000000001', 1, 15000.0000, 0, 'AP cleared'),
('e0000000-0000-0000-0000-000000000011', '11100000-0000-0000-0000-000000000001', 2, 0, 15000.0000, 'Cash payment to vendor');
COMMIT;

-- JE-12: February product sales
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000012', '2024-02-15', 'February product sales - cash', 'INV-003', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-15 13:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000012', '11100000-0000-0000-0000-000000000001', 1, 15000.0000, 0, 'Cash from sales'),
('e0000000-0000-0000-0000-000000000012', '41000000-0000-0000-0000-000000000001', 2, 0, 15000.0000, 'Product sales');
COMMIT;

-- JE-13: COGS for Feb
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000013', '2024-02-15', 'Cost of goods sold for INV-003', 'COGS-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-15 13:05:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000013', '51000000-0000-0000-0000-000000000001', 1, 5500.0000, 0, 'Cost of goods sold'),
('e0000000-0000-0000-0000-000000000013', '11300000-0000-0000-0000-000000000001', 2, 0, 5500.0000, 'Inventory reduced');
COMMIT;

-- JE-14: Service revenue on credit
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000014', '2024-02-20', 'Consulting services rendered', 'INV-004', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-20 10:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000014', '11200000-0000-0000-0000-000000000001', 1, 8000.0000, 0, 'AR from consulting'),
('e0000000-0000-0000-0000-000000000014', '42000000-0000-0000-0000-000000000001', 2, 0, 8000.0000, 'Consulting revenue');
COMMIT;

-- JE-15: February rent
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000015', '2024-02-25', 'February office rent payment', 'CHK-003', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-25 10:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000015', '53000000-0000-0000-0000-000000000001', 1, 3000.0000, 0, 'February rent'),
('e0000000-0000-0000-0000-000000000015', '11100000-0000-0000-0000-000000000001', 2, 0, 3000.0000, 'Rent payment');
COMMIT;

-- JE-16: February payroll
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000016', '2024-02-29', 'February payroll', 'PAY-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-29 16:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000016', '52000000-0000-0000-0000-000000000001', 1, 8500.0000, 0, 'Salaries expense'),
('e0000000-0000-0000-0000-000000000016', '11100000-0000-0000-0000-000000000001', 2, 0, 8500.0000, 'Salary payment');
COMMIT;

-- JE-17: Other income
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000017', '2024-02-29', 'Interest income earned', 'INT-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-29 17:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000017', '11100000-0000-0000-0000-000000000001', 1, 250.0000, 0, 'Interest received'),
('e0000000-0000-0000-0000-000000000017', '49000000-0000-0000-0000-000000000001', 2, 0, 250.0000, 'Interest income');
COMMIT;

-- JE-18: Prepaid insurance
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000018', '2024-03-01', 'Annual insurance premium prepaid', 'INS-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-01 09:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000018', '11400000-0000-0000-0000-000000000001', 1, 6000.0000, 0, 'Prepaid insurance 12 months'),
('e0000000-0000-0000-0000-000000000018', '11100000-0000-0000-0000-000000000001', 2, 0, 6000.0000, 'Cash payment');
COMMIT;

-- JE-19: March sales
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000019', '2024-03-10', 'March product sales', 'INV-005', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-10 14:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000019', '11100000-0000-0000-0000-000000000001', 1, 20000.0000, 0, 'Cash from sales'),
('e0000000-0000-0000-0000-000000000019', '41000000-0000-0000-0000-000000000001', 2, 0, 20000.0000, 'Product sales');
COMMIT;

-- JE-20: COGS for Mar
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000020', '2024-03-10', 'Cost of goods sold for INV-005', 'COGS-003', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-10 14:05:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000020', '51000000-0000-0000-0000-000000000001', 1, 7000.0000, 0, 'COGS'),
('e0000000-0000-0000-0000-000000000020', '11300000-0000-0000-0000-000000000001', 2, 0, 7000.0000, 'Inventory reduced');
COMMIT;

-- JE-21: Service project billed
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000021', '2024-03-15', 'Software development project billed', 'INV-006', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-15 09:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000021', '11200000-0000-0000-0000-000000000001', 1, 25000.0000, 0, 'AR billed'),
('e0000000-0000-0000-0000-000000000021', '42000000-0000-0000-0000-000000000001', 2, 0, 25000.0000, 'Dev project revenue');
COMMIT;

-- JE-22: March rent
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000022', '2024-03-25', 'March office rent', 'CHK-004', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-25 10:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000022', '53000000-0000-0000-0000-000000000001', 1, 3000.0000, 0, 'March rent'),
('e0000000-0000-0000-0000-000000000022', '11100000-0000-0000-0000-000000000001', 2, 0, 3000.0000, 'Rent payment');
COMMIT;

-- JE-23: March payroll
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000023', '2024-03-31', 'March payroll', 'PAY-003', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-31 16:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000023', '52000000-0000-0000-0000-000000000001', 1, 9000.0000, 0, 'Salaries - March (raise)'),
('e0000000-0000-0000-0000-000000000023', '11100000-0000-0000-0000-000000000001', 2, 0, 9000.0000, 'Payroll disbursement');
COMMIT;

-- JE-24: March utilities
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000024', '2024-03-31', 'March utilities', 'UTIL-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-31 16:30:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000024', '54000000-0000-0000-0000-000000000001', 1, 650.0000, 0, 'March utilities'),
('e0000000-0000-0000-0000-000000000024', '21100000-0000-0000-0000-000000000001', 2, 0, 650.0000, 'Utilities payable');
COMMIT;

-- JE-25: Depreciation
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000025', '2024-03-31', 'Q1 equipment depreciation', 'DEP-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-31 17:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000025', '59000000-0000-0000-0000-000000000001', 1, 2500.0000, 0, 'Depreciation expense Q1'),
('e0000000-0000-0000-0000-000000000025', '12110000-0000-0000-0000-000000000001', 2, 0, 2500.0000, 'Accum depreciation');
COMMIT;

-- JE-26: Customer collection
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000026', '2024-03-20', 'Collected on INV-004', 'REC-002', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-20 11:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000026', '11100000-0000-0000-0000-000000000001', 1, 8000.0000, 0, 'Cash received'),
('e0000000-0000-0000-0000-000000000026', '11200000-0000-0000-0000-000000000001', 2, 0, 8000.0000, 'AR cleared');
COMMIT;

-- JE-27: Unearned revenue received
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000027', '2024-02-01', 'Advance payment for annual support contract', 'ADV-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-02-01 09:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000027', '11100000-0000-0000-0000-000000000001', 1, 12000.0000, 0, 'Cash advance received'),
('e0000000-0000-0000-0000-000000000027', '21300000-0000-0000-0000-000000000001', 2, 0, 12000.0000, 'Unearned revenue - support');
COMMIT;

-- JE-28: Recognize portion of unearned revenue
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000028', '2024-03-31', 'Recognize 2 months of support revenue', 'REV-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-31 17:30:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000028', '21300000-0000-0000-0000-000000000001', 1, 2000.0000, 0, 'Unearned rev recognized'),
('e0000000-0000-0000-0000-000000000028', '42000000-0000-0000-0000-000000000001', 2, 0, 2000.0000, 'Support revenue earned');
COMMIT;

-- JE-29: Accrue liabilities
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000029', '2024-03-31', 'Accrue Q1 bonus liability', 'ACC-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-31 18:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000029', '52000000-0000-0000-0000-000000000001', 1, 3500.0000, 0, 'Bonus expense accrual'),
('e0000000-0000-0000-0000-000000000029', '21200000-0000-0000-0000-000000000001', 2, 0, 3500.0000, 'Accrued bonus payable');
COMMIT;

-- JE-30: Misc expense
BEGIN;
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status, posted_at) VALUES
('e0000000-0000-0000-0000-000000000030', '2024-03-15', 'Office supplies purchased', 'EXP-001', 'a0000000-0000-0000-0000-000000000001', 'POSTED', '2024-03-15 11:00:00+00');
INSERT INTO journal_lines (entry_id, account_id, line_number, debit, credit, description) VALUES
('e0000000-0000-0000-0000-000000000030', '59000000-0000-0000-0000-000000000001', 1, 750.0000, 0, 'Office supplies'),
('e0000000-0000-0000-0000-000000000030', '11100000-0000-0000-0000-000000000001', 2, 0, 750.0000, 'Cash payment');
COMMIT;

-- One draft entry for demo purposes (no lines needed — no trigger validation)
INSERT INTO journal_entries (id, entry_date, description, reference, period_id, status) VALUES
('e0000000-0000-0000-0000-000000000031', '2024-03-31', 'Pending vendor invoice review', 'DRAFT-001', 'a0000000-0000-0000-0000-000000000001', 'DRAFT');

-- Refresh materialized view after all seeds
REFRESH MATERIALIZED VIEW mv_trial_balance;
