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
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-cadastral)',
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
            radial-gradient(circle at 78% 28%, rgba(39, 66, 160, 0.06) 0%, transparent 60%),
            radial-gradient(circle at 18% 75%, rgba(16, 39, 42, 0.04) 0%, transparent 50%),
            linear-gradient(rgba(16, 39, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 39, 42, 0.04) 1px, transparent 1px)
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
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.3fr)',
            gap: 'clamp(24px, 3.5vw, 44px)',
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
              borderRadius: 'var(--radius-std)',
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              color: 'var(--primary-accent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: '20px',
              letterSpacing: '0.4px',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <Sparkles size={14} color="var(--primary-accent)" />
              <span>LANDTECH INNOVATION HACKATHON 2026 • TEAM ZENOX</span>
            </div>

            {/* Main Heading Requested by User */}
            <h1 
              className="hero-heading" 
              style={{
                fontSize: 'clamp(2.3rem, 4.4vw, 3.8rem)',
                lineHeight: 1.16,
                fontWeight: 900,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '20px',
                letterSpacing: '-0.5px'
              }}
            >
              {isBn ? (
                <>
                  জমির নিরাপত্তায়,<br />
                  <span style={{
                    background: 'linear-gradient(90deg, #2742A0 0%, #1A2E70 100%)',
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
                    background: 'linear-gradient(90deg, #2742A0 0%, #1A2E70 100%)',
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
                color: 'var(--text-body)',
                fontFamily: 'var(--font-body)',
                marginBottom: '32px',
                maxWidth: '560px'
              }}
            >
              AI-powered land document verification and ownership conflict detection for a safer land transaction.
              {isBn && (
                <span style={{ display: 'block', marginTop: '6px', fontSize: '0.96rem', color: 'var(--text-muted)' }}>
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
                className="btn-primary"
                style={{
                  height: '52px',
                  padding: '0 28px',
                  fontSize: '1.04rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'var(--primary-accent)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(39, 66, 160, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'var(--primary-accent-hover)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(39, 66, 160, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.background = 'var(--primary-accent)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(39, 66, 160, 0.35)';
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
                className="btn-secondary"
                style={{
                  height: '52px',
                  padding: '0 24px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'var(--bg-paper)',
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
                  e.currentTarget.style.background = 'var(--bg-paper)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                <ShieldAlert size={18} color="var(--primary-accent)" />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={17} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? '২০,০০০+ কৃত্রিম লেনদেনের সাথে স্বয়ংক্রিয় দ্বৈত বিক্রয় ও ওভারল্যাপ যাচাই' : 'Automated duplicate sale & overlap verification against 20,000+ records'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={17} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'মালিকানা ধারাবাহিকতা টাইমলাইন ও নিরপেক্ষ প্রমাণ প্রতিবেদন' : 'Evidence-backed chain of custody timeline & risk report'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={17} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'স্থায়ী পার্সেল আইডি ভিত্তিক ডিজিটাল প্লট পাসপোর্ট ও কিউআর সনদ' : 'Plot Passport & cryptographically hashed QR certificate'}</span>
              </div>
            </div>

            {/* Visible Hero Disclaimer Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-std)',
              background: '#FDEEE9',
              border: '1px solid #F3BFB3',
              color: '#9A2C14',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}>
              <Info size={14} style={{ flexShrink: 0, color: '#9A2C14' }} />
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
        @media (max-width: 1024px) {
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
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
