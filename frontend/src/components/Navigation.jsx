import React from 'react';
import { Home, LayoutDashboard, ScanText, History, FileBadge, ClipboardCheck, TrendingUp, ShieldAlert } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, t }) {
  const containerRef = React.useRef(null);
  const activeBtnRef = React.useRef(null);

  const navItems = [
    { id: 'landing', label: t.lang_toggle === 'English' ? 'হোম পেজ' : 'Home', icon: Home },
    { id: 'overview', label: t.nav_overview || 'ওভারভিউ', icon: LayoutDashboard },
    { id: 'scanner', label: t.nav_verify || 'দলিল যাচাইকরণ', icon: ScanText },
    { id: 'history', label: t.nav_history || 'লেনদেনের ইতিহাস', icon: History },
    { id: 'passport', label: t.nav_passport || 'প্লট পাসপোর্ট', icon: FileBadge },
    { id: 'guardian', label: t.nav_guardian || 'ল্যান্ড গার্ডিয়ান', icon: ShieldAlert, badge: 'DEMO' },
    { id: 'reports', label: t.nav_reports || 'যাচাই প্রতিবেদন', icon: ClipboardCheck },
    { id: 'landprice', label: t.nav_landprice || 'জমির সম্ভাব্য মূল্য', icon: TrendingUp, badge: 'ML' },
  ];

  React.useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      // Smoothly ensure active button is within visible container bounds
      const btn = activeBtnRef.current;
      const container = containerRef.current;
      const btnLeft = btn.offsetLeft;
      const btnRight = btnLeft + btn.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;

      if (btnLeft < scrollLeft || btnRight > scrollLeft + clientWidth) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTab]);

  return (
    <nav className="app-nav-bar" role="tablist" aria-label="Main Application Sections">
      <div className="app-nav-container" ref={containerRef}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              ref={isActive ? activeBtnRef : null}
              id={`tab-btn-${item.id}`}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={15} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span className="nav-item-label">{item.label}</span>
              {item.badge && (
                <span className="nav-item-badge simulated">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
