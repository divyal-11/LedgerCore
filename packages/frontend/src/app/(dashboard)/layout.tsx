'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    section: 'Overview',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: '◈' },
    ],
  },
  {
    section: 'Accounting',
    links: [
      { href: '/accounts', label: 'Chart of Accounts', icon: '⊞' },
      { href: '/ledger', label: 'General Ledger', icon: '☰' },
      { href: '/journal', label: 'Journal Entries', icon: '≡' },
      { href: '/journal/new', label: 'New Entry', icon: '+' },
      { href: '/periods', label: 'Fiscal Periods', icon: '⏱' },
    ],
  },
  {
    section: 'Reports',
    links: [
      { href: '/statements/trial-balance', label: 'Trial Balance', icon: '⚖' },
      { href: '/statements/profit-loss', label: 'Profit & Loss', icon: '△' },
      { href: '/statements/balance-sheet', label: 'Balance Sheet', icon: '▣' },
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
        <div className="sidebar-logo">
          LedgerCore
          <span>Double-Entry Engine</span>
        </div>
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
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}
