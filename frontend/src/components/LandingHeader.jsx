import React, { useState } from 'react';
import { Globe, ArrowRight, Shield, Menu, X } from 'lucide-react';

export default function LandingHeader({
  lang = 'bn',
  setLang,
  onNavigateSection,
  onLaunchApp,
  activeTab
}) {
  const isBn = lang === 'bn';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(section);
    } else {
      onLaunchApp(section === 'how-it-works' ? 'scanner' : section);
    }
  };

  return (
    <header className="landing-header-wrapper" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* 1. Dark Demo Disclaimer Banner */}
      <div 
        className="demo-disclaimer-banner"
        style={{
          background: 'var(--dark-band)',
          color: '#EAF0E8',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          padding: '6px 16px',
          textAlign: 'center',
          letterSpacing: '0.4px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          minHeight: '34px'
        }}
      >
        <span style={{ 
          background: 'rgba(245, 158, 11, 0.25)', 
          color: '#FDE68A', 
          padding: '1px 6px', 
          borderRadius: '3px',
          fontWeight: 700 
        }}>
          {isBn ? 'সতর্কতা' : 'NOTICE'}
        </span>
        <span>
          <strong>{isBn ? 'ডেমো ডেটা। এটি আইনি সিদ্ধান্ত নয়।' : 'DEMO DATA, not a legal verdict.'}</strong>
        </span>
        <span style={{ color: '#8BA59E' }}>
          {isBn ? '— নিয়ম সিদ্ধান্ত নেয়। এআই শুধু ব্যাখ্যা করে।' : '— Rules decide; AI only explains.'}
        </span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div 
        className="landing-navbar"
        style={{
          background: 'var(--bg-paper)',
          borderBottom: '1.5px solid var(--text-main)',
          padding: '10px 0'
        }}
      >
        <div 
          className="landing-container"
          style={{
            maxWidth: 'var(--max-content-width)',
            margin: '0 auto',
            padding: '0 var(--gutter-desktop)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Brand Logo & Wordmark */}
          <div 
            className="brand-logo-group"
            onClick={() => handleNavClick('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textDecoration: 'none' }}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('landing')}
            aria-label="Bhumi Kobocho Home"
          >
            {/* Custom Shield-and-Plot-Grid Logo SVG */}
            <svg width="36" height="40" viewBox="0 0 38 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Outer Shield Contour */}
              <path 
                d="M19 1L3 7V19C3 29.5 9.8 38.3 19 41C28.2 38.3 35 29.5 35 19V7L19 1Z" 
                fill="var(--dark-band)" 
                stroke="var(--text-main)" 
                strokeWidth="2" 
              />
              {/* Inner Cadastral Plot Boundary Quadrants */}
              <rect x="8" y="10" width="10" height="11" fill="var(--accent-tint)" stroke="#10272A" strokeWidth="1.2" />
              <rect x="20" y="10" width="10" height="11" fill="#EAF0E8" stroke="#10272A" strokeWidth="1.2" />
              <rect x="8" y="23" width="10" height="10" fill="#EAF0E8" stroke="#10272A" strokeWidth="1.2" />
              {/* Highlight Target Quadrant 427 */}
              <rect x="20" y="23" width="10" height="10" fill="var(--primary-accent)" stroke="#10272A" strokeWidth="1.2" />
              {/* Plot Survey Corner Mark */}
              <circle cx="19" cy="22" r="2.2" fill="#FFFFFF" stroke="var(--text-main)" strokeWidth="1" />
            </svg>

            {/* Brand Wordmark */}
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.1,
                letterSpacing: '-0.3px'
              }}>
                ভূমি কবচ
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                BHUMI KOBOCHO
              </div>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="landing-nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="nav-link-btn"
            >
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </button>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onLaunchApp('passport'); }}
              className="nav-link-btn"
            >
              {isBn ? 'প্লট পাসপোর্ট' : 'Plot Passport'}
            </button>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onLaunchApp('guardian'); }}
              className="nav-link-btn"
            >
              {isBn ? 'ল্যান্ড গার্ডিয়ান' : 'Land Guardian'}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('limitations')}
              className="nav-link-btn text-muted-link"
            >
              {isBn ? 'সীমা' : 'Scope & Limits'}
            </button>
          </nav>

          {/* Header Actions: Language Switcher, CTA, & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Bangla / English Toggle Button */}
            <button
              type="button"
              onClick={() => setLang(isBn ? 'en' : 'bn')}
              className="lang-toggle-btn"
              style={{
                height: '42px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--line)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                minWidth: '44px'
              }}
              title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
              aria-label={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe size={16} style={{ color: 'var(--primary-accent)' }} />
              <span>{isBn ? 'English' : 'বাংলা'}</span>
            </button>

            {/* App Launch CTA Button (Desktop) */}
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onLaunchApp('scanner'); }}
              className="btn-primary desktop-only"
              style={{
                height: '42px',
                padding: '0 16px',
                borderRadius: 'var(--radius-std)',
                fontSize: '0.9rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span>{isBn ? 'ডেমো দেখুন' : 'View Demo'}</span>
              <ArrowRight size={15} />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              className="mobile-menu-toggle mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                height: '42px',
                width: '42px',
                borderRadius: 'var(--radius-std)',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--line)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-expanded={mobileMenuOpen}
              aria-label={isBn ? 'মেনু খুলুন/বন্ধ করুন' : 'Toggle navigation menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Collapsible Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-drawer mobile-only"
          style={{
            background: 'var(--bg-paper)',
            borderBottom: '2px solid var(--text-main)',
            boxShadow: 'var(--shadow-hard)',
            padding: '16px 20px',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="mobile-nav-link"
              style={{ minHeight: '44px', textAlign: 'left', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-std)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}
            >
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </button>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onLaunchApp('passport'); }}
              className="mobile-nav-link"
              style={{ minHeight: '44px', textAlign: 'left', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-std)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}
            >
              {isBn ? 'প্লট পাসপোর্ট' : 'Plot Passport'}
            </button>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onLaunchApp('guardian'); }}
              className="mobile-nav-link"
              style={{ minHeight: '44px', textAlign: 'left', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-std)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}
            >
              {isBn ? 'ল্যান্ড গার্ডিয়ান' : 'Land Guardian'}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('limitations')}
              className="mobile-nav-link"
              style={{ minHeight: '44px', textAlign: 'left', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-std)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}
            >
              {isBn ? 'ব্যবহারের সীমা ও শর্তাবলী' : 'Scope & Limitations'}
            </button>

            {/* Mobile Primary CTA */}
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onLaunchApp('scanner'); }}
              className="btn-primary"
              style={{
                height: '46px',
                width: '100%',
                marginTop: '6px',
                borderRadius: 'var(--radius-std)',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{isBn ? 'ডেমো দেখুন' : 'View Demo'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
