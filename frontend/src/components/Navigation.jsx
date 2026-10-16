import React from 'react';
import { Home, ScanText, GitCompareArrows, FileBadge, QrCode, ShieldAlert, Network, TrendingUp } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, t }) {
  const navItems = [
    { id: 'landing', label: t.lang_toggle === 'English' ? 'হোম পেজ' : 'Home', icon: Home },
    { id: 'scanner', label: t.nav_scanner, icon: ScanText },
    { id: 'compare', label: t.nav_compare, icon: GitCompareArrows },
    { id: 'passport', label: t.nav_passport, icon: FileBadge },
    { id: 'graph', label: t.nav_graph, icon: Network },
    { id: 'integrity', label: t.nav_integrity, icon: QrCode },
    { id: 'guardian', label: t.nav_guardian, icon: ShieldAlert, badge: 'SIMULATED' },
    { id: 'landprice', label: t.nav_landprice || 'জমির সম্ভাব্য দর', icon: TrendingUp, badge: 'ML' },
  ];

  return (
    <nav className="app-nav-bar" role="tablist" aria-label="Main Application Sections">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`tab-btn-${item.id}`}
            role="tab"
            aria-selected={isActive}
            className={`nav-item-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="nav-item-badge simulated">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
