'use client';

import { useEffect, useState } from 'react';
import { api, DashboardData, JournalEntry } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#4f9eff', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee'];

/* ── Custom Tooltip for Charts ───────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(6,12,24,0.95)',
      border: '1px solid rgba(79,158,255,0.25)',
      borderRadius: '10px',
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{p.name}:</span>
          <span style={{ fontSize: '12px', color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {formatCurrency(Number(p.value) || 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Loading Skeleton ────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="loading-shimmer" style={{ height: 36, width: 180, borderRadius: 8, marginBottom: 8 }} />
        <div className="loading-shimmer" style={{ height: 18, width: 260, borderRadius: 6 }} />
      </div>
      <div className="kpi-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="kpi-card" style={{ minHeight: 120 }}>
            <div className="loading-shimmer" style={{ height: 38, width: 38, borderRadius: 10, marginBottom: 14 }} />
            <div className="loading-shimmer" style={{ height: 12, width: 90, borderRadius: 4, marginBottom: 8 }} />
            <div className="loading-shimmer" style={{ height: 28, width: 140, borderRadius: 6 }} />
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {[0, 1].map(i => (
          <div key={i} className="card" style={{ height: 340 }}>
            <div className="loading-shimmer" style={{ height: 20, width: 200, borderRadius: 6, marginBottom: 16 }} />
            <div className="loading-shimmer" style={{ height: 280, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (!data) return (
    <div className="empty-state" style={{ paddingTop: 120 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
      <h3>Failed to Load Dashboard</h3>
      <p>Could not connect to the backend. Check your API configuration.</p>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Real-time financial overview · Double-entry ledger engine</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
          <div style={{
            padding: '6px 14px',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--brand-green)',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-green)', display: 'inline-block', boxShadow: '0 0 8px var(--brand-green)' }} />
            Live
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon">💼</div>
          <div className="kpi-label">Total Assets</div>
          <div className="kpi-value blue">{formatCurrency(data.total_assets)}</div>
          <div className="kpi-trend">↑ Balance Sheet</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon">📈</div>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value green">{formatCurrency(data.total_revenue)}</div>
          <div className="kpi-trend">Income Statement</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon">📊</div>
          <div className="kpi-label">Total Expenses</div>
          <div className="kpi-value amber">{formatCurrency(data.total_expenses)}</div>
          <div className="kpi-trend">Operating costs</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-label">Net Income</div>
          <div className="kpi-value purple">{formatCurrency(data.net_income)}</div>
          <div className="kpi-trend">Revenue − Expenses</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Revenue vs Expenses */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>📈</div>
            Revenue vs Expenses Trend
          </div>
          <div style={{ height: 280 }}>
            {data.trend_data && data.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend_data}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-3)"
                    fontSize={11}
                    tickMargin={10}
                    tick={{ fill: 'var(--text-3)' }}
                  />
                  <YAxis
                    stroke="var(--text-3)"
                    fontSize={11}
                    tick={{ fill: 'var(--text-3)' }}
                    tickFormatter={(val) => '$' + (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val)}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-2)' }} />
                  <Line
                    type="monotone" dataKey="revenue" name="Revenue"
                    stroke="#34d399" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#34d399', stroke: 'rgba(52,211,153,0.3)', strokeWidth: 4 }}
                  />
                  <Line
                    type="monotone" dataKey="expenses" name="Expenses"
                    stroke="#fbbf24" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#fbbf24', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#fbbf24', stroke: 'rgba(251,191,36,0.3)', strokeWidth: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p>No trend data available for posted entries.</p>
              </div>
            )}
          </div>
        </div>

        {/* Asset Composition */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: 'rgba(79,158,255,0.12)', border: '1px solid rgba(79,158,255,0.2)' }}>💎</div>
            Asset Composition
          </div>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.asset_composition && data.asset_composition.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, i) => (
                      <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data.asset_composition}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={100}
                    paddingAngle={3}
                    dataKey="value" nameKey="name"
                    strokeWidth={0}
                  >
                    {data.asset_composition.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % COLORS.length})`} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{
                      background: 'rgba(6,12,24,0.95)',
                      border: '1px solid rgba(79,158,255,0.25)',
                      borderRadius: 10,
                      backdropFilter: 'blur(16px)',
                    }}
                    labelStyle={{ color: 'var(--text-2)', fontSize: 12 }}
                    itemStyle={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
                  />
                  <Legend
                    layout="vertical" verticalAlign="middle" align="right"
                    wrapperStyle={{ fontSize: 12, color: 'var(--text-2)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 0 }}>
                <p>No asset balances found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Recent Entries */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>≋</div>
            Recent Journal Entries
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>JE #</th>
                <th>Date</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: 40, color: 'var(--text-3)' }}>
                    No recent entries
                  </td>
                </tr>
              ) : (
                data.recent_entries.map((entry: JournalEntry) => (
                  <tr key={entry.id}>
                    <td className="mono" style={{ color: 'var(--brand-cyan)' }}>
                      JE-{String(entry.entry_number).padStart(3, '0')}
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{formatDate(entry.entry_date)}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.description}
                    </td>
                    <td className="amount">{formatCurrency(entry.total_debits)}</td>
                    <td><span className={`badge badge-${entry.status}`}>{entry.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Entry Statistics */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>⬡</div>
            Entry Statistics
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {data.entry_counts.map((c) => (
              <div key={c.status} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                transition: 'all 0.2s ease',
              }}>
                <span className={`badge badge-${c.status}`}>{c.status}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: c.status === 'POSTED' ? 'var(--brand-green)'
                       : c.status === 'DRAFT'  ? 'var(--brand-amber)'
                       : 'var(--brand-red)',
                  lineHeight: 1,
                }}>
                  {c.count}
                </span>
              </div>
            ))}
          </div>

          {/* Accounting Equation */}
          <div style={{
            padding: '16px',
            background: 'rgba(79,158,255,0.04)',
            borderRadius: 12,
            border: '1px solid rgba(79,158,255,0.12)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 700 }}>
              Accounting Equation
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--brand-cyan)',
              marginBottom: 6,
              fontWeight: 600,
            }}>
              Assets = Liabilities + Equity
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              color: 'var(--brand-blue)',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}>
              {formatCurrency(data.total_assets)} ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
