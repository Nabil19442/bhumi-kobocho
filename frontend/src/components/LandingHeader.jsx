import React from 'react';
import { Globe, ArrowRight, Shield } from 'lucide-react';

export default function LandingHeader({
  lang = 'bn',
  setLang,
  onNavigateSection,
  onLaunchApp,
  activeTab
}) {
  const isBn = lang === 'bn';

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
          flexWrap: 'wrap'
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
          {isBn 
            ? 'ডেমো ডেটা — এটি আইনি সিদ্ধান্ত বা স্বত্বাধিকারের প্রমাণ নয়।'
            : 'DEMO DATA — NOT A LEGAL VERDICT OR OFFICIAL TITLE CERTIFICATION.'}
        </span>
        <span style={{ color: '#8BA59E' }}>
          {isBn ? 'নিয়ম সিদ্ধান্ত নেয়। এআই শুধু ব্যাখ্যা করে।' : 'Rules decide; AI only explains.'}
        </span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div 
        className="landing-navbar"
        style={{
          background: 'var(--bg-paper)',
          borderBottom: '1.5px solid var(--text-main)',
          padding: '12px 0'
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
            gap: '16px'
          }}
        >
          {/* Brand Logo & Wordmark */}
          <div 
            className="brand-logo-group"
            onClick={() => onNavigateSection && onNavigateSection('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textDecoration: 'none' }}
          >
            {/* Custom Shield-and-Plot-Grid Logo SVG */}
            <svg width="38" height="42" viewBox="0 0 38 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.1,
                letterSpacing: '-0.3px'
              }}>
                ভূমি কবচ
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '1.2px',
                textTransform: 'uppercase'
              }}>
                BHUMI KOBOCHO
              </div>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              type="button"
              onClick={() => onNavigateSection ? onNavigateSection('how-it-works') : onLaunchApp('scanner')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: '2px solid transparent'
              }}
            >
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </button>

            <button
              type="button"
              onClick={() => onLaunchApp('passport')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: '2px solid transparent'
              }}
            >
              {isBn ? 'প্লট পাসপোর্ট' : 'Plot Passport'}
            </button>

            <button
              type="button"
              onClick={() => onLaunchApp('guardian')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: '2px solid transparent'
              }}
            >
              {isBn ? 'ল্যান্ড গার্ডিয়ান' : 'Land Guardian'}
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection ? onNavigateSection('limitations') : onLaunchApp('passport')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: '2px solid transparent'
              }}
            >
              {isBn ? 'সীমা' : 'Scope & Limits'}
            </button>
          </nav>

          {/* Header Actions: Language Switcher & App Launch Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Bangla / English Toggle Button */}
            <button
              type="button"
              onClick={() => setLang(isBn ? 'en' : 'bn')}
              className="lang-toggle-btn"
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                background: 'var(--bg-card)',
                border: '1px solid #CAD7CF',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe size={15} style={{ color: 'var(--primary-accent)' }} />
              <span>{isBn ? 'English' : 'বাংলা'}</span>
            </button>

            {/* App Launch CTA Button */}
            <button
              type="button"
              onClick={() => onLaunchApp('scanner')}
              className="btn-primary"
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: 'var(--radius-std)',
                fontSize: '0.88rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{isBn ? 'ডেমো দেখুন' : 'View Demo'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
