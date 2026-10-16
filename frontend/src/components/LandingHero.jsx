import React from 'react';
import { ArrowRight, FileCheck, CheckCircle2, XCircle, AlertTriangle, HelpCircle, Shield, Sparkles } from 'lucide-react';
import CadastralMouzaMap from './CadastralMouzaMap';

export default function LandingHero({ lang = 'bn', onStartScanning, onViewPassport }) {
  const isBn = lang === 'bn';

  return (
    <section className="landing-hero-section" style={{
      padding: '48px 0 60px',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid #CAD7CF'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        {/* Two-Column Grid */}
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* Column 1: Value Proposition & CTAs */}
          <div className="hero-text-block">
            {/* Hackathon & Team Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-std)',
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              color: 'var(--primary-accent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: '18px',
              letterSpacing: '0.3px'
            }}>
              <span>LANDTECH INNOVATION HACKATHON 2026</span>
              <span>•</span>
              <span>TEAM ZENOX</span>
            </div>

            {/* Exact Bangla Hero Heading */}
            <h1 className="hero-heading" style={{
              fontSize: 'clamp(2.1rem, 4.2vw, 3.2rem)',
              lineHeight: 1.18,
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '16px',
              letterSpacing: '-0.5px'
            }}>
              {isBn ? (
                <>
                  কেনার আগে জমির কাগজগুলো{' '}
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
                  Verify land records{' '}
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

            {/* Subheading / Value Explanation */}
            <p className="hero-subheading" style={{
              fontSize: 'clamp(1.02rem, 1.3vw, 1.15rem)',
              lineHeight: 1.6,
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              marginBottom: '28px',
              maxWidth: '540px'
            }}>
              {isBn
                ? 'নিয়ম সিদ্ধান্ত নেয়, এআই শুধু সহজ ভাষায় বুঝিয়ে দেয়। জমি কেনার আগে দলিল ও রেকর্ডের অমিল তাৎক্ষণিক শনাক্ত করুন, একক নাগরিক প্লট পাসপোর্ট তৈরি করুন এবং পরিবর্তনের আগাম সতর্কবার্তা পান।'
                : 'Rules decide; AI only explains. Spot inconsistencies between deeds and official records before purchase, generate a citizen Plot Passport, and receive simulated guardian alerts.'}
            </p>

            {/* Action Buttons */}
            <div className="hero-cta-group" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '32px'
            }}>
              <button
                type="button"
                onClick={onStartScanning}
                className="btn-primary"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  boxShadow: 'var(--shadow-hard-sm)'
                }}
              >
                <span>{isBn ? 'কাগজ যাচাই শুরু করুন' : 'Launch Deed Scanner'}</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={onViewPassport}
                className="btn-secondary"
                style={{
                  height: '48px',
                  padding: '0 20px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  border: '1.5px solid var(--text-main)',
                  background: 'var(--bg-paper)'
                }}
              >
                <FileCheck size={18} />
                <span>{isBn ? 'নমুনা প্লট পাসপোর্ট দেখুন' : 'View Sample Passport'}</span>
              </button>
            </div>

            {/* 4 Strict Rule Statuses Summary Pills */}
            <div style={{
              paddingTop: '20px',
              borderTop: '1px solid #CAD7CF'
            }}>
              <span style={{
                display: 'block',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {isBn ? '★ ৪-ধাপের সুনির্দিষ্ট নিয়ম যাচাই (৪ STRICT STATUS FLAGS):' : '★ 4 STRICT RULE STATUSES:'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span className="status-pill matched" style={{
                  background: 'var(--status-matched-bg)',
                  color: 'var(--status-matched-text)',
                  border: '1px solid var(--status-matched-border)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-std)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={13} />
                  <span>{isBn ? 'মিলেছে (Matched)' : 'Matched'}</span>
                </span>

                <span className="status-pill mismatch" style={{
                  background: 'var(--status-mismatch-bg)',
                  color: 'var(--status-mismatch-text)',
                  border: '1px solid var(--status-mismatch-border)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-std)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <XCircle size={13} />
                  <span>{isBn ? 'অমিল (Mismatch)' : 'Mismatch'}</span>
                </span>

                <span className="status-pill needs-review" style={{
                  background: 'var(--status-review-bg)',
                  color: 'var(--status-review-text)',
                  border: '1px solid var(--status-review-border)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-std)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertTriangle size={13} />
                  <span>{isBn ? 'পর্যালোচনা প্রয়োজন (Needs review)' : 'Needs review'}</span>
                </span>

                <span className="status-pill not-checked" style={{
                  background: 'var(--status-notchecked-bg)',
                  color: 'var(--status-notchecked-text)',
                  border: 'var(--border-dashed)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-std)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <HelpCircle size={13} />
                  <span>{isBn ? 'যাচাই হয়নি (Not checked)' : 'Not checked'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Cadastral Mouza Map Illustration & Overlapping Card */}
          <div className="hero-map-column">
            <CadastralMouzaMap lang={lang} onOpenPassport={onViewPassport} />
          </div>
        </div>
      </div>
    </section>
  );
}
