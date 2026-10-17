import React from 'react';

/**
 * LandingHeader
 * 
 * Matches Option C reference design:
 * - Background: #0D2B2E
 * - Brand wordmark: ভূমি কবচ (Anek Bangla 800)
 * - Navigation links: ফিচার (#c), সীমানা (#d)
 * - Pill toggle: বাংলা | EN
 */
export default function LandingHeader({
  lang = 'bn',
  setLang
}) {
  const isBn = lang === 'bn';

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className="landing-ref-header"
      style={{ 
        width: '100%', 
        background: '#0D2B2E', 
        color: '#fff', 
        fontFamily: "'Hind Siliguri', system-ui, sans-serif",
        position: 'relative',
        zIndex: 50
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '22px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        {/* Brand Wordmark */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            fontFamily: "'Anek Bangla', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: '24px',
            color: '#FFFFFF',
            cursor: 'pointer',
            letterSpacing: '-0.3px',
            userSelect: 'none'
          }}
        >
          {isBn ? 'ভূমি কবচ' : 'Bhumi Kobocho'}
        </div>

        {/* Right Nav Links & Language Pill */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'center',
            fontSize: '15px',
            fontWeight: 500
          }}
        >
          <a 
            href="#c" 
            onClick={(e) => { e.preventDefault(); scrollToSection('c'); }}
            style={{ 
              color: '#CFE0DA', 
              textDecoration: 'none', 
              cursor: 'pointer',
              transition: 'color 0.15s ease' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#B7DFCA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CFE0DA'; }}
          >
            {isBn ? 'ফিচার' : 'Features'}
          </a>

          <a 
            href="#d" 
            onClick={(e) => { e.preventDefault(); scrollToSection('d'); }}
            style={{ 
              color: '#CFE0DA', 
              textDecoration: 'none', 
              cursor: 'pointer',
              transition: 'color 0.15s ease' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#B7DFCA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CFE0DA'; }}
          >
            {isBn ? 'সীমানা' : 'Scope'}
          </a>

          {/* Bilingual Toggle Pill */}
          <span 
            style={{
              display: 'inline-flex',
              border: '1px solid #2C5A5F',
              borderRadius: '999px',
              padding: '3px',
              fontSize: '13px',
              userSelect: 'none',
              background: 'rgba(0,0,0,0.1)'
            }}
          >
            <button
              type="button"
              onClick={() => setLang && setLang('bn')}
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                background: isBn ? '#B7DFCA' : 'transparent',
                color: isBn ? '#10272A' : '#CFE0DA',
                border: 'none',
                fontWeight: isBn ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease'
              }}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLang && setLang('en')}
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                background: !isBn ? '#B7DFCA' : 'transparent',
                color: !isBn ? '#10272A' : '#CFE0DA',
                border: 'none',
                fontWeight: !isBn ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease'
              }}
            >
              EN
            </button>
          </span>
        </div>
      </div>
    </header>
  );
}
