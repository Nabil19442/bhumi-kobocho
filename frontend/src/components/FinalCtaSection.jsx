import React from 'react';
import { ScanText, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * FinalCtaSection
 * 
 * Closing section with exact requested text:
 * Heading: "জমি কেনার আগে যাচাই করুন"
 * Description: "দলিলের তথ্য যাচাই করুন এবং উপলব্ধ রেকর্ডের সঙ্গে সম্ভাব্য অসামঞ্জস্য শনাক্ত করুন।"
 * Primary button: "দলিল যাচাই শুরু করুন" (connected to deed scanner page)
 */
export default function FinalCtaSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';

  return (
    <section 
      id="final-cta-section"
      className="landing-section" 
      style={{
        padding: 'clamp(32px, 4vw, 48px) 0',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        className="landing-container" 
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop)',
          boxSizing: 'border-box'
        }}
      >
        {/* Compact Cohesive Card on Pale Sage Background */}
        <div 
          style={{
            background: 'var(--white)',
            border: '1.5px solid var(--line)',
            borderRadius: '14px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(16, 39, 42, 0.06)',
            boxSizing: 'border-box'
          }}
        >
          {/* Top Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-std)',
            background: 'var(--accent-tint)',
            border: '1px solid #C4D6F5',
            color: 'var(--primary-accent)',
            fontSize: '0.76rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: '12px',
            letterSpacing: '0.4px'
          }}>
            <ShieldCheck size={14} color="var(--primary-accent)" />
            <span>{isBn ? 'নাগরিক ভূমি সুরক্ষা' : 'CITIZEN LAND PROTECTION'}</span>
          </div>

          {/* Heading Requested by User */}
          <h2 style={{
            fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '10px',
            letterSpacing: '-0.3px'
          }}>
            {isBn ? 'জমি কেনার আগে যাচাই করুন' : 'Verify Before Buying Land'}
          </h2>

          {/* Description Requested by User */}
          <p style={{
            fontSize: '0.96rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.55,
            maxWidth: '560px',
            margin: '0 auto 22px'
          }}>
            {isBn
              ? 'দলিলের তথ্য যাচাই করুন এবং উপলব্ধ রেকর্ডের সঙ্গে সম্ভাব্য অসামঞ্জস্য শনাক্ত করুন।'
              : 'Verify deed details and identify potential inconsistencies against available land records.'}
          </p>

          {/* Primary Action Button */}
          <div style={{ marginBottom: '18px' }}>
            <button
              type="button"
              id="final-cta-start-btn"
              onClick={onStartScanning}
              className="btn-primary"
              style={{
                height: '46px',
                padding: '0 28px',
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
              <span>{isBn ? 'দলিল যাচাই শুরু করুন' : 'Start Deed Verification'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} style={{ color: '#1B5E20' }} />
              {isBn ? 'তাৎক্ষণিক এআই বিশ্লেষণ' : 'Instant AI Analysis'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} style={{ color: '#1B5E20' }} />
              {isBn ? 'স্বচ্ছ প্রমাণ টাইমলাইন' : 'Evidence Timeline'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} style={{ color: '#1B5E20' }} />
              {isBn ? 'নাগরিক গোপনীয়তা সুরক্ষিত' : 'Citizen Privacy Protected'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
