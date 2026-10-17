import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Info, Layers, Sparkles, ScanText } from 'lucide-react';
import DeedScanVisual from './DeedScanVisual';

export default function LandingHero({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport,
  onHowItWorks 
}) {
  const isBn = lang === 'bn';

  return (
    <section className="landing-hero-section" style={{
      padding: '48px 0 64px',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid #CAD7CF',
      overflow: 'hidden'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        {/* Two-Column Responsive Grid */}
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '44px',
          alignItems: 'center'
        }}>
          {/* Column 1: Value Proposition & CTAs */}
          <div className="hero-text-block">
            {/* Hackathon & Team Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-std)',
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              color: 'var(--primary-accent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: '20px',
              letterSpacing: '0.3px'
            }}>
              <span>LANDTECH INNOVATION HACKATHON 2026</span>
              <span>•</span>
              <span>TEAM ZENOX</span>
            </div>

            {/* Required Headline: Verify Before You Buy Land */}
            <h1 className="hero-heading" style={{
              fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)',
              lineHeight: 1.18,
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '18px',
              letterSpacing: '-0.5px'
            }}>
              {isBn ? (
                <>
                  জমি কেনার আগেই<br />
                  <span style={{
                    color: 'var(--primary-accent)',
                    borderBottom: '4px solid var(--primary-accent)',
                    paddingBottom: '2px',
                    display: 'inline-block'
                  }}>
                    যাচাই করুন
                  </span>
                </>
              ) : (
                <>
                  Verify Before You<br />
                  <span style={{
                    color: 'var(--primary-accent)',
                    borderBottom: '4px solid var(--primary-accent)',
                    paddingBottom: '2px',
                    display: 'inline-block'
                  }}>
                    Buy Land
                  </span>
                </>
              )}
            </h1>

            {/* Required Supporting Text */}
            <p className="hero-subheading" style={{
              fontSize: 'clamp(1.04rem, 1.3vw, 1.18rem)',
              lineHeight: 1.62,
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              marginBottom: '28px',
              maxWidth: '540px'
            }}>
              {isBn
                ? 'দলিল স্ক্যান করুন, পূর্ববর্তী লেনদেনের ইতিহাস দেখুন এবং জমি কেনার সিদ্ধান্ত নেওয়ার আগেই সম্ভাব্য বিরোধ ও দ্বৈত বিক্রয় শনাক্ত করুন।'
                : 'Scan land deeds, explore previous transaction history, and identify potential land transaction conflicts before making a purchase decision.'}
            </p>

            {/* Action Buttons: Primary CTA & Secondary CTA */}
            <div className="hero-cta-group" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '28px'
            }}>
              {/* Primary CTA: Verify a Land Deed */}
              <button
                type="button"
                id="hero-primary-cta"
                onClick={onStartScanning}
                className="btn-primary"
                style={{
                  height: '50px',
                  padding: '0 26px',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  boxShadow: 'var(--shadow-hard-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px'
                }}
              >
                <ScanText size={18} />
                <span>{isBn ? 'দলিল যাচাই শুরু করুন' : 'Verify a Land Deed'}</span>
              </button>

              {/* Secondary CTA: Explore How It Works */}
              <button
                type="button"
                id="hero-secondary-cta"
                onClick={onHowItWorks || onStartScanning}
                className="btn-secondary"
                style={{
                  height: '50px',
                  padding: '0 22px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  border: '1.5px solid var(--text-main)',
                  background: 'var(--bg-paper)',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px'
                }}
              >
                <span>{isBn ? 'কীভাবে কাজ করে জানুন' : 'Explore How It Works'}</span>
              </button>
            </div>

            {/* Three Short Reassurance Points */}
            <div className="hero-reassurance-list" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={16} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? '২০,০০০+ কৃত্রিম লেনদেন রেকর্ডের সাথে স্বয়ংক্রিয় তুলনা' : 'Automated comparison against 20,000+ transaction records'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={16} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'সম্ভাব্য দ্বৈত বিক্রয় ও অতিরিক্ত জমির পরিমাণ চিহ্নিতকরণ' : 'Duplicate sale and overlapping land portion detection'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={16} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'স্থায়ী পার্সেল আইডি ভিত্তিক প্লট পাসপোর্ট ও কিউআর সনদ' : 'Plot Passport & QR code linked to stable Parcel IDs'}</span>
              </div>
            </div>

            {/* Visible Hero Disclaimer Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#FDEEE9',
              border: '1px solid #F3BFB3',
              color: '#9A2C14',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>{isBn ? 'ডেমো ডেটা — কোনো আইনি মালিকানার সনদ বা রায় নয়।' : 'DEMO DATA — preliminary verification, not legal title.'}</span>
            </div>
          </div>

          {/* Column 2: Interactive Deed Scanning & Verification Illustration */}
          <div className="hero-parcel-column">
            <DeedScanVisual
              lang={lang}
              onStartScanning={onStartScanning}
              onViewPassport={onViewPassport}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
