'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, AccountTreeNode, CreateAccountData } from '@/lib/api';

export default function AccountsPage() {
  const [accounts, setAccounts]       = useState<AccountTreeNode[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]       = useState<CreateAccountData>({
    code: '',
    name: '',
    type: 'ASSET',
    normal_balance: 'DEBIT',
    parent_id: '',
    description: '',
  });

  const loadAccounts = () => {
    setLoading(true);
    api.getAccountTree()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.parent_id) delete payload.parent_id;
      await api.createAccount(payload);
      setIsCreateOpen(false);
      setFormData({ code: '', name: '', type: 'ASSET', normal_balance: 'DEBIT', parent_id: '', description: '' });
      loadAccounts();
    } catch (err) {
      alert((err as Error).message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Chart of Accounts</h1>
          <p>Hierarchical account structure · powered by recursive CTE</p>
        </div>
        <button
          id="add-account-btn"
          className="btn btn-primary"
          style={{ marginTop: 4 }}
          onClick={() => setIsCreateOpen(true)}
        >
          <span>+</span> Add Account
        </button>
      </div>

      {/* Create Account Form */}
      {isCreateOpen && (
        <div
          className="card fade-in"
          style={{ marginBottom: 24, border: '1px solid rgba(79,158,255,0.25)', boxShadow: '0 0 40px rgba(79,158,255,0.08)' }}
        >
          <div className="card-title">
            <div className="card-title-icon" style={{ background: 'rgba(79,158,255,0.12)', border: '1px solid rgba(79,158,255,0.2)' }}>+</div>
            Create New Account
          </div>
          <form id="create-account-form" onSubmit={handleCreate} style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Account Code</label>
              <input
                id="account-code-input"
                type="text"
                className="form-input mono"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g. 1150"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Name</label>
              <input
                id="account-name-input"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Short-term Investments"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                id="account-type-select"
                className="form-select"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="ASSET">ASSET</option>
                <option value="LIABILITY">LIABILITY</option>
                <option value="EQUITY">EQUITY</option>
                <option value="REVENUE">REVENUE</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Normal Balance</label>
              <select
                id="normal-balance-select"
                className="form-select"
                value={formData.normal_balance}
                onChange={e => setFormData({ ...formData, normal_balance: e.target.value })}
                required
              >
                <option value="DEBIT">DEBIT</option>
                <option value="CREDIT">CREDIT</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Parent Account (Optional)</label>
              <select
                id="parent-account-select"
                className="form-select"
                value={formData.parent_id}
                onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
              >
                <option value="">— No Parent (Root Level) —</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.indented_name} ({acc.code})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                Selecting a parent marks it as a non-leaf account in the hierarchy.
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                id="create-account-submit"
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Table */}
      <div className="card">
        {loading && accounts.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner" />
            <span>Loading chart of accounts…</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Normal Balance</th>
                  <th className="text-center">Leaf</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="mono" style={{ fontWeight: 600, color: 'var(--text-2)' }}>
                      {account.code}
                    </td>
                    <td>
                      <div style={{ paddingLeft: `${account.depth * 22}px`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!account.is_leaf && (
                          <span style={{ color: 'var(--text-3)', fontSize: 10 }}>▼</span>
                        )}
                        {account.is_leaf ? (
                          <Link
                            href={`/accounts/${account.id}`}
                            style={{ color: 'var(--brand-blue)', textDecoration: 'none', fontWeight: 400 }}
                          >
                            {account.name}
                          </Link>
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{account.name}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${account.type}`}>{account.type}</span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: account.normal_balance === 'DEBIT' ? 'var(--brand-red)' : 'var(--brand-green)',
                      }}>
                        {account.normal_balance}
                      </span>
                    </td>
                    <td className="text-center">
                      {account.is_leaf
                        ? <span style={{ color: 'var(--brand-green)', fontSize: 14 }}>●</span>
                        : <span style={{ color: 'var(--text-3)', fontSize: 14 }}>○</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
