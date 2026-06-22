'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    section: 'Overview',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
    ],
  },
  {
    section: 'Accounting',
    links: [
      { href: '/accounts',    label: 'Chart of Accounts', icon: '◫' },
      { href: '/ledger',      label: 'General Ledger',    icon: '⊟' },
      { href: '/journal',     label: 'Journal Entries',   icon: '≋' },
      { href: '/journal/new', label: 'New Entry',         icon: '+' },
      { href: '/periods',     label: 'Fiscal Periods',    icon: '◷' },
    ],
  },
  {
    section: 'Reports',
    links: [
      { href: '/statements/trial-balance', label: 'Trial Balance',  icon: '⚖' },
      { href: '/statements/profit-loss',   label: 'Profit & Loss',  icon: '△' },
      { href: '/statements/balance-sheet', label: 'Balance Sheet',  icon: '▣' },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">⬡</div>
            <div className="logo-text-group">
              <span className="logo-name">LedgerCore</span>
              <span className="logo-subtitle">Double-Entry Engine</span>
            </div>
          </div>
        </div>

        {/* Live status */}
        <div className="sidebar-status">
          <div className="status-dot" />
          <span className="status-text">System Online</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="nav-section">
              <div className="nav-section-label">{section.section}</div>
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  <div className="nav-icon-wrap">{link.icon}</div>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-dot" />
          <span>v2.0 · PostgreSQL</span>
          <div className="sidebar-footer-dot" />
          <span>GAAP Compliant</span>
        </div>
      </aside>

      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}
