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
        padding: '80px 0',
        background: 'var(--deep)',
        color: '#FFFFFF',
        borderBottom: '2px solid #10272A',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Cadastral Grid Overlay Pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} 
      />

      <div 
        className="landing-container" 
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop)',
          textAlign: 'center',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 14px',
          borderRadius: 'var(--radius-std)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          color: '#E0EAE5',
          fontSize: '0.82rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          marginBottom: '20px',
          letterSpacing: '0.4px'
        }}>
          <ShieldCheck size={14} color="#85E0A3" />
          <span>{isBn ? 'নাগরিক ভূমি সুরক্ষা' : 'CITIZEN LAND PROTECTION'}</span>
        </div>

        {/* Heading Requested by User */}
        <h2 style={{
          fontSize: 'clamp(2.1rem, 4.2vw, 3.2rem)',
          fontWeight: 900,
          color: '#FFFFFF',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.2,
          marginBottom: '16px',
          letterSpacing: '-0.4px'
        }}>
          {isBn ? 'জমি কেনার আগে যাচাই করুন' : 'Verify Before Buying Land'}
        </h2>

        {/* Description Requested by User */}
        <p style={{
          fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
          color: '#CBD8D2',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.65,
          maxWidth: '620px',
          margin: '0 auto 36px'
        }}>
          {isBn
            ? 'দলিলের তথ্য যাচাই করুন এবং উপলব্ধ রেকর্ডের সঙ্গে সম্ভাব্য অসামঞ্জস্য শনাক্ত করুন।'
            : 'Verify deed details and identify potential inconsistencies against available land records.'}
        </p>

        {/* Primary Action Button */}
        <div style={{ marginBottom: '28px' }}>
          <button
            type="button"
            id="final-cta-start-btn"
            onClick={onStartScanning}
            className="btn-primary"
            style={{
              height: '54px',
              padding: '0 34px',
              fontSize: '1.10rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              border: '2px solid #FFFFFF',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#F1F5F0';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.35)';
            }}
          >
            <ScanText size={20} color="var(--primary-accent)" />
            <span>{isBn ? 'দলিল যাচাই শুরু করুন' : 'Start Deed Verification'}</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '0.86rem',
          color: '#8A9E96',
          fontFamily: 'var(--font-body)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} color="#85E0A3" />
            {isBn ? 'তাৎক্ষণিক এআই বিশ্লেষণ' : 'Instant AI Analysis'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} color="#85E0A3" />
            {isBn ? 'স্বচ্ছ প্রমাণ টাইমলাইন' : 'Evidence Timeline'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} color="#85E0A3" />
            {isBn ? 'নাগরিক গোপনীয়তা সুরক্ষিত' : 'Citizen Privacy Protected'}
          </span>
        </div>
      </div>
    </section>
  );
}
