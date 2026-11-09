import React from 'react';
import { createTranslator } from '../i18n/translate';

/**
 * CoreFeaturesSection ("যা যা পাবেন / What you get")
 * 
 * 3 Primary Feature Cards (Accessible buttons):
 * 1. Check a deed (দলিল যাচাই) -> onStartScanning
 * 2. Plot Passport (প্লট পাসপোর্ট) -> onViewPassport
 * 3. Land Guardian (ল্যান্ড গার্ডিয়ান) -> onViewGuardian
 */
export default function CoreFeaturesSection({
  lang = 'bn',
  onStartScanning,
  onViewPassport,
  onViewGuardian
}) {
  const t = createTranslator(lang);

  const cards = [
    {
      id: 'check-deed',
      title: t('landing_card_check_title'),
      badge: null,
      desc: t('landing_card_check_desc'),
      onClick: onStartScanning
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
          padding: '60px 24px 70px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 
            style={{
              fontFamily: "'Anek Bangla', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(32px, 4vw, 44px)',
              letterSpacing: '-0.5px',
              margin: '0 0 10px',
              color: '#0D2B2E'
            }}
          >
            {t('landing_features_title')}
          </h2>
          <p 
            style={{
              fontSize: '18px',
              color: '#556A64',
              margin: 0
            }}
          >
            {t('landing_features_subtitle')}
          </p>
        </div>

        {/* 3 Primary Feature Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              id={`feature-card-${card.id}`}
              onClick={card.onClick}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px 28px',
                textAlign: 'left',
                border: '1px solid #D6E3DE',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                fontFamily: "'Hind Siliguri', system-ui, sans-serif",
                color: '#10272A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#005A5B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#D6E3DE';
              }}
            >
              <div>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '14px' 
                  }}
                >
                  <h3 
                    style={{
                      fontFamily: "'Anek Bangla', system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: '22px',
                      margin: 0,
                      color: '#0D2B2E',
                      lineHeight: 1.25
                    }}
                  >
                    {card.title}
                  </h3>
                  {card.badge && (
                    <span 
                      style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.3px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>
                <p 
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: '#556A64',
                    margin: 0
                  }}
                >
                  {card.desc}
                </p>
              </div>

              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#005A5B',
                  marginTop: '20px'
                }}
              >
                {t('landing_card_view_btn')} →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
