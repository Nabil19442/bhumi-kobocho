import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Search, 
  ShieldAlert, 
  QrCode, 
  MoreHorizontal, 
  ChevronDown, 
  LayoutDashboard, 
  ScanText, 
  History, 
  GitCompare, 
  FileBadge, 
  ClipboardCheck, 
  Network, 
  TrendingUp 
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, t }) {
  const containerRef = useRef(null);
  const activeBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const isBn = t.lang_toggle === 'English';

  const primaryItems = [
    { id: 'landing', label: isBn ? 'হোম পেজ' : 'Home', icon: Home },
    { id: 'check', label: t.nav_check || (isBn ? 'জমি যাচাই' : 'Check Land'), icon: Search },
    { id: 'guardian', label: t.nav_guardian || (isBn ? 'ল্যান্ড গার্ডিয়ান' : 'Land Guardian'), icon: ShieldAlert, badge: 'DEMO' },
    { id: 'integrity', label: t.nav_integrity || (isBn ? 'হ্যাশ ও কিউআর' : 'QR & Hash'), icon: QrCode },
  ];

  const moreItems = [
    { id: 'overview', label: t.nav_overview || (isBn ? 'ওভারভিউ' : 'Overview'), icon: LayoutDashboard },
    { id: 'history', label: t.nav_history || (isBn ? 'লেনদেনের ইতিহাস' : 'History'), icon: History },
    { id: 'scanner', label: t.nav_verify || (isBn ? 'দলিল স্ক্যানার' : 'Scanner'), icon: ScanText },
    { id: 'compare', label: t.nav_compare || (isBn ? 'অসঙ্গতি নিরীক্ষা' : 'Compare'), icon: GitCompare },
    { id: 'passport', label: t.nav_passport || (isBn ? 'প্লট পাসপোর্ট' : 'Plot Passport'), icon: FileBadge },
    { id: 'reports', label: t.nav_reports || (isBn ? 'যাচাই প্রতিবেদন' : 'Reports'), icon: ClipboardCheck },
    { id: 'graph', label: t.nav_graph || (isBn ? 'সম্পর্ক গ্রাফ' : 'Graph'), icon: Network },
    { id: 'landprice', label: t.nav_landprice || (isBn ? 'জমির সম্ভাব্য মূল্য' : 'Land Price'), icon: TrendingUp, badge: 'ML' },
  ];

  const isMoreActive = moreItems.some(item => item.id === activeTab);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
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
      <div className="app-nav-container" ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Primary Tabs */}
        {primaryItems.map((item) => {
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
              onClick={() => {
                setMoreOpen(false);
                setActiveTab(item.id);
              }}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Icon size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span className="nav-item-label">{item.label}</span>
              {item.badge && (
                <span className="nav-item-badge simulated">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More / আরও Dropdown Group */}
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex' }}>
          <button
            type="button"
            className={`nav-item-btn ${isMoreActive ? 'active' : ''}`}
            onClick={() => setMoreOpen(prev => !prev)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-label={isBn ? 'আরও মেনু' : 'More Menu'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
              minWidth: '44px',
              cursor: 'pointer'
            }}
          >
            <MoreHorizontal size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span className="nav-item-label">{t.nav_more || (isBn ? 'আরও' : 'More')}</span>
            <ChevronDown 
              size={13} 
              aria-hidden="true"
              style={{ 
                transform: moreOpen ? 'rotate(180deg)' : 'none', 
                transition: 'transform 0.2s ease',
                flexShrink: 0 
              }} 
            />
            {isMoreActive && (
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-accent, #2563EB)', 
                  display: 'inline-block',
                  marginLeft: '2px'
                }} 
              />
            )}
          </button>

          {moreOpen && (
            <div
              role="menu"
              aria-label="Secondary Sections"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 1000,
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '8px',
                minWidth: '220px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMoreOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'var(--accent-tint, #EFF6FF)' : 'transparent',
                      color: isActive ? 'var(--primary-accent, #2563EB)' : '#1E293B',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      minHeight: '44px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} style={{ color: isActive ? 'var(--primary-accent, #2563EB)' : '#64748B' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="nav-item-badge" style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
