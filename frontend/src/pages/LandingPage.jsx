import React from 'react';
import LandingHero from '../components/LandingHero';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import LandPricePreviewSection from '../components/LandPricePreviewSection';

/**
 * LandingPage
 * 
 * Complete Option C Reference Design:
 * 1. Hero: Dark #0D2B2E background with headline, description, primary CTA and rotated specimen deed
 * 2. Features Section (#c): Light curved container (#F1F5F0) with "যা যা পাবেন" and 4 accessible feature cards
 * 3. Rural Land Price Preview Section
 * 4. Scope / Philosophy Banner (#d): "নিয়ম সিদ্ধান্ত নেয়, এআই শুধু ব্যাখ্যা করে"
 * 5. Final CTA: "এখনই শুরু করুন →"
 * 6. Hackathon Footer: Team ZENOX · LandTech Innovation Hackathon 2026
 */
export default function LandingPage({
  lang = 'bn',
  onStartScanning,
  onStartCompare,
  onViewPassport,
  onViewGuardian,
  onViewLandPrice
}) {
  const isBn = lang === 'bn';

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

      {/* 2. Curved Light Features Container (#c) */}
      <CoreFeaturesSection
        lang={lang}
        onStartScanning={onStartScanning}
        onViewLandPrice={onViewLandPrice}
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
        {/* 3. Rural Land Price Intelligence Preview Section */}
        <LandPricePreviewSection
          lang={lang}
          onViewLandPrice={onViewLandPrice}
        />

        {/* 4. Dark Philosophy / Scope Box Banner (#d) */}
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
            {isBn ? 'নিয়ম সিদ্ধান্ত নেয়, এআই শুধু ব্যাখ্যা করে' : 'Rules decide, AI only explains'}
          </div>
          <div 
            style={{
              fontSize: '16px',
              color: '#B7C9C3',
              marginTop: '8px',
              lineHeight: 1.6
            }}
          >
            {isBn
              ? 'প্রদর্শিত তথ্য জমি বোঝার জন্য প্রাথমিক সংকেত, আদালতের আইনি রায় বা জালিয়াতির প্রমাণ নয়।'
              : 'Displayed information helps you understand the land, not a court verdict or proof of fraud.'}
          </div>
        </div>

        {/* 4. Final CTA Button */}
        <div style={{ padding: '50px 24px 56px', textAlign: 'center' }}>
          <button
            type="button"
            id="landing-final-cta"
            onClick={onStartScanning}
            style={{
              display: 'inline-block',
              background: '#10272A',
              color: '#FFFFFF',
              padding: '18px 34px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '18px',
              fontFamily: "'Hind Siliguri', system-ui, sans-serif",
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 39, 42, 0.2)',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#1A3F44';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#10272A';
            }}
          >
            {isBn ? 'এখনই শুরু করুন →' : 'Get Started Now →'}
          </button>
        </div>

        {/* 5. Hackathon Footer */}
        <footer 
          style={{
            background: '#10272A',
            color: '#B7C9C3',
            padding: '24px',
            textAlign: 'center',
            fontSize: '13px',
            lineHeight: 1.7,
            fontFamily: "'Hind Siliguri', system-ui, sans-serif"
          }}
        >
          {isBn ? (
            <>
              ডেমো ডেটা: আইনি রায় নয়। সব নাম, দলিল ও খতিয়ান কাল্পনিক。<br />
              Team ZENOX · LandTech Innovation Hackathon 2026
            </>
          ) : (
            <>
              Demo data: Not a legal verdict. All names, deeds, and khatians are fictitious.<br />
              Team ZENOX · LandTech Innovation Hackathon 2026
            </>
          )}
        </footer>
      </div>

      {/* Feature Card Hover Effects */}
      <style>{`
        .ref-feature-card:hover {
          transform: translateY(-4px) !important;
          border-color: #B7DFCA !important;
          box-shadow: 0 12px 28px rgba(16, 39, 42, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
