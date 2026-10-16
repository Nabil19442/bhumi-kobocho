import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function FinalCtaSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';

  return (
    <section className="landing-section" style={{
      padding: '80px 0',
      background: 'var(--deep)',
      color: '#FFFFFF',
      borderBottom: '2px solid #10272A',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle cadastral grid background overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.04,
        backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      <div className="landing-container" style={{
        maxWidth: '840px',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        textAlign: 'center',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: 'var(--radius-std)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#E0EAE5',
          fontSize: '0.82rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} />
          <span>{isBn ? 'সহজ নাগরিক ভূমি সুরক্ষা' : 'CITIZEN LAND PROTECTION'}</span>
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 3.8vw, 2.9rem)',
          fontWeight: 800,
          color: '#FFFFFF',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.25,
          marginBottom: '16px'
        }}>
          {isBn ? 'আপনার জমির কাগজগুলো বুঝে দেখতে প্রস্তুত?' : 'Ready to understand your land documents?'}
        </h2>

        <p style={{
          fontSize: '1.08rem',
          color: '#BACEC7',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          maxWidth: '620px',
          margin: '0 auto 36px'
        }}>
          {isBn
            ? 'সাধারণ নাগরিকের ভাষায় তৈরি ডিজিটাল টুলে আপনার দলিলের তথ্য মুহূর্তেই সাজিয়ে দেখুন, অসংগতি চিহ্নিত করুন এবং প্লট পাসপোর্ট যাচাই করুন।'
            : 'Organize deed details, spot record inconsistencies, and explore your Plot Passport in plain language.'}
        </p>

        {/* Big Clickable Action Button */}
        <div>
          <button
            type="button"
            id="final-cta-start-btn"
            onClick={onStartScanning}
            className="btn-primary"
            style={{
              height: '52px',
              padding: '0 32px',
              fontSize: '1.08rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              border: '2px solid #FFFFFF',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              minHeight: '44px'
            }}
          >
            <span>{isBn ? 'ডেমো দেখুন →' : 'View Demo →'}</span>
          </button>
        </div>

        {/* Small reassurance tag below */}
        <div style={{ marginTop: '22px', fontSize: '0.8rem', color: '#8BA59E', fontFamily: 'var(--font-mono)' }}>
          {isBn ? 'কোনো রেজিস্ট্রেশনের প্রয়োজন নেই • কৃত্রিম ডেমো ডেটা' : 'No sign-up required • Synthetic demo specimen data'}
        </div>
      </div>
    </section>
  );
}
