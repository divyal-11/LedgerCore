'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Account, FiscalPeriod } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';

interface LineItem {
  account_id: string;
  description: string;
  debit: string;
  credit: string;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [autoPost, setAutoPost] = useState(true);
  const [lines, setLines] = useState<LineItem[]>([
    { account_id: '', description: '', debit: '', credit: '' },
    { account_id: '', description: '', debit: '', credit: '' },
  ]);

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getPeriods()])
      .then(([accts, pds]) => {
        setAccounts(accts.filter((a: Account) => a.is_leaf));
        setPeriods(pds);
        if (pds.length > 0) setPeriodId(pds[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  const addLine = () => {
    setLines([...lines, { account_id: '', description: '', debit: '', credit: '' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof LineItem, value: string) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    // If entering debit, clear credit and vice versa
    if (field === 'debit' && value) updated[idx].credit = '';
    if (field === 'credit' && value) updated[idx].debit = '';
    setLines(updated);
  };

  const handleSubmit = async () => {
    if (!isBalanced) return;
    setSubmitting(true);
    setError('');

    try {
      await api.createJournalEntry({
        entry_date: entryDate,
        description,
        reference: reference || undefined,
        period_id: periodId || undefined,
        auto_post: autoPost,
        lines: lines
          .filter(l => l.account_id && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
          .map(l => ({
            account_id: l.account_id,
            description: l.description || undefined,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
          })),
      });
      router.push('/journal');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading form data...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>New Journal Entry</h1>
        <p>Record a financial transaction with balanced debits and credits</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--color-accent-red)', marginBottom: '24px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input mono" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reference</label>
            <input type="text" className="form-input" placeholder="INV-001" value={reference} onChange={e => setReference(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Period</label>
            <select className="form-select" value={periodId} onChange={e => setPeriodId(e.target.value)}>
              <option value="">Select period</option>
              {periods.map(p => (
                <option key={p.id} value={p.id} disabled={p.is_closed}>{p.name}{p.is_closed ? ' (Closed)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" checked={autoPost} onChange={e => setAutoPost(e.target.checked)} />
              Auto-post entry
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input type="text" className="form-input" placeholder="Describe the transaction..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Account</th>
              <th>Description</th>
              <th className="text-right" style={{ width: '150px' }}>Debit</th>
              <th className="text-right" style={{ width: '150px' }}>Credit</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                <td style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{idx + 1}</td>
                <td>
                  <select className="form-select" value={line.account_id} onChange={e => updateLine(idx, 'account_id', e.target.value)} style={{ minWidth: '200px' }}>
                    <option value="">Select account...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="text" className="form-input" placeholder="Line description" value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} />
                </td>
                <td>
                  <input type="number" step="0.01" min="0" className="form-input mono" placeholder="0.00" value={line.debit} onChange={e => updateLine(idx, 'debit', e.target.value)} style={{ textAlign: 'right' }} />
                </td>
                <td>
                  <input type="number" step="0.01" min="0" className="form-input mono" placeholder="0.00" value={line.credit} onChange={e => updateLine(idx, 'credit', e.target.value)} style={{ textAlign: 'right' }} />
                </td>
                <td>
                  <button onClick={() => removeLine(idx)} className="btn btn-sm btn-danger" disabled={lines.length <= 2} style={{ padding: '4px 8px' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '12px 0' }}>
          <button onClick={addLine} className="btn btn-secondary btn-sm">
            ➕ Add Line
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Debits</div>
            <div className="amount debit" style={{ fontSize: '20px', fontWeight: 700 }}>{formatCurrency(totalDebits)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Credits</div>
            <div className="amount credit" style={{ fontSize: '20px', fontWeight: 700 }}>{formatCurrency(totalCredits)}</div>
          </div>
          <div className={`balance-indicator ${isBalanced ? 'balanced' : 'unbalanced'}`}>
            {isBalanced ? '✓ BALANCED — Ready to Post' : `✕ UNBALANCED — Difference: ${formatCurrency(Math.abs(totalDebits - totalCredits))}`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => router.push('/journal')} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={!isBalanced || submitting || !description}>
            {submitting ? 'Posting...' : autoPost ? '📮 Post Entry' : '💾 Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
