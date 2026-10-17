import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  MapPin, 
  Layers, 
  ArrowRight, 
  CheckCircle2,
  ScanText,
  Clock,
  Sparkles,
  Maximize2,
  ShieldCheck,
  FileText,
  Compass
} from 'lucide-react';

/**
 * TheLivingLandMap
 * 
 * DESIGN CONCEPT: "The Living Land Map"
 * The central visual identity of Bhumi Kobocho:
 * - Abstract but realistic digital cadastral land map (SVG)
 * - Multiple connected parcels with thin boundary lines
 * - One selected parcel (Dag 558) highlighted with survey pillars & glowing pulse
 * - Micro AI scanning beam projecting from deed outline onto the parcel
 * - Small docked parcel information HUD (Dag, Area, Owner, Status)
 * - Subtle ownership-history timeline along the bottom
 * - Interactive parcel selection (Dag 558, 557, 559)
 */
export default function Parcel3DVisual({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport, 
  onViewReports 
}) {
  const isBn = lang === 'bn';
  const [selectedDag, setSelectedDag] = useState('558');
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [activeLayer, setActiveLayer] = useState('cadastral'); // 'cadastral' | 'scan' | 'history'

  // Sample parcel database for interactive exploration
  const parcels = {
    '558': {
      dagNo: '৫৫৮',
      dagNoEn: '558',
      area: '১০.০ শতক',
      areaEn: '10.0 decimals',
      owner: 'সুলতানা জাহান',
      ownerEn: 'Sultana Jahan',
      khatian: '১২৮ (RS/BS)',
      type: 'আবাসিক (Residential)',
      status: 'verified',
      statusText: isBn ? 'যাচাইকৃত রেকর্ড' : 'Verified Record',
      mouza: 'সাভার • জে.এল ২১',
      polyPoints: '112,118 244,112 236,244 102,250',
      center: { x: 172, y: 181 },
      timeline: [
        { year: '১৯৯৮', event: 'আরএস জরিপ রেকর্ড', owner: 'মো. রফিক' },
        { year: '২০১২', event: 'উত্তরাধিকার বণ্টন #৪১০২', owner: 'আব্দুল করিম' },
        { year: '২০২১', event: 'বিক্রয় কবলা #৮৮৩৪ (১০ শতক)', owner: 'সুলতানা জাহান' },
        { year: '২০২৬', event: 'ডিজিটাল প্লট সনদ প্রস্তুত', owner: 'যাচাইকৃত ও অখণ্ড' }
      ]
    },
    '557': {
      dagNo: '৫৫৭',
      dagNoEn: '557',
      area: '১২.৫ শতক',
      areaEn: '12.5 decimals',
      owner: 'মোঃ কামরুল হাসান',
      ownerEn: 'Md. Kamrul Hasan',
      khatian: '১২৬ (RS)',
      type: 'কৃষি/আবাসিক',
      status: 'verified',
      statusText: isBn ? 'রেকর্ডভুক্ত' : 'Recorded',
      mouza: 'সাভার • জে.এল ২১',
      polyPoints: '22,124 104,120 94,248 16,242',
      center: { x: 59, y: 183 },
      timeline: [
        { year: '২০০৪', event: 'মৌজা জরিপ খতিয়ান', owner: 'বসির উদ্দিন' },
        { year: '২০১৮', event: 'হেবা দলিল #১১৯০', owner: 'মোঃ কামরুল হাসান' }
      ]
    },
    '559': {
      dagNo: '৫৫৯',
      dagNoEn: '559',
      area: '৮.০ শতক',
      areaEn: '8.0 decimals',
      owner: 'আনোয়ারা বেগম',
      ownerEn: 'Anowara Begum',
      khatian: '১৩০ (RS)',
      type: 'বাগান/বাস্তু',
      status: 'verified',
      statusText: isBn ? 'রেকর্ডভুক্ত' : 'Recorded',
      mouza: 'সাভার • জে.এল ২১',
      polyPoints: '72,32 264,26 256,104 62,110',
      center: { x: 163, y: 68 },
      timeline: [
        { year: '২০০১', event: 'মূল আরএস খতিয়ান', owner: 'আনোয়ারা বেগম' }
      ]
    }
  };

  const currentParcel = parcels[selectedDag] || parcels['558'];

  const handleOpenReport = () => {
    if (onViewReports) {
      onViewReports();
    } else if (onViewPassport) {
      onViewPassport('PCL-DHK-GUL-015-0558');
    } else if (onStartScanning) {
      onStartScanning();
    }
  };

  return (
    <div 
      className="living-land-map-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* Outer Cadastral Map Container with Fine Coordinate Border */}
      <div 
        className="living-map-card"
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--line)',
          borderRadius: '16px',
          boxShadow: '0 16px 40px rgba(16, 39, 42, 0.08), 0 2px 8px rgba(16, 39, 42, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* =========================================================================
            MAP HEADER TOOLBAR: Coordinates, Mouza Sheet, Mode Toggles
           ========================================================================= */}
        <div 
          style={{
            padding: '10px 18px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {/* Left: Mouza & Sheet Identifier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '0.3px'
            }}>
              <Compass size={14} color="var(--primary-accent)" />
              <span>SAVAR MOUZA • SHEET 01</span>
            </span>
            <span style={{ color: 'var(--line)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>
              COORD: 23°51'12"N 90°15'36"E
            </span>
          </div>

          {/* Right: Live Scanning Beacon & Layer Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              color: 'var(--primary-accent)',
              fontSize: '0.70rem',
              fontWeight: 700
            }}>
              <span className="live-radar-dot" style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--primary-accent)'
              }} />
              <span>LIVE CADASTRAL LINK</span>
            </div>
            <span style={{
              fontWeight: 800,
              color: 'var(--text-main)',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--line)'
            }}>
              ↑ N
            </span>
          </div>
        </div>

        {/* =========================================================================
            SPLIT LIVING MAP CANVAS: Map Visualization (Left/Main) & HUD Overlay
           ========================================================================= */}
        <div 
          className="living-map-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            position: 'relative',
            minHeight: '360px',
            background: 'linear-gradient(145deg, #EBF1EC 0%, #DDE7E0 55%, #E5EEE7 100%)'
          }}
        >
          {/* =====================================================================
              LEFT CANVAS: INTERACTIVE CADASTRAL VECTOR MAP (SVG)
             ===================================================================== */}
          <div 
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '12px',
              borderRight: '1px solid var(--line)'
            }}
          >
            <svg
              viewBox="0 0 350 360"
              preserveAspectRatio="xMidYMid meet"
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            >
              <defs>
                {/* Active Parcel Blue Glow Filter */}
                <filter id="active-parcel-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#2742A0" floodOpacity="0.25" />
                </filter>

                {/* Cadastral Topo Grid */}
                <pattern id="cad-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16, 39, 42, 0.05)" strokeWidth="0.75" />
                </pattern>

                {/* Agricultural/Paddy Furrow Hatch */}
                <pattern id="field-hatch" width="10" height="10" patternTransform="rotate(40 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(60, 85, 88, 0.04)" strokeWidth="0.8" />
                </pattern>

                {/* Document Scanner Laser Gradient */}
                <linearGradient id="scan-laser-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(39, 66, 160, 0)" />
                  <stop offset="50%" stopColor="rgba(39, 66, 160, 0.7)" />
                  <stop offset="100%" stopColor="rgba(39, 66, 160, 0)" />
                </linearGradient>
              </defs>

              {/* Background Ground Textures */}
              <rect width="100%" height="100%" fill="url(#cad-grid-pattern)" />
              <rect width="100%" height="100%" fill="url(#field-hatch)" />

              {/* Topographic Contour Lines */}
              <path d="M -10,65 Q 170,40 360,75" fill="none" stroke="rgba(60, 85, 88, 0.12)" strokeWidth="1" strokeDasharray="5,4" />
              <path d="M -10,165 Q 175,145 360,180" fill="none" stroke="rgba(60, 85, 88, 0.10)" strokeWidth="1" strokeDasharray="5,4" />
              <path d="M -10,275 Q 165,255 360,290" fill="none" stroke="rgba(60, 85, 88, 0.12)" strokeWidth="1" strokeDasharray="5,4" />

              {/* Access Pathway / Mouza Road */}
              <path 
                d="M -20,305 C 100,298 220,315 360,320" 
                fill="none" 
                stroke="#CAD7CF" 
                strokeWidth="18" 
                strokeLinecap="round" 
              />
              <path 
                d="M -20,305 C 100,298 220,315 360,320" 
                fill="none" 
                stroke="#FBFCFA" 
                strokeWidth="1.5" 
                strokeDasharray="6,5" 
              />
              <text x="50" y="318" fill="#4B665E" fontSize="8.5" fontFamily="var(--font-mono)" letterSpacing="1px">
                মৌজা সংযোগ সড়ক • ACCESS ROAD
              </text>

              {/* Water Canal Boundary at Bottom Right */}
              <path 
                d="M 235,350 C 270,320 310,310 350,305 L 350,350 Z" 
                fill="rgba(39, 66, 160, 0.08)" 
                stroke="rgba(39, 66, 160, 0.22)" 
                strokeWidth="1" 
              />

              {/* =============================================================
                  CONNECTED PARCEL POLYGONS (SURROUNDING & SELECTED)
                 ============================================================= */}
              
              {/* Parcel: Dag 559 (North) */}
              <polygon 
                points={parcels['559'].polyPoints}
                fill={selectedDag === '559' ? 'rgba(39, 66, 160, 0.18)' : 'rgba(255, 255, 255, 0.45)'}
                stroke={selectedDag === '559' ? '#2742A0' : '#839B92'}
                strokeWidth={selectedDag === '559' ? '2' : '1.2'}
                strokeDasharray={selectedDag === '559' ? 'none' : '4,3'}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => setSelectedDag('559')}
              />
              <text x="163" y="68" textAnchor="middle" fill={selectedDag === '559' ? '#10272A' : '#4B665E'} fontSize="11" fontWeight="700" fontFamily="var(--font-heading)">
                দাগ ৫৫৯
              </text>

              {/* Parcel: Dag 557 (West) */}
              <polygon 
                points={parcels['557'].polyPoints}
                fill={selectedDag === '557' ? 'rgba(39, 66, 160, 0.18)' : 'rgba(255, 255, 255, 0.45)'}
                stroke={selectedDag === '557' ? '#2742A0' : '#839B92'}
                strokeWidth={selectedDag === '557' ? '2' : '1.2'}
                strokeDasharray={selectedDag === '557' ? 'none' : '4,3'}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => setSelectedDag('557')}
              />
              <text x="59" y="183" textAnchor="middle" fill={selectedDag === '557' ? '#10272A' : '#4B665E'} fontSize="11" fontWeight="700" fontFamily="var(--font-heading)">
                দাগ ৫৫৭
              </text>

              {/* Parcel: Dag 560 (East Neighbor) */}
              <polygon 
                points="248,106 332,100 324,238 240,244"
                fill="rgba(255, 255, 255, 0.45)"
                stroke="#839B92"
                strokeWidth="1.2"
                strokeDasharray="4,3"
              />
              <text x="286" y="174" textAnchor="middle" fill="#4B665E" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
                দাগ ৫৬০
              </text>

              {/* Parcel: Dag 555 (South Neighbor) */}
              <polygon 
                points="100,256 238,250 232,298 94,302"
                fill="rgba(255, 255, 255, 0.45)"
                stroke="#839B92"
                strokeWidth="1.2"
                strokeDasharray="4,3"
              />
              <text x="166" y="280" textAnchor="middle" fill="#4B665E" fontSize="10.5" fontWeight="600" fontFamily="var(--font-heading)">
                দাগ ৫৫৫
              </text>

              {/* =============================================================
                  MAIN SELECTED PARCEL: DAG 558 (PROMINENT BLUE HIGHLIGHT)
                 ============================================================= */}
              <g 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedDag('558')}
              >
                {/* Active Highlight Body */}
                <polygon 
                  points={parcels['558'].polyPoints}
                  fill={selectedDag === '558' ? 'rgba(39, 66, 160, 0.16)' : 'rgba(255, 255, 255, 0.45)'}
                  stroke="#2742A0"
                  strokeWidth={selectedDag === '558' ? '2.5' : '1.5'}
                  strokeLinejoin="round"
                  filter={selectedDag === '558' ? 'url(#active-parcel-glow)' : 'none'}
                />

                {/* Survey Center Crosshair Guidelines */}
                <line x1="172" y1="130" x2="172" y2="232" stroke="rgba(39, 66, 160, 0.22)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="124" y1="181" x2="220" y2="181" stroke="rgba(39, 66, 160, 0.22)" strokeWidth="1" strokeDasharray="3,3" />

                {/* 4 Corner Cadastral Survey Pillars (Vertices) */}
                <circle cx="112" cy="118" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="244" cy="112" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="236" cy="244" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="102" cy="250" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Vertex Coordinate Labels (Survey markers) */}
                <text x="116" y="112" fill="#2742A0" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">A1</text>
                <text x="248" y="108" fill="#2742A0" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">A2</text>
                <text x="240" y="254" fill="#2742A0" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">A3</text>
                <text x="94" y="258" fill="#2742A0" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">A4</text>

                {/* Parcel Center Text */}
                <text 
                  x="172" 
                  y="174" 
                  textAnchor="middle" 
                  fill="#10272A" 
                  fontSize="15" 
                  fontWeight="900" 
                  fontFamily="var(--font-heading)"
                  letterSpacing="0.4px"
                >
                  দাগ ৫৫৮
                </text>
                <text 
                  x="172" 
                  y="194" 
                  textAnchor="middle" 
                  fill="#2742A0" 
                  fontSize="11.5" 
                  fontWeight="800" 
                  fontFamily="var(--font-mono)"
                >
                  ১০.০ শতক
                </text>

                {/* AI Laser Scanner Beam Animation across parcel */}
                <g className="scanner-beam-line">
                  <line x1="108" y1="181" x2="240" y2="181" stroke="url(#scan-laser-grad)" strokeWidth="3" />
                  <circle cx="172" cy="181" r="5" fill="#2742A0" opacity="0.6" />
                </g>
              </g>

              {/* Floating Document-to-Map Vector Link (Top-Left Badge) */}
              <g transform="translate(14, 14)">
                <rect width="90" height="26" rx="4" fill="rgba(251, 252, 250, 0.95)" stroke="#C4D6F5" strokeWidth="1" />
                <circle cx="12" cy="13" r="3.5" fill="#2742A0" />
                <text x="22" y="17" fill="#10272A" fontSize="9" fontWeight="700" fontFamily="var(--font-heading)">
                  দলিল &harr; নকশা লিঙ্ক
                </text>
              </g>
            </svg>
          </div>

          {/* =====================================================================
              RIGHT PANEL: DOCKED PARCEL INTELLIGENCE HUD (Integrated & Clean)
             ===================================================================== */}
          <div 
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          >
            <div>
              {/* Header: Document Title & Verification Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'var(--accent-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #C4D6F5'
                  }}>
                    <FileCheck2 size={16} color="var(--primary-accent)" />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-heading)',
                      margin: 0
                    }}>
                      ভূমি রেকর্ড সারাংশ
                    </h3>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      PARCEL INTELLIGENCE
                    </span>
                  </div>
                </div>

                <span style={{
                  background: 'var(--ink)',
                  color: '#FFFFFF',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 7px',
                  borderRadius: '4px'
                }}>
                  DEMO SPECIMEN
                </span>
              </div>

              {/* Verified Title Status Alert Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                color: 'var(--status-matched-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                marginBottom: '14px'
              }}>
                <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                <span>{currentParcel.statusText} • মালিকানা ধারাবাহিক</span>
              </div>

              {/* Structured Key Attributes Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px 10px',
                  padding: '10px 12px',
                  background: 'var(--bg-paper)',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    মালিক (Owner):
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {currentParcel.owner}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    জমির পরিমাণ (Area):
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {currentParcel.area}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    দাগ নং (Dag No):
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                    {currentParcel.dagNo}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    খতিয়ান (Khatian):
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {currentParcel.khatian}
                  </strong>
                </div>
              </div>

              {/* Dynamic Interactive Hint */}
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '10px'
              }}>
                <MapPin size={12} color="var(--primary-accent)" />
                <span>মৌজা নকশায় ক্লিক করে দাগ পরিবর্তন করুন</span>
              </div>
            </div>

            {/* Action Button: "সম্পূর্ণ রেকর্ড পাসপোর্ট দেখুন" */}
            <button
              type="button"
              id="view-living-map-report-btn"
              onClick={handleOpenReport}
              className="btn-primary"
              style={{
                width: '100%',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0 14px',
                background: 'var(--primary-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-std)',
                fontSize: '0.86rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(39, 66, 160, 0.25)',
                transition: 'background 0.15s ease, transform 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-accent-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary-accent)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              <span>{isBn ? 'সম্পূর্ণ রেকর্ড পাসপোর্ট দেখুন' : 'View Plot Passport'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SUB-BAR: INTEGRATED OWNERSHIP-HISTORY TIMELINE
           ========================================================================= */}
        <div 
          className="living-map-timeline-bar"
          style={{
            padding: '10px 18px',
            background: 'var(--bg-paper)',
            borderTop: '1px solid var(--line)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--primary-accent)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {isBn ? 'মালিকানা ধারাবাহিকতা টাইমলাইন (Chain of Custody)' : 'Chain of Custody Timeline'}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              দাগ {currentParcel.dagNo} • ৪টি পর্যায়
            </span>
          </div>

          {/* Timeline Nodes Bar */}
          <div 
            className="timeline-nodes-track"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              position: 'relative'
            }}
          >
            {currentParcel.timeline.map((node, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '0.70rem',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                    {node.year}
                  </span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary-accent)' }} />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.owner}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.64rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.event}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe Animations for Living Radar & Laser */}
      <style>{`
        @keyframes laserScanPulse {
          0% {
            transform: translateY(-40px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(0px);
            opacity: 0.9;
          }
          100% {
            transform: translateY(40px);
            opacity: 0.2;
          }
        }
        .scanner-beam-line {
          animation: laserScanPulse 3.2s ease-in-out infinite alternate;
          transform-origin: 172px 181px;
        }

        @keyframes liveRadarBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .live-radar-dot {
          animation: liveRadarBlink 1.8s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .living-map-split {
            grid-template-columns: 1fr !important;
          }
          .living-map-split > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--line) !important;
            min-height: 240px !important;
          }
          .timeline-nodes-track {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
          }
        }
      `}</style>
    </div>
  );
}
