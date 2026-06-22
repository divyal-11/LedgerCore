'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, JournalEntry } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    setLoading(true);
    api.getJournalEntries(filter ? { status: filter } : undefined)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const filters = [
    { value: '',       label: 'All', icon: '◫' },
    { value: 'POSTED', label: 'Posted', icon: '✓' },
    { value: 'DRAFT',  label: 'Draft',  icon: '◐' },
    { value: 'VOID',   label: 'Void',   icon: '✕' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Journal Entries</h1>
        <p>All financial transactions recorded in the double-entry system</p>
      </div>

      <div className="action-bar">
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(({ value, label, icon }) => (
            <button
              key={value}
              id={`filter-${label.toLowerCase()}`}
              className={`btn btn-sm ${filter === value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(value)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <Link href="/journal/new" className="btn btn-primary" id="new-journal-entry-btn">
          <span>+</span>
          New Entry
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <span>Loading journal entries…</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entry #</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th className="text-right">Debits</th>
                  <th className="text-right">Credits</th>
                  <th className="text-center">Lines</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <div style={{ fontSize: 40, marginBottom: 12 }}>≋</div>
                        <h3>No journal entries found</h3>
                        <p>Create your first entry to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="mono" style={{ color: 'var(--brand-cyan)', fontWeight: 600 }}>
                        JE-{String(entry.entry_number).padStart(3, '0')}
                      </td>
                      <td style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{formatDate(entry.entry_date)}</td>
                      <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.description}
                      </td>
                      <td className="mono" style={{ color: 'var(--text-3)' }}>
                        {entry.reference || '—'}
                      </td>
                      <td className="amount debit">{formatCurrency(entry.total_debits)}</td>
                      <td className="amount credit">{formatCurrency(entry.total_credits)}</td>
                      <td className="text-center mono" style={{ color: 'var(--text-2)' }}>
                        {entry.line_count}
                      </td>
                      <td>
                        <span className={`badge badge-${entry.status}`}>{entry.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
