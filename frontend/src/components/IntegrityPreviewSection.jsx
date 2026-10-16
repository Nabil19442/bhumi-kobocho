import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  ShieldCheck, 
  FileCheck2, 
  FileX2, 
  Hash, 
  ExternalLink, 
  Lock,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { fetchRecordQr } from '../api';

export default function IntegrityPreviewSection({ lang = 'bn', onViewIntegrity }) {
  const isBn = lang === 'bn';
  const [qrBase64, setQrBase64] = useState(null);

  useEffect(() => {
    // Attempt to load dynamic QR from backend if running, with graceful fallback
    fetchRecordQr('rec-demo-001')
      .then(data => {
        if (data && data.qr_code_base64) {
          setQrBase64(data.qr_code_base64);
        }
      })
      .catch(() => {
        // Backend offline or unreachable: fallback handled gracefully
      });
  }, []);

  return (
    <section id="integrity-preview" className="landing-section" style={{
      padding: '72px 0',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid #CAD7CF'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-std)',
            background: 'var(--accent-tint)',
            border: '1px solid #C4D6F5',
            color: 'var(--primary-accent)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: '12px'
          }}>
            <Lock size={14} />
            <span>{isBn ? 'ক্রিপ্টোগ্রাফিক সত্যতা' : 'CRYPTOGRAPHIC INTEGRITY'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'কিউআর কোড ও ফাইল সত্যতা যাচাই' : 'QR Code & File Integrity Verification'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশের মাধ্যমে দলিলের ফাইলের একটি অক্ষর বা সংখ্যা পরিবর্তিত হলেও তা তাৎক্ষণিক শনাক্ত করা যায়।'
              : 'Cryptographic SHA-256 fingerprinting instantly detects whether even a single digit or byte of a digital deed file was altered.'}
          </p>
        </div>

        {/* 2-Column Responsive Grid: QR & Hash Card + Unchanged vs Changed Comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
          marginBottom: '28px'
        }}>
          {/* Column 1: QR & Hash Fingerprint */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1px solid #CAD7CF',
            padding: '24px',
            boxShadow: 'var(--shadow-hard-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <QrCode size={20} color="var(--primary-accent)" />
                <h3 style={{
                  fontSize: '1.14rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-main)',
                  margin: 0
                }}>
                  {isBn ? 'দলিলের ডিজিটাল কিউআর কোড' : 'Digital Deed QR Code'}
                </h3>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                marginBottom: '18px'
              }}>
                {/* QR Code Graphic */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: '#F8FAF8',
                  border: '1.5px solid #10272A',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  flexShrink: 0
                }}>
                  {qrBase64 ? (
                    <img 
                      src={qrBase64} 
                      alt="Demo Plot QR" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    /* Elegant SVG Fallback QR Preview */
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                      <rect width="100" height="100" fill="#FFFFFF" />
                      {/* Top Left Marker */}
                      <rect x="10" y="10" width="24" height="24" fill="#10272A" />
                      <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
                      <rect x="18" y="18" width="8" height="8" fill="#10272A" />
                      {/* Top Right Marker */}
                      <rect x="66" y="10" width="24" height="24" fill="#10272A" />
                      <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" />
                      <rect x="74" y="18" width="8" height="8" fill="#10272A" />
                      {/* Bottom Left Marker */}
                      <rect x="10" y="66" width="24" height="24" fill="#10272A" />
                      <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" />
                      <rect x="18" y="74" width="8" height="8" fill="#10272A" />
                      {/* Data Pattern */}
                      <rect x="42" y="14" width="6" height="6" fill="#2742A0" />
                      <rect x="52" y="14" width="6" height="6" fill="#10272A" />
                      <rect x="42" y="24" width="6" height="6" fill="#10272A" />
                      <rect x="52" y="30" width="6" height="12" fill="#2742A0" />
                      <rect x="42" y="44" width="16" height="12" fill="#10272A" />
                      <rect x="14" y="44" width="12" height="6" fill="#10272A" />
                      <rect x="70" y="44" width="20" height="8" fill="#2742A0" />
                      <rect x="66" y="66" width="12" height="12" fill="#10272A" />
                      <rect x="82" y="78" width="8" height="8" fill="#2742A0" />
                    </svg>
                  )}
                </div>

                {/* Plot Parameters */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '2px' }}>
                    {isBn ? 'এনকোডেড রেফারেন্স:' : 'Encoded Reference:'}
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                    rec-demo-001
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-body)', marginTop: '4px' }}>
                    {isBn ? 'দাগ ১০৫৮ • খতিয়ান ৪১২ • ১৫.৫০ শতক' : 'Dag 1058 • Khatian 412 • 15.5 Dec'}
                  </div>
                </div>
              </div>

              {/* SHA-256 Hash Box */}
              <div style={{
                background: '#F1F5F0',
                border: '1px solid #CBD8D2',
                borderRadius: 'var(--radius-std)',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Hash size={14} color="var(--primary-accent)" />
                  <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    {isBn ? 'রেফারেন্স SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ' : 'REFERENCE SHA-256 HASH'}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  wordBreak: 'break-all'
                }}>
                  07913647653f60...7d5cb1b928e47
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '14px' }}>
              {isBn ? 'স্ক্যান করলে সরাসরি প্লটের যাচাইকৃত তথ্য প্রদর্শিত হয়।' : 'Scanning opens verified baseline record.'}
            </div>
          </div>

          {/* Column 2: Unchanged vs Changed File Demonstration */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1px solid #CAD7CF',
            padding: '24px',
            boxShadow: 'var(--shadow-hard-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ShieldCheck size={20} color="#14633A" />
                <h3 style={{
                  fontSize: '1.14rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-main)',
                  margin: 0
                }}>
                  {isBn ? 'ফাইলের অবিকৃত অবস্থা পরীক্ষা' : 'File Integrity Comparison'}
                </h3>
              </div>

              {/* Card A: Authentic Unchanged File */}
              <div style={{
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                borderRadius: 'var(--radius-std)',
                padding: '12px 16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <CheckCircle2 size={20} style={{ color: 'var(--status-matched-text)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--status-matched-text)', fontFamily: 'var(--font-heading)', display: 'block' }}>
                    {isBn ? 'উদাহরণ ০১: মূল অবিকৃত দলিল (Unchanged)' : 'Example 1: Authentic Unchanged Deed'}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#1A4D2E', lineHeight: 1.45, display: 'block', marginTop: '2px' }}>
                    {isBn
                      ? 'ফাইলের প্রতিটি বাইট মূল রেকর্ডের সাথে অবিকল মিলেছে। হ্যাশ স্ট্যাটাস: অক্ষত ও অবিকৃত।'
                      : 'File bytes match the recorded hash exactly. Status: Bit-level intact.'}
                  </span>
                </div>
              </div>

              {/* Card B: Tampered / Changed File */}
              <div style={{
                background: 'var(--status-mismatch-bg)',
                border: '1.5px solid var(--status-mismatch-border)',
                borderRadius: 'var(--radius-std)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <XCircle size={20} style={{ color: 'var(--status-mismatch-text)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--status-mismatch-text)', fontFamily: 'var(--font-heading)', display: 'block' }}>
                    {isBn ? 'উদাহরণ ০২: ফাইল ভেতরের তথ্য পরিবর্তিত (Changed)' : 'Example 2: File Content Changed'}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#782613', lineHeight: 1.45, display: 'block', marginTop: '2px' }}>
                    {isBn
                      ? 'দলিলের কোনো সংখ্যা বা নাম এডিট করা হলে তাৎক্ষণিক হ্যাশ অমিল ধরা পড়ে।'
                      : 'If numbers or names are modified in the file, SHA-256 mismatch triggers immediately.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Crucial Integrity Note */}
            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px dashed #CBD8D2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <Info size={16} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>
                {isBn
                  ? 'গুরুত্বপূর্ণ: ক্রিপ্টোগ্রাফিক হ্যাশ ফাইলের ভেতরের তথ্য অপরিবর্তিত থাকার প্রমাণ দেয়, কিন্তু এটি আইনি মালিকানার দলিল নয়।'
                  : 'Important: Cryptographic hashing verifies bit integrity, not statutory ownership.'}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button to Integrity Tool */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            id="integrity-preview-launch-btn"
            onClick={onViewIntegrity}
            className="btn-primary"
            style={{
              height: '46px',
              padding: '0 24px',
              fontSize: '0.96rem',
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
            <span>{isBn ? 'কিউআর ও সত্যতা যাচাই টুল দেখুন →' : 'View QR & Integrity Tool →'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
