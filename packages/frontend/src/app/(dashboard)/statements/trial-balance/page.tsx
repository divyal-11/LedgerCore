'use client';

import { useEffect, useState } from 'react';
import { api, TrialBalanceData } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/formatters';

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.getTrialBalance()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    await api.refreshTrialBalance();
    fetchData();
  };

  if (loading) return <div className="loading">Loading trial balance...</div>;
  if (!data) return <div className="empty-state"><h3>Failed to load trial balance</h3></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Trial Balance</h1>
        <p>⚡ Pre-computed via Materialized View</p>
      </div>

      <div className="action-bar">
        <div className={`balance-indicator ${data.is_balanced ? 'balanced' : 'unbalanced'}`}>
          {data.is_balanced ? '✓ Trial Balance is BALANCED' : '✕ Trial Balance is UNBALANCED'}
        </div>
        <button onClick={handleRefresh} className="btn btn-secondary">
          🔄 Refresh View
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Code</th>
              <th>Type</th>
              <th className="text-right">Debits</th>
              <th className="text-right">Credits</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.account_id}>
                <td>{row.account_name}</td>
                <td className="mono">{row.account_code}</td>
                <td><span className={`badge badge-${row.account_type}`}>{row.account_type}</span></td>
                <td className="amount">{formatNumber(row.total_debits)}</td>
                <td className="amount">{formatNumber(row.total_credits)}</td>
                <td className="amount" style={{ fontWeight: 700, color: Number(row.balance) >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--color-bg-tertiary)', fontWeight: 700 }}>
              <td colSpan={3}>TOTALS</td>
              <td className="amount" style={{ fontSize: '15px' }}>{formatCurrency(data.totals.total_debits)}</td>
              <td className="amount" style={{ fontSize: '15px' }}>{formatCurrency(data.totals.total_credits)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
