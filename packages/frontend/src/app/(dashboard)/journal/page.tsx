'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, JournalEntry } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.getJournalEntries(filter ? { status: filter } : undefined)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="loading">Loading journal entries...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Journal Entries</h1>
        <p>All financial transactions recorded in the system</p>
      </div>

      <div className="action-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'POSTED', 'DRAFT', 'VOID'].map((status) => (
            <button
              key={status}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter(status); setLoading(true); }}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
        <Link href="/journal/new" className="btn btn-primary">
          ➕ New Entry
        </Link>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entry #</th>
              <th>Date</th>
              <th>Description</th>
              <th>Reference</th>
              <th className="text-right">Debits</th>
              <th className="text-right">Credits</th>
              <th>Lines</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center" style={{ padding: '48px', color: 'var(--color-text-muted)' }}>
                  No journal entries found
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="mono">JE-{String(entry.entry_number).padStart(3, '0')}</td>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td>{entry.description}</td>
                  <td className="mono" style={{ color: 'var(--color-text-muted)' }}>{entry.reference || '—'}</td>
                  <td className="amount">{formatCurrency(entry.total_debits)}</td>
                  <td className="amount">{formatCurrency(entry.total_credits)}</td>
                  <td className="text-center">{entry.line_count}</td>
                  <td><span className={`badge badge-${entry.status}`}>{entry.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
