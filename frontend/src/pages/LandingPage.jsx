import React from 'react';
import LandingHero from '../components/LandingHero';

/**
 * LandingPage
 * 
 * Complete Option C Reference Design:
 * 1. Hero: Dark #0D2B2E background with headline, description, primary CTA and rotated specimen deed
 * 2. Features Section (#c): Light curved container (#F1F5F0) with "যা যা পাবেন" and 4 feature cards
 * 3. Scope / Philosophy Banner (#d): "নিয়ম সিদ্ধান্ত নেয়, এআই শুধু ব্যাখ্যা করে"
 * 4. Final CTA: "এখনই শুরু করুন →"
 * 5. Hackathon Footer: Team ZENOX · LandTech Innovation Hackathon 2026
 */
export default function LandingPage({
  lang = 'bn',
  onStartScanning,
  onStartCompare,
  onViewPassport,
  onViewGuardian
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
            {isBn ? 'যা যা পাবেন' : 'What You Get'}
          </h2>

          {/* 4 Feature Cards Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px'
            }}
          >
            {/* Card 1: Deed Scanner */}
            <div 
              className="ref-feature-card"
              onClick={onStartScanning}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD8D2',
                borderRadius: '18px',
                padding: '26px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div 
                style={{
                  fontFamily: "'Anek Bangla', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  color: '#10272A'
                }}
              >
                {isBn ? 'দলিল স্ক্যানার' : 'Deed Scanner'}
              </div>
              <div 
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: '#2D4649',
                  marginTop: '8px'
                }}
              >
                {isBn
                  ? 'বাংলা ও ইংরেজি দলিল থেকে তথ্য পড়ে। আপনি ঠিক করে নিতে পারবেন।'
                  : 'Reads deed information from Bengali & English documents. You can review and edit instantly.'}
              </div>
            </div>

            {/* Card 2: Discrepancy Detection */}
            <div 
              className="ref-feature-card"
              onClick={onStartCompare}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD8D2',
                borderRadius: '18px',
                padding: '26px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div 
                style={{
                  fontFamily: "'Anek Bangla', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  color: '#10272A'
                }}
              >
                {isBn ? 'অমিল শনাক্ত' : 'Discrepancy Detection'}
              </div>
              <div 
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: '#2D4649',
                  marginTop: '8px'
                }}
              >
                {isBn
                  ? 'নাম, খতিয়ান, দাগ, পরিমাণ আর তারিখ মেলায়। প্রতিটির কারণ বলে দেয়।'
                  : 'Cross-checks owner name, khatian, dag, area, and dates. Explains the exact reason for any conflict.'}
              </div>
            </div>

            {/* Card 3: Plot Passport */}
            <div 
              className="ref-feature-card"
              onClick={() => onViewPassport && onViewPassport('PCL-DHK-SAV-045-0558')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD8D2',
                borderRadius: '18px',
                padding: '26px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div 
                style={{
                  fontFamily: "'Anek Bangla', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  color: '#10272A'
                }}
              >
                {isBn ? 'প্লট পাসপোর্ট' : 'Plot Passport'}
              </div>
              <div 
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: '#2D4649',
                  marginTop: '8px'
                }}
              >
                {isBn
                  ? 'এক পাতায় রেকর্ডের সারাংশ, টাইমলাইন আর কিউআর কোড।'
                  : 'A single-page digital deed summary with ownership timeline and verifiable QR code.'}
              </div>
            </div>

            {/* Card 4: Land Guardian */}
            <div 
              className="ref-feature-card"
              onClick={onViewGuardian}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD8D2',
                borderRadius: '18px',
                padding: '26px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div 
                style={{
                  fontFamily: "'Anek Bangla', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  color: '#10272A'
                }}
              >
                {isBn ? 'ল্যান্ড গার্ডিয়ান' : 'Land Guardian'}
              </div>
              <div 
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: '#2D4649',
                  marginTop: '8px'
                }}
              >
                {isBn
                  ? 'রেকর্ড বদলের সিমুলেটেড সতর্কবার্তা। বাস্তব সিস্টেম নজরদারি নয়।'
                  : 'Simulated mutation & transaction alerts. Educational simulation, not government surveillance.'}
              </div>
            </div>
          </div>
        </div>

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
              ? 'অমিল মানে আরও যাচাইয়ের সংকেত, জালিয়াতির প্রমাণ নয়।'
              : 'A discrepancy signals the need for further inquiry, not definitive proof of fraud.'}
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
