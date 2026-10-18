import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Home, 
  Search, 
  ShieldAlert, 
  QrCode, 
  MoreHorizontal, 
  ChevronDown, 
  X,
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
  const moreButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const itemRefs = useRef([]);
  const mobileItemRefs = useRef([]);
  const [moreOpen, setMoreOpen] = useState(false);

  const isBn = t.lang_toggle === 'English';

  const primaryItems = [
    { id: 'landing', label: isBn ? 'হোম পেজ' : 'Home', icon: Home },
    { id: 'check', label: t.nav_check || (isBn ? 'জমি যাচাই' : 'Check Land'), icon: Search },
    { id: 'landprice', label: t.nav_landprice || (isBn ? 'জমির মূল্য' : 'Land Price'), icon: TrendingUp, badge: 'ML' },
    { id: 'guardian', label: t.nav_guardian || (isBn ? 'ল্যান্ড গার্ডিয়ান' : 'Land Guardian'), icon: ShieldAlert, badge: 'DEMO' },
    { id: 'integrity', label: t.nav_integrity || (isBn ? 'হ্যাশ ও কিউআর' : 'QR & Hash'), icon: QrCode },
  ];

  const moreItems = [
    { id: 'overview', label: t.nav_overview || (isBn ? 'ওভারভিউ' : 'Overview'), icon: LayoutDashboard },
    { id: 'history', label: t.nav_history || (isBn ? 'লেনদেনের ইতিহাস' : 'History'), icon: History },
    { id: 'scanner', label: t.nav_scanner || (isBn ? 'দলিল স্ক্যানার' : 'Deed Scanner'), icon: ScanText },
    { id: 'compare', label: t.nav_compare || (isBn ? 'অসঙ্গতি নিরীক্ষা' : 'Compare'), icon: GitCompare },
    { id: 'passport', label: t.nav_passport || (isBn ? 'প্লট পাসপোর্ট' : 'Plot Passport'), icon: FileBadge },
    { id: 'reports', label: t.nav_reports || (isBn ? 'যাচাই প্রতিবেদন' : 'Reports'), icon: ClipboardCheck },
    { id: 'graph', label: t.nav_graph || (isBn ? 'সম্পর্ক গ্রাফ' : 'Graph'), icon: Network },
  ];

  const activeMoreItem = moreItems.find(item => item.id === activeTab);
  const isMoreActive = Boolean(activeMoreItem);
  const moreButtonLabel = isMoreActive
    ? (isBn ? `আরও: ${activeMoreItem.label}` : `More: ${activeMoreItem.label}`)
    : (t.nav_more || (isBn ? 'আরও' : 'More'));

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current?.contains(e.target) ||
        desktopMenuRef.current?.contains(e.target) ||
        mobileMenuRef.current?.contains(e.target)
      ) {
        return;
      }
      setMoreOpen(false);
    }

    function handleGlobalKeyDown(e) {
      if (e.key === 'Escape' && moreOpen) {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    }

    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleGlobalKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [moreOpen]);

  // Keyboard navigation inside menu items
  const handleItemKeyDown = (e, index, isMobile = false) => {
    const refs = isMobile ? mobileItemRefs : itemRefs;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % moreItems.length;
      refs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + moreItems.length) % moreItems.length;
      refs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      refs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      refs.current[moreItems.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMoreOpen(false);
      moreButtonRef.current?.focus();
    } else if (e.key === 'Tab') {
      setMoreOpen(false);
    }
  };

  // Keyboard navigation on More button
  const handleButtonKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!moreOpen) {
        setMoreOpen(true);
      }
      setTimeout(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        const targetRefs = isMobile ? mobileItemRefs : itemRefs;
        const targetIdx = e.key === 'ArrowUp' ? moreItems.length - 1 : 0;
        targetRefs.current[targetIdx]?.focus();
      }, 50);
    } else if (e.key === 'Escape' && moreOpen) {
      e.preventDefault();
      setMoreOpen(false);
    }
  };

  // Auto-focus first item when menu opens via keyboard
  useEffect(() => {
    if (moreOpen) {
      const timer = setTimeout(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        const targetRefs = isMobile ? mobileItemRefs : itemRefs;
        const activeIdx = moreItems.findIndex(item => item.id === activeTab);
        const focusIdx = activeIdx >= 0 ? activeIdx : 0;
        targetRefs.current[focusIdx]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [moreOpen]);

  // Keep active primary tab scrolled into view
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

  const handleSelectItem = (id) => {
    setActiveTab(id);
    setMoreOpen(false);
    moreButtonRef.current?.focus();
  };

  const renderMenuItems = (isMobile = false) => {
    const refs = isMobile ? mobileItemRefs : itemRefs;
    return moreItems.map((item, idx) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          ref={(el) => { refs.current[idx] = el; }}
          id={`nav-more-item-${isMobile ? 'mobile-' : ''}${item.id}`}
          data-tab-id={item.id}
          role="menuitem"
          type="button"
          tabIndex={moreOpen ? 0 : -1}
          className={`nav-more-item-btn ${isActive ? 'active' : ''}`}
          onClick={() => handleSelectItem(item.id)}
          onKeyDown={(e) => handleItemKeyDown(e, idx, isMobile)}
          style={{ minHeight: '44px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon 
              size={16} 
              aria-hidden="true"
              style={{ color: isActive ? 'var(--accent, #005A5B)' : 'var(--muted, #64748B)', flexShrink: 0 }} 
            />
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span 
              className="nav-item-badge" 
              style={{ 
                fontSize: '0.68rem', 
                padding: '1px 5px', 
                borderRadius: '4px', 
                background: '#FEF3C7', 
                color: '#92400E', 
                fontWeight: 700 
              }}
            >
              {item.badge}
            </span>
          )}
        </button>
      );
    });
  };

  return (
    <nav className="app-nav-bar" aria-label="Main Application Sections">
      <div className="app-nav-layout">
        {/* Scrollable Container with Valid Role="tablist" for Primary Tabs */}
        <div 
          className="app-nav-container" 
          ref={containerRef} 
          role="tablist" 
          aria-label={isBn ? 'প্রধান ট্যাবসমূহ' : 'Primary Tabs'}
        >
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
        </div>

        {/* Sibling Wrapper Outside Scroll Container for More Button & Dropdown */}
        <div 
          className="app-nav-more-wrapper" 
          ref={dropdownRef}
        >
          <button
            ref={moreButtonRef}
            type="button"
            id="nav-more-btn"
            className={`nav-item-btn ${isMoreActive ? 'active' : ''}`}
            onClick={() => setMoreOpen(prev => !prev)}
            onKeyDown={handleButtonKeyDown}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            aria-controls="nav-more-menu-desktop"
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
            <span className="nav-item-label">{moreButtonLabel}</span>
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
                  background: 'var(--accent, #005A5B)', 
                  display: 'inline-block',
                  marginLeft: '2px'
                }} 
              />
            )}
          </button>

          {/* Desktop Dropdown Menu (Positioned relative to app-nav-more-wrapper, outside overflow:hidden) */}
          {moreOpen && (
            <div
              ref={desktopMenuRef}
              id="nav-more-menu-desktop"
              className="nav-more-menu-desktop"
              role="menu"
              aria-label={isBn ? 'আরও মেনু' : 'More Menu'}
            >
              {renderMenuItems(false)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Portal (<= 768px, mounted on document.body to guarantee no clipping) */}
      {moreOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="nav-more-backdrop-mobile" 
            onClick={() => {
              setMoreOpen(false);
              moreButtonRef.current?.focus();
            }}
            aria-hidden="true"
          />
          <div
            ref={mobileMenuRef}
            id="nav-more-menu-mobile"
            className="nav-more-sheet-mobile"
            role="menu"
            aria-label={isBn ? 'আরও মেনু' : 'More Menu'}
          >
            <div className="nav-more-sheet-handle" />
            <div className="nav-more-sheet-header">
              <span className="nav-more-sheet-title">{isBn ? 'আরও ফিচারসমূহ' : 'More Features'}</span>
              <button
                type="button"
                className="nav-more-sheet-close"
                onClick={() => {
                  setMoreOpen(false);
                  moreButtonRef.current?.focus();
                }}
                aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {renderMenuItems(true)}
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}
