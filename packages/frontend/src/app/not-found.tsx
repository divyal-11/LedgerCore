export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '64px', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginBottom: '16px', fontWeight: 800, letterSpacing: '-2px', background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Page not found</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '24px', fontSize: '14px' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a href="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
