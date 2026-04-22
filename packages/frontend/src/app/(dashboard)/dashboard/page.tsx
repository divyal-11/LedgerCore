'use client';

import { useEffect, useState } from 'react';
import { api, DashboardData, JournalEntry } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="empty-state"><h3>Failed to load dashboard</h3></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Financial overview at a glance</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Total Assets</div>
          <div className="kpi-value blue">{formatCurrency(data.total_assets)}</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value green">{formatCurrency(data.total_revenue)}</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">Total Expenses</div>
          <div className="kpi-value amber">{formatCurrency(data.total_expenses)}</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Net Income</div>
          <div className="kpi-value purple">{formatCurrency(data.net_income)}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Revenue vs Expenses Trend</h3>
          <div style={{ height: 300 }}>
            {data.trend_data && data.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickMargin={10} />
                  <YAxis 
                    stroke="var(--color-text-muted)" 
                    fontSize={12} 
                    tickFormatter={(val) => '$' + (val >= 1000 ? (val/1000).toFixed(0) + 'k' : val)} 
                  />
                  <Tooltip 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: 0 }}>
                <p>No trend data available for posted entries.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Asset Composition</h3>
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.asset_composition && data.asset_composition.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.asset_composition}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.asset_composition.map((entry, index) => (
                      <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: 0 }}>
                <p>No asset balances found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Recent Journal Entries</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>JE #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_entries.map((entry: JournalEntry) => (
                <tr key={entry.id}>
                  <td className="mono">JE-{String(entry.entry_number).padStart(3, '0')}</td>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td>{entry.description}</td>
                  <td className="amount">{formatCurrency(entry.total_debits)}</td>
                  <td><span className={'badge badge-' + entry.status}>{entry.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Entry Statistics</h3>
          <div style={{ padding: '20px 0' }}>
            {data.entry_counts.map((c) => (
              <div key={c.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span className={'badge badge-' + c.status}>{c.status}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 }}>{c.count}</span>
              </div>
            ))}
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Accounting Equation</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-accent-blue)' }}>
                Assets = Liabilities + Equity
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {formatCurrency(data.total_assets)} ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
