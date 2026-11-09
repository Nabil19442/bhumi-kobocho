import React from 'react';
import LandingHero from '../components/LandingHero';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import LandingFooter from '../components/LandingFooter';
import bnTranslations from '../i18n/bn.json';
import enTranslations from '../i18n/en.json';

/**
 * LandingPage
 * Primary citizen flow: Check Before You Buy -> Plot Passport -> Land Guardian
 */
export default function LandingPage({
  lang = 'bn',
  onStartScanning,
  onViewPassport,
  onViewGuardian,
  onStartWalkthrough
}) {
  const isBn = lang === 'bn';
  const t = (key) => {
    const dict = isBn ? bnTranslations : enTranslations;
    return dict[key] || bnTranslations[key] || key;
  };

  return (
    <div 
      className="landing-ref-page"
      style={{
        width: '100%',
        background: '#0D2B2E',
        color: '#FFFFFF',
        fontFamily: "'Hind Siliguri', system-ui, sans-serif",
        overflowX: 'hidden'
      }}
    >
      {/* 1. Hero Section: Headline, CTA & Rotated Specimen Deed */}
      <LandingHero
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* Optional Walkthrough Banner */}
      {onStartWalkthrough && (
        <div style={{ background: '#092123', padding: '12px 24px', textAlign: 'center', borderTop: '1px solid #1A3E42' }}>
          <button
            type="button"
            id="demo-walkthrough-btn"
            onClick={onStartWalkthrough}
            style={{
              background: '#005A5B',
              color: '#FFFFFF',
              border: '1px solid #B7DFCA',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🎯</span>
            <span>{isBn ? 'বিচারক ও পরীক্ষকদের জন্য নির্দেশিত ডেমো ওয়াকথ্রু (Demo Walkthrough)' : 'Guided Judge & Evaluator Demo Walkthrough'}</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* 2. Curved Light Features Container (#c) */}
      <CoreFeaturesSection
        lang={lang}
        onStartScanning={onStartScanning}
        onViewPassport={onViewPassport}
        onViewGuardian={onViewGuardian}
      />

      <div 
        style={{
          background: '#F1F5F0',
          color: '#10272A',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* 3. Dark Philosophy / Scope Box Banner (#d) */}
        <div 
          id="d"
          style={{
            background: '#0D2B2E',
            color: '#FFFFFF',
            margin: '0 24px',
            borderRadius: '28px',
            maxWidth: '1152px',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '40px 24px',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}
        >
          <div 
            style={{
              fontFamily: "'Anek Bangla', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(22px, 3.2vw, 30px)',
              letterSpacing: '-0.3px'
            }}
          >
            {t('landing_scope_banner_quote')}
          </div>
          <p 
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#B7DFCA',
              maxWidth: '680px',
              margin: '12px auto 0'
            }}
          >
            {t('landing_scope_banner_desc')}
          </p>
        </div>

        {/* 4. Final CTA Section */}
        <div 
          style={{
            textAlign: 'center',
            padding: '70px 24px 80px',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          <h2 
            style={{
              fontFamily: "'Anek Bangla', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              margin: '0 0 16px',
              color: '#0D2B2E'
            }}
          >
            {t('landing_final_cta_heading')}
          </h2>
          <p 
            style={{
              fontSize: '17px',
              color: '#556A64',
              lineHeight: 1.6,
              margin: '0 0 32px'
            }}
          >
            {t('landing_final_cta_desc')}
          </p>
          <button
            type="button"
            id="landing-bottom-cta"
            onClick={onStartScanning}
            style={{
              display: 'inline-block',
              background: '#005A5B',
              color: '#FFFFFF',
              padding: '16px 36px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '17px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Hind Siliguri', system-ui, sans-serif",
              boxShadow: '0 4px 14px rgba(0, 90, 91, 0.25)',
              transition: 'background 0.15s ease, transform 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#004849';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#005A5B';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {t('landing_final_cta_btn')}
          </button>
        </div>
      </div>

      {/* 5. Hackathon Footer with Team ZENOX */}
      <LandingFooter lang={lang} />
    </div>
  );
}
