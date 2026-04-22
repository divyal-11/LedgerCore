const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Accounts
  getAccounts: () => fetchApi<Account[]>('/api/accounts'),
  getAccountTree: () => fetchApi<AccountTreeNode[]>('/api/accounts/tree'),
  getAccount: (id: string) => fetchApi<Account>(`/api/accounts/${id}`),
  getAccountLedger: (id: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<LedgerEntry[]>(`/api/accounts/${id}/ledger${qs}`);
  },
  getAccountBalance: (id: string) => fetchApi<AccountBalance>(`/api/accounts/${id}/balance`),
  createAccount: (data: CreateAccountData) =>
    fetchApi<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(data) }),

  // Journal
  getJournalEntries: (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return fetchApi<JournalEntry[]>(`/api/journal${qs}`);
  },
  getJournalEntry: (id: string) => fetchApi<JournalEntryDetail>(`/api/journal/${id}`),
  createJournalEntry: (data: CreateJournalEntryData) =>
    fetchApi<JournalEntryDetail>('/api/journal', { method: 'POST', body: JSON.stringify(data) }),
  postJournalEntry: (id: string) =>
    fetchApi<JournalEntryDetail>(`/api/journal/${id}/post`, { method: 'POST' }),
  voidJournalEntry: (id: string) =>
    fetchApi(`/api/journal/${id}/void`, { method: 'POST' }),

  // Statements
  getTrialBalance: () => fetchApi<TrialBalanceData>('/api/statements/trial-balance'),
  refreshTrialBalance: () => fetchApi('/api/statements/trial-balance/refresh'),
  getProfitLoss: (from: string, to: string) =>
    fetchApi<ProfitLossData>(`/api/statements/profit-loss?from=${from}&to=${to}`),
  getBalanceSheet: (asOf: string) =>
    fetchApi<BalanceSheetData>(`/api/statements/balance-sheet?as_of=${asOf}`),
  getDashboard: () => fetchApi<DashboardData>('/api/statements/dashboard'),

  // Periods
  getPeriods: () => fetchApi<FiscalPeriod[]>('/api/periods'),
  createPeriod: (data: { name: string; start_date: string; end_date: string }) =>
    fetchApi<FiscalPeriod>('/api/periods', { method: 'POST', body: JSON.stringify(data) }),
  closePeriod: (id: string) => fetchApi<FiscalPeriod>(`/api/periods/${id}/close`, { method: 'POST' }),
};

// Types
export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  normal_balance: string;
  parent_id: string | null;
  is_leaf: boolean;
  is_active: boolean;
  depth: number;
  path: string;
}

export interface AccountTreeNode extends Account {
  indented_name: string;
}

export interface AccountBalance extends Account {
  total_debits: string;
  total_credits: string;
  balance: string;
}

export interface LedgerEntry {
  entry_date: string;
  entry_number: number;
  transaction_desc: string;
  line_desc: string;
  debit: string;
  credit: string;
  running_balance: string;
}

export interface JournalEntry {
  id: string;
  entry_number: number;
  entry_date: string;
  description: string;
  reference: string;
  status: string;
  total_debits: string;
  total_credits: string;
  total_amount?: string;
  line_count: string;
  created_at: string;
}

export interface JournalLine {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  line_number: number;
  description: string;
  debit: string;
  credit: string;
}

export interface JournalEntryDetail extends JournalEntry {
  lines: JournalLine[];
}

export interface CreateAccountData {
  code: string;
  name: string;
  type: string;
  normal_balance: string;
  parent_id?: string;
  description?: string;
}

export interface CreateJournalEntryData {
  entry_date: string;
  description: string;
  reference?: string;
  period_id?: string;
  auto_post?: boolean;
  lines: { account_id: string; description?: string; debit: number; credit: number }[];
}

export interface TrialBalanceRow {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
  total_debits: string;
  total_credits: string;
  balance: string;
}

export interface TrialBalanceData {
  rows: TrialBalanceRow[];
  totals: { total_debits: number; total_credits: number };
  is_balanced: boolean;
}

export interface ProfitLossData {
  period: { from: string; to: string };
  rows: { section: string; code: string | null; name: string; amount: string | null; subtotal: string | null }[];
}

export interface BalanceSheetData {
  as_of: string;
  assets: { code: string; name: string; balance: string }[];
  liabilities: { code: string; name: string; balance: string }[];
  equity: { code: string; name: string; balance: string }[];
  totals: {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    total_liabilities_and_equity: number;
  };
  is_balanced: boolean;
}

export interface DashboardData {
  total_assets: number;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  recent_entries: JournalEntry[];
  entry_counts: { status: string; count: string }[];
  asset_composition: { name: string; value: number }[];
  trend_data: { month: string; revenue: number; expenses: number }[];
}

export interface FiscalPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}
