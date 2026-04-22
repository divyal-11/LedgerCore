export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '64px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>404</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Page not found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a href="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
