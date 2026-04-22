'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Account, LedgerEntry } from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;
  
  const [fromDate, setFromDate] = useState<string>('2024-01-01');
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [account, setAccount] = useState<Account | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAccount(accountId),
      api.getAccountLedger(accountId, fromDate, toDate),
    ])
      .then(([acct, entries]) => {
        setAccount(acct);
        setLedger(entries);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountId, fromDate, toDate]);

  if (loading && !account) return <div className="loading">Loading account details...</div>;
  if (!account && !loading) return <div className="empty-state"><h3>Account not found</h3></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '22px' }}>{account?.code}</span>{' '}
            {account?.name}
          </h1>
          <p>Account ledger with running balance</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="form-group" style={{ margin: 0, width: '150px' }}>
            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>From</label>
            <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0, width: '150px' }}>
            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>To</label>
            <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div>
          <span className={`badge badge-${account?.type}`}>{account?.type}</span>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Normal Balance</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: account?.normal_balance === 'DEBIT' ? 'var(--color-accent-red)' : 'var(--color-accent-green)' }}>
            {account?.normal_balance}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Transactions</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ledger.length}</div>
        </div>
        {ledger.length > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current Balance</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--color-accent-blue)' }}>
              {formatCurrency(ledger[ledger.length - 1].running_balance)}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading" style={{ margin: '40px 0' }}>Loading ledger entries...</div>
        ) : ledger.length === 0 ? (
          <div className="empty-state"><h3>No transactions</h3><p>No posted entries found for this period</p></div>
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
              {ledger.map((entry, idx) => (
                <tr key={idx}>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td className="mono">JE-{String(entry.entry_number).padStart(3, '0')}</td>
                  <td>{entry.transaction_desc}</td>
                  <td className="amount debit">{formatNumber(entry.debit)}</td>
                  <td className="amount credit">{formatNumber(entry.credit)}</td>
                  <td className="amount" style={{ fontWeight: 700, color: Number(entry.running_balance) >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                    {formatCurrency(entry.running_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
