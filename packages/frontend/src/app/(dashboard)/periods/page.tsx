'use client';

import { useEffect, useState } from 'react';
import { api, FiscalPeriod } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '' });

  const loadPeriods = () => {
    setLoading(true);
    api.getPeriods()
      .then(setPeriods)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPeriod(formData);
      setIsCreateOpen(false);
      setFormData({ name: '', start_date: '', end_date: '' });
      loadPeriods();
    } catch (err) {
      alert((err as Error).message || 'Failed to create period');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this accounting period? This action cannot be officially undone and will prevent new postings to this period.')) return;
    try {
      await api.closePeriod(id);
      loadPeriods();
    } catch (err) {
      alert((err as Error).message || 'Failed to close period');
    }
  };

  if (loading && periods.length === 0) return <div className="loading">Loading fiscal periods...</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Fiscal Periods</h1>
          <p>Manage accounting periods for journal entries</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          + New Period
        </button>
      </div>

      {isCreateOpen && (
        <div className="card fade-in" style={{ marginBottom: '24px', border: '1px solid var(--color-accent-blue)' }}>
          <h3 style={{ marginBottom: '16px' }}>Create Fiscal Period</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Period Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. FY2024-Q4"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
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
                {isSubmitting ? 'Creating...' : 'Create Period'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {periods.length === 0 ? (
          <div className="empty-state">
            <h3>No periods found</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id}>
                  <td style={{ fontWeight: 600 }}>{period.name}</td>
                  <td>{formatDate(period.start_date)}</td>
                  <td>{formatDate(period.end_date)}</td>
                  <td>
                    {period.is_closed ? (
                      <span className="badge badge-LIABILITY">CLOSED</span>
                    ) : (
                      <span className="badge badge-ASSET">OPEN</span>
                    )}
                  </td>
                  <td className="text-right">
                    {!period.is_closed && (
                      <button 
                        className="btn" 
                        style={{ background: 'transparent', color: 'var(--color-accent-red)', padding: '4px 8px', fontSize: '13px' }}
                        onClick={() => handleClose(period.id)}
                      >
                        Close Period
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
