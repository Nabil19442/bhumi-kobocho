import React from 'react';
import { 
  ScanText, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Compass,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import Parcel3DVisual from './Parcel3DVisual';

/**
 * LandingHero
 * 
 * Immersive split-layout hero for "The Living Land Map":
 * - Left side:
 *   - Label: "AI-POWERED LAND INTELLIGENCE"
 *   - Editorial headline: "Every Plot Has a Story. Verify Yours."
 *     (with "Verify" highlighted in survey blue accent)
 *   - Short meaningful description of deed verification and ownership audit
 *   - Primary CTA: "Verify a Land Document" / "দলিল যাচাই করুন"
 *   - Secondary CTA: "Explore Land Guardian" / "Land Guardian দেখুন"
 * - Right side:
 *   - "The Living Land Map" visual (Parcel3DVisual)
 */
export default function LandingHero({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport,
  onViewGuardian,
  onViewReports,
  onHowItWorks 
}) {
  const isBn = lang === 'bn';

  return (
    <section 
      className="living-land-hero-section" 
      style={{
        position: 'relative',
        padding: 'clamp(32px, 4.5vw, 54px) 0 clamp(32px, 4.5vw, 54px)',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--line)',
        overflow: 'hidden',
        color: 'var(--text-main)'
      }}
    >
      {/* Subtle Cadastral Mouza Grid Texture Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 75% 25%, rgba(39, 66, 160, 0.05) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(16, 39, 42, 0.03) 0%, transparent 50%),
            linear-gradient(rgba(16, 39, 42, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 39, 42, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
          opacity: 0.9,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div 
        className="landing-container" 
        style={{
          position: 'relative',
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop)',
          boxSizing: 'border-box',
          zIndex: 1
        }}
      >
        {/* Two-Column Responsive Split Layout */}
        <div 
          className="hero-split-grid" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.22fr)',
            gap: 'clamp(24px, 3.5vw, 44px)',
            alignItems: 'center'
          }}
        >
          {/* =================================================================
              LEFT COLUMN: EDITORIAL TYPOGRAPHY & INTELLIGENCE ACTION
             ================================================================= */}
          <div className="hero-editorial-column" style={{ zIndex: 2 }}>
            {/* Small Elegant Label */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-std)',
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              color: 'var(--primary-accent)',
              fontSize: '0.74rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              marginBottom: '14px',
              letterSpacing: '0.8px'
            }}>
              <Compass size={13} color="var(--primary-accent)" />
              <span>AI-POWERED LAND INTELLIGENCE</span>
            </div>

            {/* Large Editorial Headline */}
            <h1 
              className="hero-editorial-heading" 
              style={{
                fontSize: 'clamp(2.1rem, 3.8vw, 3.3rem)',
                lineHeight: 1.15,
                fontWeight: 900,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}
            >
              {isBn ? (
                <>
                  প্রতিটি প্লটের একটি গল্প আছে।<br />
                  <span style={{ color: 'var(--primary-accent)' }}>যাচাই</span> করুন আপনারটি।
                </>
              ) : (
                <>
                  Every Plot Has a Story.<br />
                  <span style={{ color: 'var(--primary-accent)' }}>Verify</span> Yours.
                </>
              )}
            </h1>

            {/* Short, Meaningful Description */}
            <p 
              className="hero-editorial-subheading" 
              style={{
                fontSize: 'clamp(0.98rem, 1.22vw, 1.12rem)',
                lineHeight: 1.6,
                color: 'var(--text-body)',
                fontFamily: 'var(--font-body)',
                marginBottom: '24px',
                maxWidth: '520px'
              }}
            >
              {isBn ? (
                <>
                  জমির দলিল স্ক্যান করুন, ঐতিহাসিক মালিকানা চেইন ট্র্যাক করুন এবং ক্রয়ের পূর্বেই সম্ভাব্য বিরোধ শনাক্ত করুন।
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.90rem', color: 'var(--text-muted)' }}>
                    Analyze deeds, trace historical ownership chains, and detect hidden legal conflicts with transparent digital land records.
                  </span>
                </>
              ) : (
                'Analyze land documents, trace historical ownership chains, and detect legal conflicts with transparent, evidence-backed digital land intelligence.'
              )}
            </p>

            {/* Call to Actions: Primary & Secondary */}
            <div 
              className="hero-actions-group" 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '22px'
              }}
            >
              {/* Primary CTA: Verify a Land Document */}
              <button
                type="button"
                id="hero-verify-document-btn"
                onClick={onStartScanning}
                className="btn-primary"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'var(--primary-accent)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(39, 66, 160, 0.32)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'var(--primary-accent-hover)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(39, 66, 160, 0.42)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.background = 'var(--primary-accent)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(39, 66, 160, 0.32)';
                }}
              >
                <ScanText size={18} />
                <span>{isBn ? 'দলিল যাচাই করুন' : 'Verify a Land Document'}</span>
              </button>

              {/* Secondary CTA: Explore Land Guardian */}
              <button
                type="button"
                id="hero-explore-guardian-btn"
                onClick={onViewGuardian || onStartScanning}
                className="btn-secondary"
                style={{
                  height: '48px',
                  padding: '0 20px',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'var(--paper)',
                  color: 'var(--text-main)',
                  border: '1.5px solid var(--text-main)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, transform 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--paper)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                <ShieldAlert size={17} color="var(--primary-accent)" />
                <span>{isBn ? 'Land Guardian দেখুন' : 'Explore Land Guardian'}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Editorial Features Micro-Specifier */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={15} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'স্বয়ংক্রিয় দ্বৈত বিক্রয় ও সীমানা বিরোধ শনাক্তকরণ অ্যালগরিদম' : 'Automated duplicate sale & boundary dispute detection engine'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={15} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'মৌজা আরএস/বিএস রেকর্ডের সাথে চেইন অফ কাস্টডি টাইমলাইন অডিট' : 'Cross-checked chain of custody audit against mouza surveys'}</span>
              </div>
            </div>

            {/* Mandatory Demo Dataset Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-std)',
              background: '#FDEEE9',
              border: '1px solid #F3BFB3',
              color: '#9A2C14',
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}>
              <Info size={12} style={{ flexShrink: 0, color: '#9A2C14' }} />
              <span>{isBn ? 'ডেমো ডেটাবেস — ক্রয়ের পূর্বে বিরোধ সতর্কীকরণ ব্যবস্থা, চূড়ান্ত আইনি রায় নয়।' : 'DEMO DATABASE — preliminary pre-purchase intelligence aid, not official legal verdict.'}</span>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: "THE LIVING LAND MAP" (Single Unified Composition)
             ================================================================= */}
          <div className="hero-living-map-column" style={{ position: 'relative', zIndex: 2 }}>
            <Parcel3DVisual
              lang={lang}
              onStartScanning={onStartScanning}
              onViewPassport={onViewPassport}
              onViewReports={onViewReports}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-split-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .hero-editorial-column {
            text-align: left;
          }
          .hero-living-map-column {
            order: 2;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
