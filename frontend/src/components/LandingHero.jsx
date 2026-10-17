import { 
  ScanText, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import Parcel3DVisual from './Parcel3DVisual';

export default function LandingHero({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport,
  onViewGuardian,
  onHowItWorks 
}) {
  const isBn = lang === 'bn';

  return (
    <section 
      className="landing-hero-section-3d" 
      style={{
        position: 'relative',
        padding: 'clamp(40px, 6vw, 76px) 0 clamp(48px, 7vw, 84px)',
        background: 'linear-gradient(145deg, #061819 0%, #0A2629 45%, #051416 100%)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.2)',
        overflow: 'hidden',
        color: '#FFFFFF'
      }}
    >
      {/* Subtle Topographic & Grid Background Texture */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 78% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(39, 66, 160, 0.14) 0%, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
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
        {/* Two-Column Responsive Grid */}
        <div 
          className="hero-grid-3d" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 1fr)',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center'
          }}
        >
          {/* Column 1: Hero Text & CTAs */}
          <div className="hero-text-block" style={{ zIndex: 2 }}>
            {/* Hackathon & Brand Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#6EE7B7',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: '20px',
              letterSpacing: '0.4px',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)'
            }}>
              <Sparkles size={14} color="#34D399" />
              <span>LANDTECH INNOVATION HACKATHON 2026 • TEAM ZENOX</span>
            </div>

            {/* Main Heading Requested by User */}
            <h1 
              className="hero-heading" 
              style={{
                fontSize: 'clamp(2.3rem, 4.4vw, 3.8rem)',
                lineHeight: 1.16,
                fontWeight: 900,
                color: '#FFFFFF',
                fontFamily: 'var(--font-heading)',
                marginBottom: '20px',
                letterSpacing: '-0.5px'
              }}
            >
              {isBn ? (
                <>
                  জমির নিরাপত্তায়,<br />
                  <span style={{
                    background: 'linear-gradient(90deg, #34D399 0%, #10B981 40%, #60A5FA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}>
                    প্রযুক্তির নিশ্চয়তা
                  </span>
                </>
              ) : (
                <>
                  Land Security with<br />
                  <span style={{
                    background: 'linear-gradient(90deg, #34D399 0%, #10B981 40%, #60A5FA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}>
                    Technological Assurance
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle Requested by User */}
            <p 
              className="hero-subheading" 
              style={{
                fontSize: 'clamp(1.02rem, 1.35vw, 1.2rem)',
                lineHeight: 1.65,
                color: '#CBD5E1',
                fontFamily: 'var(--font-body)',
                marginBottom: '32px',
                maxWidth: '560px'
              }}
            >
              AI-powered land document verification and ownership conflict detection for a safer land transaction.
              {isBn && (
                <span style={{ display: 'block', marginTop: '6px', fontSize: '0.96rem', color: '#94A3B8' }}>
                  নিরাপদ জমি লেনদেনের জন্য কৃত্রিম বুদ্ধিমত্তা ভিত্তিক দলিল যাচাই এবং সম্ভাব্য মালিকানা বিরোধ শনাক্তকরণ।
                </span>
              )}
            </p>

            {/* Action Buttons: Primary CTA & Secondary CTA */}
            <div 
              className="hero-cta-group" 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '32px'
              }}
            >
              {/* Primary CTA: দলিল যাচাই করুন */}
              <button
                type="button"
                id="hero-primary-cta"
                onClick={onStartScanning}
                style={{
                  height: '52px',
                  padding: '0 28px',
                  fontSize: '1.04rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #34D399',
                  boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(16, 185, 129, 0.45)';
                }}
              >
                <ScanText size={20} />
                <span>{isBn ? 'দলিল যাচাই করুন' : 'Verify Deed Now'}</span>
              </button>

              {/* Secondary CTA: Land Guardian দেখুন */}
              <button
                type="button"
                id="hero-secondary-cta"
                onClick={onViewGuardian || onStartScanning}
                style={{
                  height: '52px',
                  padding: '0 24px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#F1F5F9',
                  border: '1px solid rgba(167, 243, 208, 0.35)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = '#34D399';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(167, 243, 208, 0.35)';
                }}
              >
                <ShieldAlert size={18} color="#34D399" />
                <span>{isBn ? 'Land Guardian দেখুন' : 'Explore Land Guardian'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Three Reassurance Key Feature Points */}
            <div 
              className="hero-reassurance-list" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '26px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#E2E8F0', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={17} style={{ color: '#34D399', flexShrink: 0 }} />
                <span>{isBn ? '২০,০০০+ কৃত্রিম লেনদেনের সাথে স্বয়ংক্রিয় দ্বৈত বিক্রয় ও ওভারল্যাপ যাচাই' : 'Automated duplicate sale & overlap verification against 20,000+ records'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#E2E8F0', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={17} style={{ color: '#34D399', flexShrink: 0 }} />
                <span>{isBn ? 'মালিকানা ধারাবাহিকতা টাইমলাইন ও নিরপেক্ষ প্রমাণ প্রতিবেদন' : 'Evidence-backed chain of custody timeline & risk report'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#E2E8F0', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={17} style={{ color: '#34D399', flexShrink: 0 }} />
                <span>{isBn ? 'স্থায়ী পার্সেল আইডি ভিত্তিক ডিজিটাল প্লট পাসপোর্ট ও কিউআর সনদ' : 'Plot Passport & cryptographically hashed QR certificate'}</span>
              </div>
            </div>

            {/* Visible Hero Disclaimer Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#FCA5A5',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}>
              <Info size={14} style={{ flexShrink: 0, color: '#F87171' }} />
              <span>{isBn ? 'ডেমো ডেটা — নাগরিক বিরোধ সতর্কীকরণ ব্যবস্থা, সরকারি দলিলের আইনি রায় নয়।' : 'DEMO DATABASE — preliminary pre-purchase verification aid, not official legal title.'}</span>
            </div>
          </div>

          {/* Column 2: 3D Floating Land Parcel Visual */}
          <div className="hero-3d-visual-column" style={{ position: 'relative', zIndex: 2 }}>
            <Parcel3DVisual
              lang={lang}
              onStartScanning={onStartScanning}
              onViewPassport={onViewPassport}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid-3d {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .hero-text-block {
            text-align: left;
          }
          .hero-3d-visual-column {
            order: 2;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
