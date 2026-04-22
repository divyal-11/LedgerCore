'use client';

import { useEffect, useState } from 'react';
import { api, BalanceSheetData } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = () => {
    setLoading(true);
    api.getBalanceSheet(asOf)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="loading">Generating balance sheet...</div>;
  if (!data) return <div className="empty-state"><h3>Failed to load balance sheet</h3></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Balance Sheet</h1>
        <p>Assets = Liabilities + Equity — verified at the database level</p>
      </div>

      <div className="action-bar">
        <div className={`balance-indicator ${data.is_balanced ? 'balanced' : 'unbalanced'}`}>
          {data.is_balanced ? '✓ Balance Sheet is BALANCED' : '✕ Balance Sheet is UNBALANCED'}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">As Of</label>
            <input type="date" className="form-input mono" value={asOf} onChange={e => setAsOf(e.target.value)} style={{ width: '160px' }} />
          </div>
          <button onClick={fetchData} className="btn btn-primary btn-sm" style={{ marginTop: '18px' }}>Generate</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--color-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>BALANCE SHEET</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            As of: {asOf}
          </p>
        </div>

        {/* ASSETS */}
        <div className="statement-section">
          <div className="statement-section-header" style={{ color: 'var(--color-asset)' }}>ASSETS</div>
          {data.assets.map((row, i) => (
            <div key={i} className="statement-row indent-1">
              <span>{row.code} {row.name}</span>
              <span className="statement-amount">{formatCurrency(row.balance)}</span>
            </div>
          ))}
          <div className="statement-row total">
            <span>TOTAL ASSETS</span>
            <span className="statement-amount" style={{ color: 'var(--color-accent-blue)', fontSize: '16px' }}>
              {formatCurrency(data.totals.total_assets)}
            </span>
          </div>
        </div>

        {/* LIABILITIES */}
        <div className="statement-section">
          <div className="statement-section-header" style={{ color: 'var(--color-liability)' }}>LIABILITIES</div>
          {data.liabilities.map((row, i) => (
            <div key={i} className="statement-row indent-1">
              <span>{row.code} {row.name}</span>
              <span className="statement-amount">{formatCurrency(row.balance)}</span>
            </div>
          ))}
          <div className="statement-row total">
            <span>Total Liabilities</span>
            <span className="statement-amount" style={{ color: 'var(--color-accent-red)' }}>
              {formatCurrency(data.totals.total_liabilities)}
            </span>
          </div>
        </div>

        {/* EQUITY */}
        <div className="statement-section">
          <div className="statement-section-header" style={{ color: 'var(--color-equity)' }}>EQUITY</div>
          {data.equity.map((row, i) => (
            <div key={i} className="statement-row indent-1">
              <span>{row.code} {row.name}</span>
              <span className="statement-amount">{formatCurrency(row.balance)}</span>
            </div>
          ))}
          <div className="statement-row total">
            <span>Total Equity</span>
            <span className="statement-amount" style={{ color: 'var(--color-accent-purple)' }}>
              {formatCurrency(data.totals.total_equity)}
            </span>
          </div>
        </div>

        {/* TOTAL L+E */}
        <div className="statement-row net-income">
          <span style={{ fontFamily: 'var(--font-display)' }}>TOTAL LIABILITIES + EQUITY</span>
          <span className="statement-amount" style={{ fontSize: '18px', fontWeight: 700 }}>
            {formatCurrency(data.totals.total_liabilities_and_equity)}
          </span>
        </div>
      </div>
    </div>
  );
}
