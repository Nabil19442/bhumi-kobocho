import React from 'react';
import bnTranslations from '../i18n/bn.json';
import enTranslations from '../i18n/en.json';

/**
 * LandingHero
 * 
 * Matches Option C reference design:
 * - Left column:
 *   - Editorial typography: "দলিল দেখুন। জমি জানুন।"
 *   - Subtitle: deed reading, previous owners, history, cases, and price
 *   - Primary CTA: "দলিল যাচাই করুন →"
 *   - Badge: "DEMO DATA · NOT A LEGAL VERDICT"
 * - Right column:
 *   - Specimen sale deed card slightly rotated with animated scanning beam
 *   - Informative status pills (Deed details, Previous owners, Case records)
 */
export default function LandingHero({
  lang = 'bn',
  onStartScanning
}) {
  const t = (key) => {
    const dict = lang === 'bn' ? bnTranslations : enTranslations;
    return dict[key] || bnTranslations[key] || key;
  };
  const isBn = lang === 'bn';

  return (
    <section 
      className="landing-hero-ref"
      style={{
        width: '100%',
        background: '#0D2B2E',
        color: '#FFFFFF',
        fontFamily: "'Hind Siliguri', system-ui, sans-serif",
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px 90px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '48px',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side: Headline, Description & CTA */}
        <div style={{ flex: '1 1 460px', minWidth: 0 }}>
          <h1 
            style={{
              fontFamily: "'Anek Bangla', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(44px, 5.2vw, 68px)',
              lineHeight: 1.08,
              margin: '0 0 18px',
              letterSpacing: '-1px',
              color: '#FFFFFF'
            }}
          >
            {t('landing_hero_title_1')}<br />
            <span style={{ color: '#B7DFCA' }}>{t('landing_hero_title_2')}</span>
          </h1>

          <p 
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              lineHeight: 1.65,
              color: '#C4D7D1',
              maxWidth: '500px',
              margin: '0 0 30px'
            }}
          >
            {t('landing_hero_subtitle')}
          </p>

          <button
            type="button"
            id="hero-primary-cta"
            onClick={onStartScanning}
            style={{
              display: 'inline-block',
              background: '#B7DFCA',
              color: '#0D2B2E',
              padding: '18px 32px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '18px',
              fontFamily: "'Hind Siliguri', system-ui, sans-serif",
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#A5D6BD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#B7DFCA';
            }}
          >
            {t('landing_hero_cta')}
          </button>

          <div 
            style={{
              marginTop: '26px',
              fontSize: '14px',
              color: '#8FB3AB',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.5px'
            }}
          >
            {t('landing_hero_disclaimer')}
          </div>
        </div>

        {/* Right Side: Rotated Specimen Sale Deed with Scanning Beam */}
        <div style={{ flex: '1 1 400px', minWidth: 0, maxWidth: '500px' }}>
          <div 
            className="specimen-card"
            style={{
              position: 'relative',
              background: '#FBFCFA',
              color: '#10272A',
              borderRadius: '18px',
              padding: '26px 26px 20px',
              transform: 'rotate(2deg)',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45)',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              border: '1.5px solid transparent'
            }}
          >
            {/* Specimen Header */}
            <div 
              style={{
                fontFamily: "'Anek Bangla', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: '20px',
                textAlign: 'center',
                borderBottom: '2px solid #10272A',
                paddingBottom: '10px',
                marginBottom: '6px'
              }}
            >
              {isBn ? 'বিক্রয় দলিল (নমুনা)' : 'Sale Deed (Sample)'}
            </div>

            {/* Specimen Field Rows */}
            <div className="specimen-row">
              <span style={{ color: '#3C5558' }}>{isBn ? 'মালিকের নাম' : 'Owner Name'}</span>
              <b>{isBn ? 'আব্দুল করিম' : 'Abdul Karim'}</b>
            </div>

            <div className="specimen-row">
              <span style={{ color: '#3C5558' }}>{isBn ? 'খতিয়ান নং' : 'Khatian No'}</span>
              <b>{isBn ? '১২৮' : '128'}</b>
            </div>

            <div className="specimen-row">
              <span style={{ color: '#3C5558' }}>{isBn ? 'দাগ নং' : 'Dag No'}</span>
              <b>{isBn ? '১৫২' : '152'}</b>
            </div>

            <div className="specimen-row">
              <span style={{ color: '#3C5558' }}>{isBn ? 'জমির পরিমাণ' : 'Land Area'}</span>
              <b>{isBn ? '৫.৫০ শতাংশ' : '5.50 Decimal'}</b>
            </div>

            <div className="specimen-row" style={{ border: 'none' }}>
              <span style={{ color: '#3C5558' }}>{isBn ? 'দলিল নং' : 'Deed No'}</span>
              <b>{isBn ? '৯৪৫৩' : '9453'}</b>
            </div>

            {/* Verification Status Badges */}
            <div 
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '12px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <span 
                style={{
                  background: '#DFF1E6',
                  color: '#14633A',
                  border: '1px solid #B7DFCA',
                  padding: '5px 11px',
                  borderRadius: '999px'
                }}
              >
                {t('landing_hero_badge_deed')}
              </span>

              <span 
                style={{
                  background: '#E1F0F5',
                  color: '#0D4B5D',
                  border: '1px solid #B8DFEB',
                  padding: '5px 11px',
                  borderRadius: '999px'
                }}
              >
                {t('landing_hero_badge_owners')}
              </span>

              <span 
                style={{
                  background: '#EAE8F8',
                  color: '#392A72',
                  border: '1px solid #C8C2EC',
                  padding: '5px 11px',
                  borderRadius: '999px'
                }}
              >
                {t('landing_hero_badge_cases')}
              </span>
            </div>

            {/* Animated Laser Scanning Beam */}
            <div className="specimen-beam" />
          </div>
        </div>
      </div>

      {/* Laser Sweep & Pulse Animation Styles */}
      <style>{`
        @keyframes sweep {
          0% { top: 4%; }
          100% { top: 92%; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .specimen-beam {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: #B7DFCA;
          box-shadow: 0 0 22px 4px rgba(183, 223, 202, 0.7);
          animation: sweep 3s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .specimen-hl {
          animation: glow 2.2s ease-in-out infinite;
        }
        .specimen-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px dashed #CBD8D2;
          font-size: 15px;
        }
        .specimen-card:hover {
          transform: translateY(-4px) rotate(2deg) !important;
          border-color: #B7DFCA !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .specimen-beam, .specimen-hl { animation: none; }
        }
      `}</style>
    </section>
  );
}
