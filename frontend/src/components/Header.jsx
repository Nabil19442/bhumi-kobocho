import React from 'react';
import { Globe, AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function Header({ lang, setLang, t, onReturnToLanding }) {
  const toggleLanguage = () => {
    setLang(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  const isBn = lang === 'bn';

  return (
    <header role="banner" style={{ borderBottom: '1px solid #CAD7CF' }}>
      {/* Global Dark Demo Disclaimer Banner */}
      <div 
        className="global-demo-banner" 
        id="global-demo-banner" 
        role="alert"
        style={{
          background: 'var(--dark-band)',
          color: '#EAF0E8',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          padding: '6px 16px',
          textAlign: 'center',
          letterSpacing: '0.4px',
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
          <strong>{t.demo_banner}</strong> &mdash; {t.demo_banner_sub}
        </span>
      </div>

      {/* Main Header Bar */}
      <div 
        className="app-header"
        style={{
          background: 'var(--bg-paper)',
          padding: '10px 24px',
        }}
      >
        <div style={{
          maxWidth: 'var(--max-content-width, 1240px)',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div 
            className="brand-section"
          onClick={onReturnToLanding}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: onReturnToLanding ? 'pointer' : 'default' }}
          title={isBn ? 'ল্যান্ডিং পেজে ফিরে যান' : 'Back to landing page'}
        >
          {/* Custom Shield-and-Plot-Grid Logo SVG */}
          <svg width="34" height="38" viewBox="0 0 38 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path 
              d="M19 1L3 7V19C3 29.5 9.8 38.3 19 41C28.2 38.3 35 29.5 35 19V7L19 1Z" 
              fill="var(--dark-band)" 
              stroke="var(--text-main)" 
              strokeWidth="2" 
            />
            <rect x="8" y="10" width="10" height="11" fill="var(--accent-tint)" stroke="#10272A" strokeWidth="1.2" />
            <rect x="20" y="10" width="10" height="11" fill="#EAF0E8" stroke="#10272A" strokeWidth="1.2" />
            <rect x="8" y="23" width="10" height="10" fill="#EAF0E8" stroke="#10272A" strokeWidth="1.2" />
            <rect x="20" y="23" width="10" height="10" fill="var(--primary-accent)" stroke="#10272A" strokeWidth="1.2" />
            <circle cx="19" cy="22" r="2.2" fill="#FFFFFF" stroke="var(--text-main)" strokeWidth="1" />
          </svg>

          <div className="brand-text-block">
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.1
            }}>
              {t.app_name}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              BHUMI KOBOCHO
            </div>
          </div>
        </div>

        <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onReturnToLanding && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onReturnToLanding}
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-heading)',
                gap: '6px'
              }}
            >
              <Home size={14} />
              <span>{isBn ? 'হোম পেজ' : 'Landing'}</span>
            </button>
          )}

          <button
            id="lang-toggle-btn"
            className="lang-toggle-btn"
            onClick={toggleLanguage}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: 'var(--radius-std)',
              background: 'var(--bg-card)',
              border: '1px solid #CAD7CF',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            aria-label="Switch between Bangla and English"
          >
            <Globe size={14} style={{ color: 'var(--primary-accent)' }} />
            <span>{t.lang_toggle}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
  );
}
