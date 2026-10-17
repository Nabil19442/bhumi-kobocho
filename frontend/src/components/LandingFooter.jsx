import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function LandingFooter({ lang = 'bn' }) {
  const isBn = lang === 'bn';

  return (
    <footer className="landing-footer" style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-body)',
      borderTop: '1.5px solid var(--line)',
      padding: '36px 0 24px'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        {/* Top Disclaimer Highlight Banner */}
        <div style={{
          background: 'var(--status-review-bg)',
          border: '1px solid var(--status-review-border)',
          borderRadius: 'var(--radius-std)',
          padding: '10px 16px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Info size={16} style={{ color: 'var(--status-review-text)', flexShrink: 0 }} />
          <p style={{
            margin: 0,
            fontSize: '0.82rem',
            color: 'var(--status-review-text)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.45
          }}>
            <strong>{isBn ? 'ডেমো ডেটা সতর্কতা:' : 'Demo Data Notice:'} </strong>
            {isBn
              ? 'এটি আইনি সিদ্ধান্ত নয়। সকল দলিল, নাম ও খতিয়ান নম্বর হ্যাকাথন প্রদর্শনের জন্য প্রস্তুতকৃত কৃত্রিম ডেটা।'
              : 'DEMO DATA — Not a legal verdict. All deeds, names, and khatian numbers are synthetic data for hackathon evaluation.'}
          </p>
        </div>

        {/* Footer Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '28px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--line)'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <ShieldCheck size={16} />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.20rem',
                fontWeight: 800,
                color: 'var(--text-main)'
              }}>
                {isBn ? 'ভূমি কবচ' : 'Bhumi Kobocho'}
              </span>
            </div>

            <p style={{
              fontSize: '0.84rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
              maxWidth: '320px',
              margin: '0 0 8px'
            }}>
              {isBn
                ? 'নাগরিক ভূমি রেকর্ড বুদ্ধিমত্তা ও ক্রিপ্টোগ্রাফিক সুরক্ষা প্ল্যাটফর্ম।'
                : 'Citizen land record intelligence and cryptographic integrity platform.'}
            </p>

            <div style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)'
            }}>
              Rules decide; AI explains.
            </div>
          </div>

          {/* Hackathon & Team Col */}
          <div>
            <span style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: '8px'
            }}>
              {isBn ? 'দল ও প্রতিযোগিতা' : 'TEAM & EVENT'}
            </span>
            <div style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              marginBottom: '2px'
            }}>
              TEAM: ZENOX
            </div>
            <div style={{
              fontSize: '0.84rem',
              color: 'var(--text-body)',
              marginBottom: '6px'
            }}>
              LandTech Innovation Hackathon 2026
            </div>
            <div style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)'
            }}>
              Organized for citizen-first digital governance.
            </div>
          </div>

          {/* Core Modules Quick Links */}
          <div>
            <span style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: '8px'
            }}>
              {isBn ? 'মূল মডিউলসমূহ' : 'CORE MODULES'}
            </span>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '0.84rem',
              color: 'var(--text-body)',
              lineHeight: 1.7
            }}>
              <li>{isBn ? '• দলিল স্ক্যানার ও ফিল্ড এক্সট্রাকশন' : '• Deed Scanner & OCR Review'}</li>
              <li>{isBn ? '• অসঙ্গতি নিরীক্ষা ও নিয়ম ইঞ্জিন' : '• Mismatch Detector & Rule Engine'}</li>
              <li>{isBn ? '• নাগরিক প্লট পাসপোর্ট' : '• Citizen Plot Passport'}</li>
              <li>{isBn ? '• কিউআর ও SHA-256 ফাইল সত্যতা' : '• QR & SHA-256 Bit Integrity'}</li>
              <li>{isBn ? '• ল্যান্ড গার্ডিয়ান সিমুলেটেড অ্যালার্ট' : '• Land Guardian Simulated Alert'}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div style={{
          paddingTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          <div>
            &copy; 2026 Bhumi Kobocho (ভূমি কবচ) &bull; Team ZENOX
          </div>

          <div>
            LandTech Innovation Hackathon 2026 &bull; Demo Specimen
          </div>
        </div>
      </div>
    </footer>
  );
}
