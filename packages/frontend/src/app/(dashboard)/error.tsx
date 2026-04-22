'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Something went wrong</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
