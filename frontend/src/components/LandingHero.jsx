import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Info, Layers, Sparkles } from 'lucide-react';
import LandParcel3D from './LandParcel3D';

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

            {/* Exact Required Bangla Hero Heading */}
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
                  কেনার আগে জমির কাগজগুলো<br />
                  <span style={{
                    color: 'var(--primary-accent)',
                    borderBottom: '4px solid var(--primary-accent)',
                    paddingBottom: '2px',
                    display: 'inline-block'
                  }}>
                    মিলিয়ে দেখুন
                  </span>
                </>
              ) : (
                <>
                  Verify land records<br />
                  <span style={{
                    color: 'var(--primary-accent)',
                    borderBottom: '4px solid var(--primary-accent)',
                    paddingBottom: '2px',
                    display: 'inline-block'
                  }}>
                    before buying
                  </span>
                </>
              )}
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="hero-subheading" style={{
              fontSize: 'clamp(1.04rem, 1.3vw, 1.18rem)',
              lineHeight: 1.62,
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              marginBottom: '28px',
              maxWidth: '540px'
            }}>
              {isBn
                ? 'দলিলের তথ্য সাজিয়ে দেখুন, রেকর্ডের সঙ্গে মিল খুঁজুন এবং কোন বিষয়গুলো আরও যাচাই করা দরকার তা সহজে বুঝুন।'
                : 'Organize deed data, spot inconsistencies with official records, and easily understand what needs further verification.'}
            </p>

            {/* Action Buttons: Primary CTA & Secondary CTA */}
            <div className="hero-cta-group" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '28px'
            }}>
              {/* Primary CTA */}
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
                <span>{isBn ? 'ডেমো দেখুন →' : 'View Demo →'}</span>
              </button>

              {/* Secondary CTA */}
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
                <span>{isBn ? 'কীভাবে কাজ করে' : 'How It Works'}</span>
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
                <span>{isBn ? 'সহজ বাংলায় তথ্য' : 'Plain language explanations'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={16} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'অসংগতি চিহ্নিত করার সহায়তা' : 'Assistance in spotting record discrepancies'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                <CheckCircle2 size={16} style={{ color: '#1B5E20', flexShrink: 0 }} />
                <span>{isBn ? 'কী যাচাই হয়নি, তা স্পষ্টভাবে দেখানো' : 'Clearly displays unverified data fields'}</span>
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
              <span>{isBn ? 'ডেমো ডেটা। এটি আইনি সিদ্ধান্ত নয়।' : 'DEMO DATA, not a legal verdict.'}</span>
            </div>
          </div>

          {/* Column 2: 3D Land Parcel Illustration */}
          <div className="hero-parcel-column">
            <LandParcel3D lang={lang} onOpenPassport={onViewPassport} />
          </div>
        </div>
      </div>
    </section>
  );
}
