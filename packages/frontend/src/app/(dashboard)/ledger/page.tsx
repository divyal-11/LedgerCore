'use client';

import { useEffect, useState } from 'react';
import { api, Account, LedgerEntry } from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2024-01-01');
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [accountInfo, setAccountInfo] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    api.getAccounts()
      .then(accts => setAccounts(accts.filter((a: Account) => a.is_leaf)))
      .catch(console.error)
      .finally(() => setLoadingAccounts(false));
  }, []);

  const loadLedger = async (accountId: string, from: string, to: string) => {
    if (!accountId) return;
    setLoading(true);
    setSelectedAccount(accountId);
    try {
      const [entries, info] = await Promise.all([
        api.getAccountLedger(accountId, from, to),
        api.getAccount(accountId),
      ]);
      setLedger(entries);
      setAccountInfo(info);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when dependencies change
  useEffect(() => {
    if (selectedAccount) {
      loadLedger(selectedAccount, fromDate, toDate);
    }
  }, [selectedAccount, fromDate, toDate]);

  if (loadingAccounts) return <div className="loading">Loading accounts...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>General Ledger</h1>
        <p>Account ledger with running balance — powered by SQL window functions</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '250px', margin: 0 }}>
            <label className="form-label">Select Account</label>
            <select
              className="form-select"
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
            >
              <option value="">Choose an account to view its ledger...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ width: '160px', margin: 0 }}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          
          <div className="form-group" style={{ width: '160px', margin: 0 }}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>
      </div>

      {accountInfo && (
        <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
              <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '16px' }}>{accountInfo.code}</span>{' '}
              {accountInfo.name}
            </div>
          </div>
          <div>
            <span className={`badge badge-${accountInfo.type}`}>{accountInfo.type}</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Normal Balance</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: accountInfo.normal_balance === 'DEBIT' ? 'var(--color-accent-red)' : 'var(--color-accent-green)' }}>
              {accountInfo.normal_balance}
            </div>
          </div>
          {ledger.length > 0 && (
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Balance</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--color-accent-blue)' }}>
                {formatCurrency(ledger[ledger.length - 1].running_balance)}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && <div className="loading" style={{ margin: '40px 0' }}>Loading ledger entries...</div>}

      {!loading && selectedAccount && (
        <div className="card fade-in">
          {ledger.length === 0 ? (
            <div className="empty-state">
              <h3>No transactions found</h3>
              <p>This account has no posted journal entries for the selected period</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>JE #</th>
                  <th>Description</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                  <th className="text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'var(--color-bg-tertiary)' }}>
                  <td colSpan={5} style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Opening Balance</td>
                  <td className="amount" style={{ fontWeight: 600 }}>$0.00</td>
                </tr>
                {ledger.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(entry.entry_date)}</td>
                    <td className="mono">JE-{String(entry.entry_number).padStart(3, '0')}</td>
                    <td>{entry.transaction_desc}{entry.line_desc ? ` — ${entry.line_desc}` : ''}</td>
                    <td className="amount debit">{formatNumber(entry.debit)}</td>
                    <td className="amount credit">{formatNumber(entry.credit)}</td>
                    <td className="amount" style={{
                      fontWeight: 700,
                      color: Number(entry.running_balance) >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                    }}>
                      {formatCurrency(entry.running_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--color-bg-tertiary)', fontWeight: 700 }}>
                  <td colSpan={3}>TOTALS ({ledger.length} transactions)</td>
                  <td className="amount debit">
                    {formatCurrency(ledger.reduce((s, e) => s + Number(e.debit), 0))}
                  </td>
                  <td className="amount credit">
                    {formatCurrency(ledger.reduce((s, e) => s + Number(e.credit), 0))}
                  </td>
                  <td className="amount" style={{ fontSize: '15px', color: 'var(--color-accent-blue)' }}>
                    {ledger.length > 0 && formatCurrency(ledger[ledger.length - 1].running_balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {!selectedAccount && (
        <div className="card fade-in">
          <div className="empty-state">
            <h3>Select an account</h3>
            <p>Choose an account above to view its transaction history with running balance</p>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Running balance is computed using SQL: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>SUM() OVER (ROWS UNBOUNDED PRECEDING)</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
