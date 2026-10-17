import React, { useState } from 'react';
import { 
  FileCheck2, 
  MapPin, 
  Layers, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';

/**
 * UnifiedLandRecordCard (replaces Parcel3DVisual)
 * 
 * ONE UNIFIED CARD containing:
 * 1. Left Section (~50% on desktop): Realistic Cadastral/Satellite Land Map Visualization
 * 2. Right Section (~50% on desktop): Verified Land Record Information
 * 
 * Adheres strictly to Bhumi Kobocho brand color tokens and responsive specifications.
 */
export default function Parcel3DVisual({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport,
  onViewReports 
}) {
  const isBn = lang === 'bn';
  const [isMapHovered, setIsMapHovered] = useState(false);

  const handleOpenReport = () => {
    if (onViewReports) {
      onViewReports();
    } else if (onViewPassport) {
      onViewPassport('PCL-DHK-GUL-015-0550');
    } else if (onStartScanning) {
      onStartScanning();
    }
  };

  return (
    <div 
      className="unified-land-record-wrapper"
      style={{
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* THE SINGLE UNIFIED LAND RECORD CARD */}
      <div 
        className="unified-land-record-card"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.05fr',
          background: 'var(--paper)',
          border: '1.5px solid var(--line)',
          borderRadius: '16px',
          boxShadow: '0 16px 36px rgba(16, 39, 42, 0.09), 0 4px 12px rgba(16, 39, 42, 0.04)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* =========================================================================
            LEFT SECTION: LAND MAP VISUALIZATION (~50%)
           ========================================================================= */}
        <div 
          className="land-map-panel"
          onMouseEnter={() => setIsMapHovered(true)}
          onMouseLeave={() => setIsMapHovered(false)}
          style={{
            position: 'relative',
            background: 'linear-gradient(150deg, #E8EFE9 0%, #D8E5DB 50%, #E3EDE5 100%)',
            borderRight: '1px solid var(--line)',
            minHeight: '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Cadastral Topographic & Satellite Map Canvas (SVG) */}
          <svg
            viewBox="0 0 340 360"
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          >
            <defs>
              {/* Subtle Drop Shadow for Active Parcel */}
              <filter id="parcel-blue-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2742A0" floodOpacity="0.22" />
              </filter>

              {/* Cadastral Terrain Grid Pattern */}
              <pattern id="cadastral-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(16, 39, 42, 0.05)" strokeWidth="0.8" />
              </pattern>

              {/* Agricultural texture lines */}
              <pattern id="soil-furrows" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(60, 85, 88, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Base Layer: Mouza Grid Texture */}
            <rect width="100%" height="100%" fill="url(#cadastral-grid)" />
            <rect width="100%" height="100%" fill="url(#soil-furrows)" opacity="0.65" />

            {/* Topographic Contour Curves */}
            <path d="M -20,70 Q 170,45 360,80" fill="none" stroke="rgba(60, 85, 88, 0.12)" strokeWidth="1" strokeDasharray="6,4" />
            <path d="M -20,170 Q 180,150 360,185" fill="none" stroke="rgba(60, 85, 88, 0.10)" strokeWidth="1" strokeDasharray="6,4" />
            <path d="M -20,285 Q 160,265 360,300" fill="none" stroke="rgba(60, 85, 88, 0.12)" strokeWidth="1" strokeDasharray="6,4" />

            {/* Access Pathway / Mouza Road */}
            <path 
              d="M -20,315 C 100,308 230,325 360,330" 
              fill="none" 
              stroke="#CBD8D2" 
              strokeWidth="20" 
              strokeLinecap="round" 
            />
            <path 
              d="M -20,315 C 100,308 230,325 360,330" 
              fill="none" 
              stroke="#FBFCFA" 
              strokeWidth="1.5" 
              strokeDasharray="6,6" 
            />

            {/* Waterway / Canal boundary at bottom corner */}
            <path 
              d="M 230,360 C 270,330 310,320 340,315 L 340,360 Z" 
              fill="rgba(39, 66, 160, 0.08)" 
              stroke="rgba(39, 66, 160, 0.22)" 
              strokeWidth="1" 
            />

            {/* -------------------------------------------------------------
                ADJACENT PARCEL BOUNDARIES & LABELS
               ------------------------------------------------------------- */}
            {/* North Neighbor: Dag 559 */}
            <polygon 
              points="68,26 270,18 262,98 58,104"
              fill="rgba(255, 255, 255, 0.42)"
              stroke="#839B92"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            <text x="162" y="65" textAnchor="middle" fill="#4B665E" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              দাগ ৫৫৯
            </text>

            {/* West Neighbor: Dag 557 */}
            <polygon 
              points="16,112 96,108 86,252 10,244"
              fill="rgba(255, 255, 255, 0.42)"
              stroke="#839B92"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            <text x="52" y="184" textAnchor="middle" fill="#4B665E" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              দাগ ৫৫৭
            </text>

            {/* East Neighbor: Dag 560 */}
            <polygon 
              points="248,102 328,96 322,242 240,250"
              fill="rgba(255, 255, 255, 0.42)"
              stroke="#839B92"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            <text x="284" y="176" textAnchor="middle" fill="#4B665E" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              দাগ ৫৬০
            </text>

            {/* South Neighbor: Dag 555 */}
            <polygon 
              points="94,260 236,254 230,305 88,308"
              fill="rgba(255, 255, 255, 0.42)"
              stroke="#839B92"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            <text x="162" y="286" textAnchor="middle" fill="#4B665E" fontSize="10.5" fontWeight="600" fontFamily="var(--font-heading)">
              দাগ ৫৫৫
            </text>

            {/* -------------------------------------------------------------
                SELECTED PARCEL: DAG 558 (PROMINENT BLUE HIGHLIGHT)
               ------------------------------------------------------------- */}
            <g 
              style={{
                transition: 'transform 0.2s ease',
                transformOrigin: '168px 178px',
                transform: isMapHovered ? 'scale(1.015)' : 'scale(1)'
              }}
            >
              {/* Highlighted Selected Parcel Body */}
              <polygon 
                points="106,114 238,108 230,248 96,254"
                fill="rgba(39, 66, 160, 0.16)"
                stroke="#2742A0"
                strokeWidth="2.5"
                strokeLinejoin="round"
                filter="url(#parcel-blue-glow)"
              />

              {/* Interior Plot Survey Center Crosshairs */}
              <line x1="168" y1="130" x2="168" y2="230" stroke="rgba(39, 66, 160, 0.18)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="120" y1="180" x2="216" y2="180" stroke="rgba(39, 66, 160, 0.18)" strokeWidth="1" strokeDasharray="3,3" />

              {/* Parcel Corner Survey Pillars (Vertices) */}
              <circle cx="106" cy="114" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="238" cy="108" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="230" cy="248" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="96" cy="254" r="3.5" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Main Dag Number 558 Centered */}
              <text 
                x="167" 
                y="178" 
                textAnchor="middle" 
                fill="#10272A" 
                fontSize="15" 
                fontWeight="800" 
                fontFamily="var(--font-heading)"
                letterSpacing="0.3px"
              >
                দাগ ৫৫৮
              </text>
              <text 
                x="167" 
                y="198" 
                textAnchor="middle" 
                fill="#2742A0" 
                fontSize="11.5" 
                fontWeight="700" 
                fontFamily="var(--font-mono)"
              >
                ১০.০ শতক
              </text>

              {/* Subtle Location Marker Beacon */}
              <circle 
                cx="167" 
                cy="142" 
                r="10" 
                fill="none" 
                stroke="#2742A0" 
                strokeWidth="1.5" 
                opacity="0.55"
                className="beacon-pulse-circle" 
              />
              <circle 
                cx="167" 
                cy="142" 
                r="4.5" 
                fill="#2742A0" 
                stroke="#FFFFFF" 
                strokeWidth="1.5" 
              />
            </g>
          </svg>

          {/* Map Header Floating Overlay Badges */}
          <div 
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(251, 252, 250, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(203, 216, 210, 0.9)',
              boxShadow: '0 2px 6px rgba(16, 39, 42, 0.06)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            <Layers size={13} color="var(--primary-accent)" />
            <span>স্যাটেলাইট ক্যাডাস্ট্রাল ভিউ</span>
          </div>

          {/* Compass / Orientation Indicator (Top Right) */}
          <div 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(251, 252, 250, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(203, 216, 210, 0.9)',
              boxShadow: '0 2px 6px rgba(16, 39, 42, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--primary-accent)',
              fontFamily: 'var(--font-mono)'
            }}
            title="উত্তরমূখী নকশা (North Up)"
          >
            ↑N
          </div>

          {/* Bottom Cadastral Reference Tag */}
          <div 
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(251, 252, 250, 0.82)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(203, 216, 210, 0.7)'
            }}
          >
            <MapPin size={11} color="var(--primary-accent)" />
            <span>সাভার মৌজা • প্লট ৫৫৮</span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT SECTION: LAND RECORD INFORMATION (~50%)
           ========================================================================= */}
        <div 
          className="land-record-panel"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Row: Document Icon, Title & DEMO Tag */}
          <div>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '7px',
                    background: 'var(--accent-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #C4D6F5'
                  }}
                >
                  <FileCheck2 size={18} color="var(--primary-accent)" />
                </div>
                <h2 
                  style={{
                    fontSize: '1.14rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-heading)',
                    margin: 0,
                    letterSpacing: '-0.2px'
                  }}
                >
                  দলিল যাচাই রেকর্ড
                </h2>
              </div>

              {/* DEMO Indicator Tag */}
              <span 
                style={{
                  background: 'var(--ink)',
                  color: '#FFFFFF',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.6px'
                }}
              >
                DEMO
              </span>
            </div>

            {/* Clear Verified Status Indicator */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                color: 'var(--status-matched-text)',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                marginBottom: '16px'
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>স্থিতি: যাচাইকৃত রেকর্ড (Verified Demo Record)</span>
            </div>

            {/* Structured Sample Demo Data Grid: 8 Exact Requested Fields */}
            <div 
              className="record-fields-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px 14px',
                padding: '12px',
                background: 'var(--bg-paper)',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                marginBottom: '18px'
              }}
            >
              {/* Field 1: Owner */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  মালিক (Owner):
                </span>
                <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  সুলতানা জাহান
                </span>
              </div>

              {/* Field 2: Land Area */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  জমির পরিমাণ (Area):
                </span>
                <span style={{ display: 'block', fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  ১০ শতক <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>(10 decimals)</span>
                </span>
              </div>

              {/* Field 3: Dag No */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  দাগ নং (Dag No):
                </span>
                <span style={{ display: 'block', fontSize: '0.94rem', fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                  ৫৫৮ <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>(558)</span>
                </span>
              </div>

              {/* Field 4: Khatian */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  খতিয়ান (Khatian):
                </span>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  ১২৮ <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(Savar)</span>
                </span>
              </div>

              {/* Field 5: District */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  জেলা (District):
                </span>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  ঢাকা
                </span>
              </div>

              {/* Field 6: Upazila */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  উপজেলা (Upazila):
                </span>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  সাভার
                </span>
              </div>

              {/* Field 7: Mouza */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  মৌজা (Mouza):
                </span>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  সাভার
                </span>
              </div>

              {/* Field 8: Land Type */}
              <div className="record-field-cell">
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1px' }}>
                  জমির শ্রেণি (Type):
                </span>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  আবাসিক
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: "সম্পূর্ণ প্রতিবেদন দেখুন" */}
          <button
            type="button"
            id="view-full-record-report-btn"
            onClick={handleOpenReport}
            className="btn-view-report"
            style={{
              width: '100%',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0 16px',
              background: 'var(--primary-accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-std)',
              fontSize: '0.92rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(39, 66, 160, 0.25)',
              transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 5px 14px rgba(39, 66, 160, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary-accent)';
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(39, 66, 160, 0.25)';
            }}
          >
            <span>সম্পূর্ণ প্রতিবেদন দেখুন</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Embedded Responsive & Keyframe Animation Styles */}
      <style>{`
        @keyframes beaconPulse {
          0% {
            r: 4.5;
            opacity: 0.8;
          }
          50% {
            r: 12;
            opacity: 0.2;
          }
          100% {
            r: 14;
            opacity: 0;
          }
        }
        .beacon-pulse-circle {
          animation: beaconPulse 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          transform-origin: 167px 142px;
        }

        /* Mobile & Tablet Stacking (< 720px) */
        @media (max-width: 720px) {
          .unified-land-record-card {
            grid-template-columns: 1fr !important;
          }
          .land-map-panel {
            border-right: none !important;
            border-bottom: 1.5px solid var(--line) !important;
            min-height: 220px !important;
            max-height: 240px !important;
          }
          .land-record-panel {
            padding: 18px 16px !important;
          }
          .record-fields-grid {
            gap: 8px 10px !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
