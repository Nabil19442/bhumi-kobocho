import React, { useState } from 'react';
import { Shield, AlertTriangle, ArrowRight, MapPin, CheckCircle2, Layers } from 'lucide-react';

export default function LandParcel3D({ lang = 'bn', onOpenPassport }) {
  const isBn = lang === 'bn';
  const [activePlot, setActivePlot] = useState('427');

  return (
    <div className="parcel-3d-scene" aria-label={isBn ? 'ত্রিমাত্রিক জমির প্লটের নকশা' : '3D Land Parcel Illustration'}>
      {/* 3D Floating Isometric Canvas */}
      <div className="parcel-3d-wrapper">
        <svg
          viewBox="0 0 600 460"
          className="parcel-3d-svg"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <defs>
            {/* Gradients for soil strata (Left face - illuminated) */}
            <linearGradient id="topsoil-left" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#435E44" />
              <stop offset="30%" stopColor="#5D4734" />
              <stop offset="100%" stopColor="#75563D" />
            </linearGradient>

            <linearGradient id="subsoil-left" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7D5C42" />
              <stop offset="60%" stopColor="#9C704E" />
              <stop offset="100%" stopColor="#6E4D34" />
            </linearGradient>

            <linearGradient id="deepsoil-left" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5C3F2B" />
              <stop offset="100%" stopColor="#3C2619" />
            </linearGradient>

            {/* Gradients for soil strata (Right face - shaded 3D depth) */}
            <linearGradient id="topsoil-right" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#364B37" />
              <stop offset="30%" stopColor="#493829" />
              <stop offset="100%" stopColor="#5C432F" />
            </linearGradient>

            <linearGradient id="subsoil-right" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#634833" />
              <stop offset="60%" stopColor="#79563C" />
              <stop offset="100%" stopColor="#543A26" />
            </linearGradient>

            <linearGradient id="deepsoil-right" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#483121" />
              <stop offset="100%" stopColor="#2A1B11" />
            </linearGradient>

            {/* Lush grass gradient */}
            <linearGradient id="lush-grass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2EFE0" />
              <stop offset="50%" stopColor="#D5E8D3" />
              <stop offset="100%" stopColor="#C6DFC4" />
            </linearGradient>

            {/* Highlighted Plot 427 Gradient */}
            <linearGradient id="plot-highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E7EEFB" />
              <stop offset="100%" stopColor="#D4E3FA" />
            </linearGradient>

            {/* Pond Water Gradient */}
            <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4DEF6" />
              <stop offset="100%" stopColor="#A2CAEF" />
            </linearGradient>

            {/* 3D Drop Shadow below the whole block */}
            <filter id="block-shadow" x="-15%" y="-15%" width="130%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0D2B2E" floodOpacity="0.22" />
            </filter>

            {/* Pulse Glow for Selected Pin */}
            <filter id="beacon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
          </defs>

          {/* 3D Ground Elevation Cast Shadow */}
          <ellipse cx="300" cy="385" rx="245" ry="58" fill="#CBD8D2" opacity="0.65" />

          {/* ========================================================
              3D SOIL CROSS-SECTION (UNDERGROUND STRATA)
              Isometric Block Depth: 85px
              Top Surface Vertices:
                Apex: (300, 60)
                Right: (530, 175)
                Bottom Apex: (300, 290)
                Left: (70, 175)
              Bottom Base Vertices:
                Apex Left Base: (70, 260)
                Bottom Base: (300, 375)
                Apex Right Base: (530, 260)
              ======================================================== */}

          <g filter="url(#block-shadow)">
            {/* 1. LEFT SOIL CROSS-SECTION (Face 1: Left to Center) */}
            {/* Deep Subsoil / Bedrock Layer */}
            <polygon
              points="70,230 300,345 300,375 70,260"
              fill="url(#deepsoil-left)"
            />
            {/* Geological silt striations */}
            <line x1="110" y1="248" x2="260" y2="350" stroke="#4D3322" strokeWidth="1.2" strokeDasharray="14,8,6,6" opacity="0.7" />
            <line x1="150" y1="255" x2="230" y2="360" stroke="#3D2817" strokeWidth="1" strokeDasharray="8,10" opacity="0.6" />

            {/* Clay / Alluvial Mid Layer */}
            <polygon
              points="70,195 300,310 300,345 70,230"
              fill="url(#subsoil-left)"
            />
            <line x1="90" y1="205" x2="280" y2="325" stroke="#68482E" strokeWidth="1.5" strokeDasharray="20,12,8,8" opacity="0.65" />

            {/* Topsoil / Root Humus Layer */}
            <polygon
              points="70,175 300,290 300,310 70,195"
              fill="url(#topsoil-left)"
            />
            <line x1="85" y1="183" x2="285" y2="299" stroke="#3B4F35" strokeWidth="1.2" strokeDasharray="10,6" opacity="0.75" />

            {/* 2. RIGHT SOIL CROSS-SECTION (Face 2: Center to Right - Shaded) */}
            {/* Deep Subsoil / Bedrock Layer */}
            <polygon
              points="300,345 530,230 530,260 300,375"
              fill="url(#deepsoil-right)"
            />
            <line x1="340" y1="350" x2="490" y2="248" stroke="#382315" strokeWidth="1.2" strokeDasharray="12,8,4,4" opacity="0.7" />

            {/* Clay / Alluvial Mid Layer */}
            <polygon
              points="300,310 530,195 530,230 300,345"
              fill="url(#subsoil-right)"
            />
            <line x1="320" y1="325" x2="510" y2="205" stroke="#4C3421" strokeWidth="1.5" strokeDasharray="18,10" opacity="0.65" />

            {/* Topsoil / Root Humus Layer */}
            <polygon
              points="300,290 530,175 530,195 300,310"
              fill="url(#topsoil-right)"
            />
            <line x1="315" y1="299" x2="515" y2="183" stroke="#2D3E2E" strokeWidth="1.2" strokeDasharray="12,6" opacity="0.75" />

            {/* Center Crease / Soil Edge Line */}
            <line x1="300" y1="290" x2="300" y2="375" stroke="#10272A" strokeWidth="2.2" />
            <line x1="70" y1="175" x2="70" y2="260" stroke="#10272A" strokeWidth="1.8" />
            <line x1="530" y1="175" x2="530" y2="260" stroke="#10272A" strokeWidth="1.8" />
            <polyline points="70,260 300,375 530,260" fill="none" stroke="#10272A" strokeWidth="2.2" />

            {/* Strata Label Indicators (Scientific synthetic cadastral cross-section) */}
            <g opacity="0.85">
              <text x="78" y="248" fill="#F1F5F0" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.4">
                {isBn ? 'গভীর পলিস্তর' : 'DEEP STRATA'}
              </text>
              <text x="78" y="214" fill="#F1F5F0" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.4">
                {isBn ? 'দোআঁশ মাটি' : 'CLAY ALLUVIAL'}
              </text>
              <text x="78" y="188" fill="#F1F5F0" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.4">
                {isBn ? 'উর্বর উপরিভাগ' : 'TOPSOIL'}
              </text>
            </g>

            {/* ========================================================
                TOP SURFACE: 3D CADASTRAL PARCEL MESH
                Subdivided into 6 synthetic rural mouza plots
                ======================================================== */}

            {/* Plot 1: Dag 420 (Top Left) */}
            <polygon
              points="300,60 185,118 235,160 350,102"
              fill="#DCECE0"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            <text x="250" y="112" fontFamily="var(--font-heading)" fontSize="11" fontWeight="700" fill="#2D4649">
              {isBn ? 'দাগ ৪২০' : 'Plot 420'}
            </text>
            <text x="250" y="125" fontFamily="var(--font-mono)" fontSize="8" fill="#3C5558">
              {isBn ? '২৫ শতক' : '25 dec'}
            </text>

            {/* Plot 2: Dag 421 (Far Left Corner) */}
            <polygon
              points="185,118 70,175 140,210 235,160"
              fill="#E5EFE4"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            <text x="145" y="165" fontFamily="var(--font-heading)" fontSize="11" fontWeight="700" fill="#2D4649">
              {isBn ? 'দাগ ৪২১' : 'Plot 421'}
            </text>
            <text x="145" y="178" fontFamily="var(--font-mono)" fontSize="8" fill="#3C5558">
              {isBn ? '১৮ শতক' : '18 dec'}
            </text>

            {/* Plot 3: Dag 422 with Mouza Pond (Top Right) */}
            <polygon
              points="300,60 350,102 460,140 415,85"
              fill="#D9EADA"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            {/* Synthetic Pond inside Plot 422 */}
            <ellipse cx="375" cy="98" rx="28" ry="12" fill="url(#water-gradient)" stroke="#2742A0" strokeWidth="1.4" />
            <path d="M 360 98 Q 375 94, 390 98" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
            <text x="365" y="94" fontFamily="var(--font-heading)" fontSize="8.5" fontWeight="700" fill="#1B3284">
              {isBn ? 'পুকুর' : 'Pond'}
            </text>

            {/* Plot 4: Dag 423 (Far Right Corner) */}
            <polygon
              points="415,85 460,140 530,175 480,120"
              fill="#E1EFE0"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            <text x="470" y="132" fontFamily="var(--font-heading)" fontSize="11" fontWeight="700" fill="#2D4649">
              {isBn ? 'দাগ ৪২৩' : 'Plot 423'}
            </text>

            {/* Plot 5: Dag 424 (Bottom Left) */}
            <polygon
              points="140,210 235,160 250,220 170,250"
              fill="#EAF3E8"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            <text x="180" y="205" fontFamily="var(--font-heading)" fontSize="11" fontWeight="700" fill="#2D4649">
              {isBn ? 'দাগ ৪২৪' : 'Plot 424'}
            </text>

            {/* Plot 6: Dag 425 & Public Access Road (Gopad / পথ) */}
            <polygon
              points="170,250 250,220 300,290 230,275"
              fill="#E6EFE4"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            <line x1="172" y1="250" x2="298" y2="289" stroke="#3C5558" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="215" y="258" fontFamily="var(--font-mono)" fontSize="7.5" fill="#3C5558">
              {isBn ? 'সরকারি গোপাট' : 'Pathway'}
            </text>

            {/* ========================================================
                HIGHLIGHTED TARGET PARCEL: DAG 427 (SPECIMEN DEMO PLOT)
                Points: (235, 160) - (460, 140) - (430, 225) - (250, 220)
                ======================================================== */}
            <g
              className="target-plot-group"
              style={{ cursor: 'pointer' }}
              onClick={() => onOpenPassport && onOpenPassport('rec-demo-001')}
            >
              {/* Highlight Fill with survey-ink accent */}
              <polygon
                points="235,160 460,140 430,225 250,220"
                fill="url(#plot-highlight-gradient)"
                stroke="#2742A0"
                strokeWidth="2.8"
              />

              {/* Cadastral Cross-Hatch Survey Markers */}
              <line x1="265" y1="172" x2="415" y2="218" stroke="#2742A0" strokeWidth="0.8" strokeDasharray="3,3" strokeOpacity="0.45" />
              <line x1="425" y1="152" x2="255" y2="208" stroke="#2742A0" strokeWidth="0.8" strokeDasharray="3,3" strokeOpacity="0.45" />

              {/* Glowing Survey Center Marker Pin */}
              <circle cx="345" cy="188" r="16" fill="#2742A0" fillOpacity="0.18" className="pulse-beacon" />
              <circle cx="345" cy="188" r="6" fill="#2742A0" stroke="#FFFFFF" strokeWidth="2" />

              {/* Plot 427 Badge in 3D Space */}
              <rect x="295" y="162" width="100" height="24" rx="4" fill="#FFFFFF" stroke="#2742A0" strokeWidth="1.6" filter="url(#block-shadow)" />
              <text x="312" y="178" fontFamily="var(--font-heading)" fontSize="12" fontWeight="800" fill="#2742A0">
                {isBn ? 'দাগ ৪২৭ ★' : 'Plot 427 ★'}
              </text>

              {/* Area Tag */}
              <rect x="305" y="198" width="80" height="18" rx="3" fill="#FBEBC4" stroke="#F2D48E" strokeWidth="1" />
              <text x="313" y="211" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" fill="#7A4E00">
                {isBn ? '৩১/৩৩ শতক' : '31/33 dec'}
              </text>
            </g>

            {/* Plot 7: Dag 430 (Bottom Right) */}
            <polygon
              points="430,225 460,140 530,175 435,260 300,290 250,220"
              fill="#DCEBE0"
              stroke="#10272A"
              strokeWidth="1.8"
            />
            <text x="375" y="248" fontFamily="var(--font-heading)" fontSize="11" fontWeight="700" fill="#2D4649">
              {isBn ? 'দাগ ৪৩০' : 'Plot 430'}
            </text>
          </g>
        </svg>

        {/* ========================================================
            FLOATING CITIZEN PLOT PASSPORT CARD
            Elegantly elevated in perspective above the 3D parcel
            ======================================================== */}
        <div 
          className="floating-passport-card"
          onClick={() => onOpenPassport && onOpenPassport('rec-demo-001')}
          role="button"
          tabIndex="0"
          onKeyDown={(e) => e.key === 'Enter' && onOpenPassport && onOpenPassport('rec-demo-001')}
          aria-label={isBn ? 'প্লট পাসপোর্ট প্রিভিউ খুলুন' : 'Open Plot Passport Preview'}
        >
          {/* Top Header */}
          <div className="card-top-row">
            <div className="card-title-group">
              <div className="shield-icon-badge">
                <Shield size={16} />
              </div>
              <div>
                <span className="card-kicker">
                  {isBn ? 'নাগরিক প্লট পাসপোর্ট' : 'CITIZEN PLOT PASSPORT'}
                </span>
                <strong className="card-plot-title">
                  {isBn ? 'দাগ ৪২৭ • খতিয়ান ১২৮' : 'Plot 427 • Khatian 128'}
                </strong>
              </div>
            </div>

            {/* Status Chip */}
            <span className="status-chip-review">
              <AlertTriangle size={13} />
              <span>{isBn ? 'আরও যাচাই দরকার' : 'Needs review'}</span>
            </span>
          </div>

          {/* Key Facts Row */}
          <div className="card-facts-grid">
            <div className="fact-item">
              <span className="fact-label">{isBn ? 'দলিলের জমি' : 'Deed Area'}</span>
              <span className="fact-value">{isBn ? '৩৩.০ শতক' : '33.0 dec'}</span>
            </div>
            <div className="fact-item">
              <span className="fact-label">{isBn ? 'রেকর্ডের জমি' : 'Record Area'}</span>
              <span className="fact-value">{isBn ? '৩১.০ শতক' : '31.0 dec'}</span>
            </div>
            <div className="fact-item highlight">
              <span className="fact-label">{isBn ? 'পার্থক্য' : 'Discrepancy'}</span>
              <span className="fact-value warn">{isBn ? '২.০ শতক কম' : '2.0 dec diff'}</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="card-footer-row">
            <span className="specimen-tag">
              {isBn ? 'নমুনা প্লট ডেটা' : 'SYNTHETIC SPECIMEN'}
            </span>
            <span className="view-passport-btn">
              <span>{isBn ? 'পাসপোর্ট দেখুন' : 'View Passport'}</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* 3D Scene Caption / Reassurance */}
      <div className="parcel-scene-footer">
        <span className="caption-text">
          <Layers size={13} />
          {isBn 
            ? 'ত্রিমাত্রিক ভূ-খণ্ড মডেল: দাগ ও মাটির গভীরতা প্রদর্শন (কাল্পনিক প্রদর্শনী ডেটা)' 
            : '3D Land Slice: Parcel mesh & geological strata (Synthetic specimen)'}
        </span>
      </div>
    </div>
  );
}
