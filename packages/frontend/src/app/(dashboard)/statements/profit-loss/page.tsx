'use client';

import { useEffect, useState } from 'react';
import { api, ProfitLossData } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';

export default function ProfitLossPage() {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const today = now.toISOString().split('T')[0];
  const [from, setFrom] = useState(yearStart);
  const [to, setTo] = useState(today);

  const fetchData = () => {
    setLoading(true);
    api.getProfitLoss(from, to)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="loading">Generating P&L statement...</div>;
  if (!data) return <div className="empty-state"><h3>Failed to load P&L</h3></div>;

  const revenueRows = data.rows.filter(r => r.section === 'REVENUE');
  const expenseRows = data.rows.filter(r => r.section === 'EXPENSE');
  const revTotalRow = data.rows.find(r => r.section === 'REVENUE_TOTAL');
  const expTotalRow = data.rows.find(r => r.section === 'EXPENSE_TOTAL');
  const netIncomeRow = data.rows.find(r => r.section === 'NET_INCOME');

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Income Statement (P&L)</h1>
        <p>Revenue and expenses for the selected period — computed entirely via SQL</p>
      </div>

      <div className="action-bar">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-input mono" value={from} onChange={e => setFrom(e.target.value)} style={{ width: '160px' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-input mono" value={to} onChange={e => setTo(e.target.value)} style={{ width: '160px' }} />
          </div>
          <button onClick={fetchData} className="btn btn-primary btn-sm" style={{ marginTop: '18px' }}>Generate</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--color-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>INCOME STATEMENT</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Period: {from} — {to}
          </p>
        </div>

        <div className="statement-section">
          <div className="statement-section-header" style={{ color: 'var(--color-revenue)' }}>REVENUE</div>
          {revenueRows.map((row, i) => (
            <div key={i} className="statement-row indent-1">
              <span>{row.code} {row.name}</span>
              <span className="statement-amount" style={{ color: 'var(--color-accent-green)' }}>
                {formatCurrency(row.amount || 0)}
              </span>
            </div>
          ))}
          <div className="statement-row total">
            <span>Total Revenue</span>
            <span className="statement-amount" style={{ color: 'var(--color-accent-green)', fontSize: '15px' }}>
              {formatCurrency(revTotalRow?.subtotal || 0)}
            </span>
          </div>
        </div>

        <div className="statement-section">
          <div className="statement-section-header" style={{ color: 'var(--color-expense)' }}>EXPENSES</div>
          {expenseRows.map((row, i) => (
            <div key={i} className="statement-row indent-1">
              <span>{row.code} {row.name}</span>
              <span className="statement-amount" style={{ color: 'var(--color-accent-amber)' }}>
                {formatCurrency(row.amount || 0)}
              </span>
            </div>
          ))}
          <div className="statement-row total">
            <span>Total Expenses</span>
            <span className="statement-amount" style={{ color: 'var(--color-accent-amber)', fontSize: '15px' }}>
              {formatCurrency(expTotalRow?.subtotal || 0)}
            </span>
          </div>
        </div>

        <div className="statement-row net-income">
          <span style={{ fontFamily: 'var(--font-display)' }}>NET INCOME</span>
          <span className="statement-amount" style={{
            fontSize: '20px',
            fontWeight: 700,
            color: Number(netIncomeRow?.subtotal || 0) >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
          }}>
            {formatCurrency(netIncomeRow?.subtotal || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
