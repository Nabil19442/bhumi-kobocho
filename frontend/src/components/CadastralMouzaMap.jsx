import React from 'react';
import { Shield, AlertTriangle, Layers, MapPin, QrCode } from 'lucide-react';

export default function CadastralMouzaMap({ lang = 'bn', onOpenPassport }) {
  const isBn = lang === 'bn';

  return (
    <div className="cadastral-hero-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
      {/* Cadastral Map Frame */}
      <div 
        className="cadastral-map-card"
        style={{
          background: 'var(--bg-paper)',
          border: '2px solid var(--text-main)',
          borderRadius: 'var(--radius-std)',
          boxShadow: 'var(--shadow-hard)',
          padding: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Map Header / Survey Sheet Meta */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--text-main)',
          paddingBottom: '8px',
          marginBottom: '12px',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}>
          <div>
            <strong style={{ color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              {isBn ? 'মৌজা নকশা: মিরপুর • জে.এল নং ২১' : 'MOUZA MAP: MIRPUR • J.L NO 21'}
            </strong>
            <span style={{ marginLeft: '8px', color: 'var(--primary-accent)' }}>
              {isBn ? 'সিট নং ০১ (নমুনা)' : 'SHEET NO 01 (SPECIMEN)'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: 'var(--accent-tint)', 
              color: 'var(--primary-accent)', 
              padding: '2px 6px', 
              borderRadius: '3px',
              fontWeight: 600
            }}>
              {isBn ? 'স্কেল: ১৬"=১ মাইল' : 'SCALE: 16"=1 MILE'}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>⬆ {isBn ? 'উ' : 'N'}</span>
          </div>
        </div>

        {/* 12-Parcel Cadastral Map SVG */}
        <svg
          viewBox="0 0 540 360"
          style={{ width: '100%', height: 'auto', display: 'block', background: '#F4F7F2' }}
          role="img"
          aria-label={isBn ? '১২টি দাগসহ মৌজা নকশা' : 'Cadastral Mouza map with 12 parcels'}
        >
          <defs>
            {/* Subtle survey grid */}
            <pattern id="survey-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#DDE5E0" strokeWidth="0.8" />
            </pattern>
            {/* Pond water ripple */}
            <pattern id="water-wave" width="20" height="10" patternUnits="userSpaceOnUse">
              <path d="M 0 5 Q 5 0, 10 5 T 20 5" fill="none" stroke="#A8C8E6" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="540" height="360" fill="url(#survey-grid)" />

          {/* Survey Grid Coordinate Marks */}
          <g stroke="#9AAFAA" strokeWidth="0.6" strokeDasharray="3,3">
            <line x1="0" y1="180" x2="540" y2="180" />
            <line x1="270" y1="0" x2="270" y2="360" />
          </g>

          {/* Parcel Boundaries (12 Parcels Total) */}

          {/* Parcel 1: 420 */}
          <polygon points="20,20 140,20 130,100 20,90" fill="#EAF0E8" stroke="#10272A" strokeWidth="1.5" />
          <text x="65" y="60" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২০</text>
          <text x="55" y="75" fontFamily="var(--font-mono)" fontSize="9" fill="#62797C">২৫ শতক</text>

          {/* Parcel 2: 421 */}
          <polygon points="140,20 260,20 250,95 130,100" fill="#EEF3EC" stroke="#10272A" strokeWidth="1.5" />
          <text x="185" y="60" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২১</text>
          <text x="175" y="75" fontFamily="var(--font-mono)" fontSize="9" fill="#62797C">১৮ শতক</text>

          {/* Parcel 3: 422 (With Pond / পুকুর) */}
          <polygon points="260,20 400,20 390,110 250,95" fill="#E8F1EC" stroke="#10272A" strokeWidth="1.5" />
          <text x="315" y="55" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২২</text>
          {/* Small Pond inside 422 */}
          <ellipse cx="340" cy="75" rx="35" ry="18" fill="#D4E6F6" stroke="#2742A0" strokeWidth="1.2" />
          <ellipse cx="340" cy="75" rx="35" ry="18" fill="url(#water-wave)" opacity="0.6" />
          <text x="325" y="79" fontFamily="var(--font-heading)" fontSize="10" fontWeight="600" fill="#1B3284">পুকুর</text>

          {/* Parcel 4: 423 */}
          <polygon points="400,20 520,20 520,105 390,110" fill="#EBF2EA" stroke="#10272A" strokeWidth="1.5" />
          <text x="445" y="60" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২৩</text>
          <text x="435" y="75" fontFamily="var(--font-mono)" fontSize="9" fill="#62797C">২২ শতক</text>

          {/* Parcel 5: 424 */}
          <polygon points="20,90 130,100 120,190 20,175" fill="#F0F5EE" stroke="#10272A" strokeWidth="1.5" />
          <text x="60" y="145" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২৪</text>
          <text x="50" y="160" fontFamily="var(--font-mono)" fontSize="9" fill="#62797C">৩০ শতক</text>

          {/* Parcel 6: 425 */}
          <polygon points="130,100 240,95 230,195 120,190" fill="#E7EFE6" stroke="#10272A" strokeWidth="1.5" />
          <text x="170" y="145" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২৫</text>
          <text x="160" y="160" fontFamily="var(--font-mono)" fontSize="9" fill="#62797C">১৯ শতক</text>

          {/* Parcel 7: 426 */}
          <polygon points="240,95 380,105 370,195 230,195" fill="#EEF4EC" stroke="#10272A" strokeWidth="1.5" />
          <text x="290" y="145" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২৬</text>
          <text x="280" y="160" fontFamily="var(--font-mono)" fontSize="9" fill="#62797C">২৮ শতক</text>

          {/* ========================================================
              PARCEL 8: ৪২৭ (HIGHLIGHTED TARGET PARCEL WITH ACCENT)
              ======================================================== */}
          <polygon 
            points="380,105 520,105 520,205 370,195" 
            fill="var(--accent-tint)" 
            stroke="var(--primary-accent)" 
            strokeWidth="2.8" 
          />
          {/* Accent Cross-hatch indicator */}
          <line x1="395" y1="115" x2="505" y2="195" stroke="var(--primary-accent)" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="505" y1="115" x2="395" y2="195" stroke="var(--primary-accent)" strokeWidth="0.8" strokeOpacity="0.35" />
          
          {/* Target Parcel 427 Badge */}
          <rect x="410" y="125" width="85" height="30" rx="4" fill="#FFFFFF" stroke="var(--primary-accent)" strokeWidth="1.5" />
          <text x="424" y="145" fontFamily="var(--font-heading)" fontSize="14" fontWeight="800" fill="var(--primary-accent)">
            দাগ ৪২৭ ★
          </text>
          <rect x="420" y="162" width="65" height="18" rx="3" fill="var(--status-review-bg)" />
          <text x="426" y="175" fontFamily="var(--font-mono)" fontSize="9.5" fontWeight="600" fill="var(--status-review-text)">
            ৩১/৩৩ শতক
          </text>

          {/* Parcel 9: 428 */}
          <polygon points="20,175 120,190 110,270 20,255" fill="#EBF3E8" stroke="#10272A" strokeWidth="1.5" />
          <text x="55" y="230" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২৮</text>

          {/* Parcel 10: 429 */}
          <polygon points="120,190 230,195 220,285 110,270" fill="#EFF5EC" stroke="#10272A" strokeWidth="1.5" />
          <text x="165" y="240" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪২৯</text>

          {/* Parcel 11: 430 */}
          <polygon points="230,195 370,195 355,295 220,285" fill="#E8F1E7" stroke="#10272A" strokeWidth="1.5" />
          <text x="280" y="245" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪৩০</text>

          {/* Parcel 12: 431 */}
          <polygon points="370,195 520,205 520,305 355,295" fill="#ECF4EB" stroke="#10272A" strokeWidth="1.5" />
          <text x="430" y="255" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700" fill="#2D4649">৪৩১</text>

          {/* Dashed Canal (খাল) traversing across parcels 420 -> 425 -> 429 */}
          <path
            d="M 10 30 Q 110 80, 135 150 T 170 280 L 160 350"
            fill="none"
            stroke="#2742A0"
            strokeWidth="8"
            strokeOpacity="0.25"
          />
          <path
            d="M 10 30 Q 110 80, 135 150 T 170 280 L 160 350"
            fill="none"
            stroke="#2742A0"
            strokeWidth="2.2"
            strokeDasharray="6,4"
          />
          <path
            d="M 18 33 Q 118 83, 143 153 T 178 283 L 168 353"
            fill="none"
            stroke="#2742A0"
            strokeWidth="2.2"
            strokeDasharray="6,4"
          />
          <text x="145" y="325" fontFamily="var(--font-heading)" fontSize="10" fontWeight="700" fill="#1B3284" transform="rotate(75, 145, 325)">
            --- সরকারি সিকস্তি খাল ---
          </text>

          {/* Survey Scale Marker at bottom */}
          <g transform="translate(30, 335)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#10272A" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#10272A" strokeWidth="2" />
            <line x1="50" y1="-3" x2="50" y2="3" stroke="#10272A" strokeWidth="1.5" />
            <line x1="100" y1="-4" x2="100" y2="4" stroke="#10272A" strokeWidth="2" />
            <text x="35" y="-6" fontFamily="var(--font-mono)" fontSize="9" fill="#10272A">১০০ গজ</text>
          </g>
        </svg>

        {/* Overlapping Plot Passport Specimen Card (Hard Shadow 6px 6px 0 #10272A) */}
        <div 
          className="hero-passport-card"
          style={{
            marginTop: '-75px',
            position: 'relative',
            zIndex: 10,
            background: 'var(--bg-paper)',
            border: '2px solid var(--text-main)',
            borderRadius: 'var(--radius-std)',
            boxShadow: 'var(--shadow-hard)',
            padding: '16px',
            marginLeft: 'auto',
            width: '92%'
          }}
        >
          {/* Card Top Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '4px', 
                background: 'var(--dark-band)', 
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isBn ? 'নাগরিক প্লট পাসপোর্ট প্রিভিউ' : 'CITIZEN PLOT PASSPORT PREVIEW'}
                </span>
                <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'দাগ ৪২৭ • খতিয়ান ১২৮' : 'Plot 427 • Khatian 128'}
                </strong>
              </div>
            </div>

            {/* Status Pill: Needs review */}
            <span 
              className="status-pill needs-review"
              style={{
                background: 'var(--status-review-bg)',
                color: 'var(--status-review-text)',
                border: '1px solid var(--status-review-border)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-std)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <AlertTriangle size={13} />
              <span>{isBn ? 'পর্যালোচনা প্রয়োজন' : 'Needs review'}</span>
            </span>
          </div>

          {/* Quick Comparison Data Row */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid #D8E2DC',
            borderRadius: '4px',
            padding: '10px 12px',
            fontSize: '0.82rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                {isBn ? 'দলিলের দাগ ও নাম' : 'Deed Plot & Owner'}
              </span>
              <strong style={{ color: 'var(--text-main)' }}>
                {isBn ? '৪২৭ • মোছাঃ রহিমা' : '427 • Mst. Rahima'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                {isBn ? 'দলিলের আয়তন' : 'Deed Area'}
              </span>
              <strong style={{ color: 'var(--status-mismatch-text)' }}>
                {isBn ? '৩৩ শতাংশ' : '33 Decimal'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                {isBn ? 'রেকর্ডের আয়তন' : 'Registry Area'}
              </span>
              <strong style={{ color: 'var(--status-matched-text)' }}>
                {isBn ? '৩১ শতাংশ' : '31 Decimal'}
              </strong>
            </div>
          </div>

          {/* Micro Reason Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-body)',
            gap: '8px'
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-review-text)' }}>
              {isBn ? '⚠ অমিল: +২.০ শতক ক্ষেত্রফল পার্থক্য (সহনশীলতার বাইরে)' : '⚠ Mismatch: +2.0 dec area difference'}
            </span>
            {onOpenPassport && (
              <button
                type="button"
                onClick={onOpenPassport}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-accent)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isBn ? 'সম্পূর্ণ পাসপোর্ট ➔' : 'Full Passport ➔'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
