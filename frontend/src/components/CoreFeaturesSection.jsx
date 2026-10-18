import React from 'react';
import bnTranslations from '../i18n/bn.json';
import enTranslations from '../i18n/en.json';

/**
 * CoreFeaturesSection ("যা যা পাবেন / What you get")
 * 
 * 4 Core Feature Cards (Accessible buttons):
 * 1. Check a deed (দলিল যাচাই) -> onStartScanning
 * 2. Land price analysis (জমির দাম বিশ্লেষণ) [ML · Experimental badge] -> onViewLandPrice
 * 3. Plot Passport (প্লট পাসপোর্ট) -> onViewPassport
 * 4. Land Guardian (ল্যান্ড গার্ডিয়ান) -> onViewGuardian
 */
export default function CoreFeaturesSection({
  lang = 'bn',
  onStartScanning,
  onViewLandPrice,
  onViewPassport,
  onViewGuardian
}) {
  const t = (key) => {
    const dict = lang === 'bn' ? bnTranslations : enTranslations;
    return dict[key] || bnTranslations[key] || key;
  };

  const cards = [
    {
      id: 'check-deed',
      title: t('landing_card_check_title'),
      badge: null,
      desc: t('landing_card_check_desc'),
      onClick: onStartScanning
    },
    {
      id: 'land-price',
      title: t('landing_card_price_title'),
      badge: t('landing_card_price_badge'),
      desc: t('landing_card_price_desc'),
      onClick: onViewLandPrice
    },
    {
      id: 'plot-passport',
      title: t('landing_card_passport_title'),
      badge: null,
      desc: t('landing_card_passport_desc'),
      onClick: () => onViewPassport && onViewPassport('PCL-DHK-SAV-045-0558')
    },
    {
      id: 'land-guardian',
      title: t('landing_card_guardian_title'),
      badge: null,
      desc: t('landing_card_guardian_desc'),
      onClick: onViewGuardian
    }
  ];

  return (
    <div 
      id="c"
      style={{
        background: '#F1F5F0',
        color: '#10272A',
        borderRadius: '40px 40px 0 0',
        position: 'relative',
        zIndex: 2
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '72px 24px',
          boxSizing: 'border-box'
        }}
      >
        {/* Section Heading */}
        <h2 
          style={{
            fontFamily: "'Anek Bangla', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 40px)',
            margin: '0 0 34px',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}
        >
          {t('landing_what_you_get')}
        </h2>

        {/* 4 Feature Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px'
          }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className="ref-feature-card"
              onClick={card.onClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                background: '#FFFFFF',
                border: '1.5px solid #CBD8D2',
                borderRadius: '18px',
                padding: '26px',
                cursor: 'pointer',
                minHeight: '44px',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: "'Hind Siliguri', system-ui, sans-serif",
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                outline: 'none'
              }}
            >
              <div 
                style={{
                  fontFamily: "'Anek Bangla', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  color: '#10272A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: '100%'
                }}
              >
                <span>{card.title}</span>
                {card.badge && (
                  <span 
                    style={{
                      fontSize: '11px',
                      background: '#E6F4EA',
                      color: '#137333',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontFamily: "'Hind Siliguri', system-ui, sans-serif",
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <div 
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: '#2D4649',
                  marginTop: '8px'
                }}
              >
                {card.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Card Hover and Accessible Focus Effects */}
      <style>{`
        .ref-feature-card:hover {
          transform: translateY(-4px) !important;
          border-color: #B7DFCA !important;
          box-shadow: 0 12px 28px rgba(16, 39, 42, 0.08) !important;
        }
        .ref-feature-card:focus-visible {
          outline: 2px solid #0D2B2E !important;
          outline-offset: 3px !important;
          border-color: #0D2B2E !important;
        }
      `}</style>
    </div>
  );
}
