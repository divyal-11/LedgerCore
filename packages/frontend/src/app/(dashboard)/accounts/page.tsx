'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, AccountTreeNode, CreateAccountData } from '@/lib/api';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create account state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAccountData>({
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

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.parent_id) delete payload.parent_id;
      
      await api.createAccount(payload);
      setIsCreateOpen(false);
      setFormData({
        code: '',
        name: '',
        type: 'ASSET',
        normal_balance: 'DEBIT',
        parent_id: '',
        description: '',
      });
      loadAccounts();
    } catch (err) {
      alert((err as Error).message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && accounts.length === 0) return <div className="loading">Loading chart of accounts...</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Chart of Accounts</h1>
          <p>Hierarchical account structure powered by recursive CTE — click any leaf account to view its ledger</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          + Add Account
        </button>
      </div>

      {isCreateOpen && (
        <div className="card fade-in" style={{ marginBottom: '24px', border: '1px solid var(--color-accent-blue)' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Account</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Account Code</label>
              <input
                type="text"
                className="form-control"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g. 1150"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Account Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Short-term Investments"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
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
                className="form-select"
                value={formData.parent_id}
                onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
              >
                <option value="">-- No Parent (Root Level) --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.indented_name} ({acc.code})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Note: Selecting a parent will mark the parent as a non-leaf account.
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Normal Balance</th>
                <th>Leaf</th>
              </tr>
            </thead>
            <tbody style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="mono">{account.code}</td>
                  <td>
                    <div style={{ paddingLeft: `${account.depth * 24}px`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!account.is_leaf && <span style={{ color: 'var(--color-text-muted)' }}>▼</span>}
                      {account.is_leaf ? (
                        <Link
                          href={`/accounts/${account.id}`}
                          style={{ color: 'var(--color-accent-blue)', textDecoration: 'none', fontWeight: 400 }}
                        >
                          {account.name}
                        </Link>
                      ) : (
                        <span className="tree-branch">{account.name}</span>
                      )}
                    </div>
                  </td>
                  <td><span className={`badge badge-${account.type}`}>{account.type}</span></td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: account.normal_balance === 'DEBIT' ? 'var(--color-accent-red)' : 'var(--color-accent-green)' }}>
                      {account.normal_balance}
                    </span>
                  </td>
                  <td>
                    {account.is_leaf ? (
                      <span style={{ color: 'var(--color-accent-green)' }}>●</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>○</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
