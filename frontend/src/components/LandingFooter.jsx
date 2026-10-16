import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function LandingFooter({ lang = 'bn' }) {
  const isBn = lang === 'bn';

  return (
    <footer className="landing-footer" style={{
      background: 'var(--deep)',
      color: '#EAF0E8',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '48px 0 32px'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        {/* Top Disclaimer Highlight Banner */}
        <div style={{
          background: 'rgba(253, 230, 138, 0.12)',
          border: '1px solid rgba(253, 230, 138, 0.3)',
          borderRadius: 'var(--radius-std)',
          padding: '12px 18px',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Info size={18} style={{ color: '#FDE68A', flexShrink: 0 }} />
          <p style={{
            margin: 0,
            fontSize: '0.86rem',
            color: '#FEF3C7',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.5
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
          gap: '32px',
          paddingBottom: '36px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.28rem',
                fontWeight: 800,
                color: '#FFFFFF'
              }}>
                {isBn ? 'ভূমি কবচ' : 'Bhumi Kobocho'}
              </span>
            </div>

            <p style={{
              fontSize: '0.86rem',
              color: '#BACEC7',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
              maxWidth: '320px',
              margin: '0 0 12px'
            }}>
              {isBn
                ? 'নাগরিক ভূমি রেকর্ড বুদ্ধিমত্তা ও ক্রিপ্টোগ্রাফিক সুরক্ষা প্ল্যাটফর্ম।'
                : 'Citizen land record intelligence and cryptographic integrity platform.'}
            </p>

            <div style={{
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: '#8BA59E'
            }}>
              Rules decide; AI explains.
            </div>
          </div>

          {/* Hackathon & Team Col */}
          <div>
            <span style={{
              fontSize: '0.76rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              color: '#8BA59E',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: '10px'
            }}>
              {isBn ? 'দল ও প্রতিযোগিতা' : 'TEAM & EVENT'}
            </span>
            <div style={{
              fontSize: '0.96rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: '#FFFFFF',
              marginBottom: '4px'
            }}>
              TEAM: ZENOX
            </div>
            <div style={{
              fontSize: '0.88rem',
              color: '#BACEC7',
              marginBottom: '8px'
            }}>
              LandTech Innovation Hackathon 2026
            </div>
            <div style={{
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: '#8BA59E'
            }}>
              Organized for citizen-first digital governance.
            </div>
          </div>

          {/* Core Modules Quick Links */}
          <div>
            <span style={{
              fontSize: '0.76rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              color: '#8BA59E',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: '10px'
            }}>
              {isBn ? 'মূল মডিউলসমূহ' : 'CORE MODULES'}
            </span>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '0.86rem',
              color: '#BACEC7',
              lineHeight: 1.8
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
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#8BA59E',
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
