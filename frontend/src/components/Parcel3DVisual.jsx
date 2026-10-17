import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Compass, 
  FileCheck2
} from 'lucide-react';

export default function Parcel3DVisual({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport 
}) {
  const isBn = lang === 'bn';
  const [activeMarker, setActiveMarker] = useState('dag558');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="hero-visual-composite-layout"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(28px, 4vw, 56px)',
        width: '100%',
        maxWidth: '660px',
        margin: '0 auto',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* =========================================================================
          REGION A: Dedicated 3D Land Parcel Canvas (LEFT REGION)
          Reserved strictly for the 3D rotating parcel, strata & scanning laser.
          The parcel is scaled and contained strictly inside this region.
         ========================================================================= */}
      <div 
        className="hero-visual-region-a"
        style={{
          position: 'relative',
          width: '280px',
          height: '340px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '900px'
        }}
      >
        {/* Soft Ambient Background Glow strictly inside Region A */}
        <div 
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(39, 66, 160, 0.12) 0%, rgba(203, 216, 210, 0.25) 50%, transparent 70%)',
            filter: 'blur(28px)',
            zIndex: 0,
            pointerEvents: 'none'
          }} 
        />

        {/* 3D Floating Scene Container for the Land Parcel */}
        <div 
          className="parcel-3d-scene"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            zIndex: 1
          }}
        >
          {/* Ground Contact Shadow */}
          <div 
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '50%',
              marginLeft: '-110px',
              width: '220px',
              height: '85px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(16, 39, 42, 0.22) 0%, rgba(16, 39, 42, 0.08) 50%, transparent 70%)',
              filter: 'blur(12px)',
              transform: 'rotateX(60deg)',
              pointerEvents: 'none',
              zIndex: 1
            }} 
          />

          {/* Isometric 3D Land Parcel Slab (Scaled to 195px x 140px so it stays strictly within Region A) */}
          <div 
            className="parcel-isometric-slab"
            style={{
              position: 'relative',
              width: '195px',
              height: '140px',
              transformStyle: 'preserve-3d',
              transform: 'rotateX(54deg) rotateZ(-32deg)',
              animation: 'floatingParcel 6s ease-in-out infinite alternate',
              zIndex: 5
            }}
          >
            {/* Layer 1: Geological Strata Side Face (Bottom/Left) */}
            <div style={{
              position: 'absolute',
              bottom: '-18px',
              left: 0,
              width: '100%',
              height: '18px',
              background: 'linear-gradient(180deg, #2D4649 0%, #1A383B 60%, #10272A 100%)',
              transformOrigin: 'bottom',
              transform: 'rotateX(90deg)',
              borderBottom: '2px solid var(--line)',
              boxShadow: '0 6px 14px rgba(16, 39, 42, 0.25)',
              zIndex: 6
            }}>
              <div style={{
                width: '100%',
                height: '5px',
                borderTop: '1px solid rgba(255,255,255,0.14)',
                borderBottom: '1px solid rgba(0,0,0,0.25)',
                marginTop: '4px',
                background: 'rgba(16, 39, 42, 0.15)'
              }} />
            </div>

            {/* Layer 2: Extruded Soil Layer Side Face (Right) */}
            <div style={{
              position: 'absolute',
              right: '-18px',
              top: 0,
              width: '18px',
              height: '100%',
              background: 'linear-gradient(90deg, #233D40 0%, #183336 50%, #10272A 100%)',
              transformOrigin: 'right',
              transform: 'rotateY(90deg)',
              zIndex: 6
            }}>
              <div style={{
                height: '100%',
                width: '7px',
                borderLeft: '1px solid rgba(255,255,255,0.12)',
                borderRight: '1px solid rgba(0,0,0,0.25)',
                marginLeft: '4px'
              }} />
            </div>

            {/* Layer 3: Top Cadastral Terrain Surface */}
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #E6ECE7 0%, #DFE8E2 45%, #D6E2DB 100%)',
                border: '2px solid var(--text-main)',
                borderRadius: '6px',
                boxShadow: 'inset 0 0 18px rgba(16, 39, 42, 0.08), 0 3px 12px rgba(16, 39, 42, 0.12)',
                overflow: 'hidden',
                zIndex: 7
              }}
            >
              {/* Topographic Contour Map Pattern & Cadastral Grid */}
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 330 240"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, opacity: 0.85 }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="cadastralGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(16, 39, 42, 0.12)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cadastralGrid)" />

                {/* Contour elevation curves */}
                <path d="M -20,60 Q 90,20 180,75 T 350,90" fill="none" stroke="rgba(16, 39, 42, 0.2)" strokeWidth="1.2" />
                <path d="M -20,110 Q 120,70 200,125 T 350,140" fill="none" stroke="rgba(16, 39, 42, 0.2)" strokeWidth="1.2" />
                <path d="M -20,160 Q 140,130 220,185 T 350,190" fill="none" stroke="rgba(16, 39, 42, 0.16)" strokeWidth="1.2" />
                <path d="M 40,-10 Q 110,90 140,250" fill="none" stroke="rgba(16, 39, 42, 0.14)" strokeWidth="1" strokeDasharray="3,3" />
                <path d="M 230,-10 Q 240,110 260,250" fill="none" stroke="rgba(16, 39, 42, 0.14)" strokeWidth="1" strokeDasharray="3,3" />

                {/* Sub-Plot Divisions (Adjacent Dags 557 & 559) */}
                <polygon points="15,20 120,15 110,120 10,105" fill="rgba(16, 39, 42, 0.04)" stroke="rgba(16, 39, 42, 0.25)" strokeWidth="1" strokeDasharray="4,4" />
                <text x="45" y="65" fill="rgba(16, 39, 42, 0.6)" fontSize="10" fontFamily="monospace">দাগ ৫৫৭</text>

                <polygon points="210,125 315,120 310,225 205,215" fill="rgba(16, 39, 42, 0.04)" stroke="rgba(16, 39, 42, 0.25)" strokeWidth="1" strokeDasharray="4,4" />
                <text x="245" y="175" fill="rgba(16, 39, 42, 0.6)" fontSize="10" fontFamily="monospace">দাগ ৫৫৯</text>

                {/* Primary Active Plot: DAG 558 */}
                <polygon 
                  points="125,50 255,40 245,175 115,160" 
                  fill="rgba(39, 66, 160, 0.14)" 
                  stroke="#2742A0" 
                  strokeWidth="2.2" 
                />
                <text x="160" y="105" fill="#10272A" fontSize="13" fontWeight="800" fontFamily="sans-serif">দাগ ৫৫৮</text>
                <text x="162" y="122" fill="#2742A0" fontSize="10" fontWeight="700" fontFamily="monospace">১০.০ শতক</text>
              </svg>

              {/* Glowing Laser Scan Line sweeping across the terrain */}
              <div 
                className="ai-laser-scanner-line"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(39, 66, 160, 0.2) 20%, #2742A0 50%, rgba(39, 66, 160, 0.2) 80%, transparent 100%)',
                  boxShadow: '0 0 12px 2px rgba(39, 66, 160, 0.5), 0 0 4px 1px #2742A0',
                  animation: 'terrainScanSweep 4.5s ease-in-out infinite alternate',
                  zIndex: 8,
                  pointerEvents: 'none'
                }}
              />

              {/* Verification status pulse aura on Dag 558 */}
              <div style={{
                position: 'absolute',
                top: '35px',
                left: '85px',
                width: '90px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(39, 66, 160, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'verifiedPulse 2.5s ease-in-out infinite'
              }} />
            </div>

            {/* Marker 1: Primary Dag 558 Pin (Centered above Dag 558) */}
            <div 
              onClick={() => setActiveMarker('dag558')}
              style={{
                position: 'absolute',
                top: '42px',
                left: '95px',
                transform: 'translateZ(35px) rotateZ(32deg) rotateX(-54deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 12,
                filter: 'drop-shadow(0 4px 6px rgba(16, 39, 42, 0.25))',
                transition: 'transform 0.3s ease'
              }}
            >
              <div style={{
                background: 'var(--primary-accent)',
                border: '1.5px solid #C4D6F5',
                borderRadius: '16px',
                padding: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 3px 10px rgba(39, 66, 160, 0.4)',
                whiteSpace: 'nowrap'
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 0 5px 2px rgba(255, 255, 255, 0.8)'
                }} />
                <strong style={{ color: '#FFFFFF', fontSize: '0.7rem', fontFamily: 'var(--font-heading)' }}>
                  দাগ ৫৫৮ • ১০ শতক
                </strong>
              </div>
              <div style={{
                width: '1.5px',
                height: '14px',
                background: 'linear-gradient(180deg, var(--primary-accent) 0%, transparent 100%)'
              }} />
            </div>

            {/* Marker 2: Cadastral Survey Boundary Pillar (Northwest Corner) */}
            <div 
              onClick={() => setActiveMarker('pillar45')}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                transform: 'translateZ(24px) rotateZ(32deg) rotateX(-54deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 12,
                filter: 'drop-shadow(0 3px 5px rgba(16, 39, 42, 0.2))'
              }}
            >
              <div style={{
                background: 'rgba(251, 252, 250, 0.95)',
                border: '1.5px solid var(--text-main)',
                borderRadius: '12px',
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(16, 39, 42, 0.1)'
              }}>
                <Compass size={9} color="var(--primary-accent)" />
                <span style={{ color: 'var(--text-main)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  পিলার #৪৫
                </span>
              </div>
              <div style={{ width: '1.5px', height: '10px', background: 'var(--text-main)' }} />
            </div>

            {/* Marker 3: Khatian 128 (Southwest quadrant to maintain clean spatial distribution) */}
            <div 
              onClick={() => setActiveMarker('khatian128')}
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                transform: 'translateZ(24px) rotateZ(32deg) rotateX(-54deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 12,
                filter: 'drop-shadow(0 3px 5px rgba(16, 39, 42, 0.2))'
              }}
            >
              <div style={{
                background: 'rgba(251, 252, 250, 0.95)',
                border: '1.5px solid var(--line)',
                borderRadius: '12px',
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(16, 39, 42, 0.1)'
              }}>
                <Layers size={9} color="var(--primary-accent)" />
                <span style={{ color: 'var(--text-main)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  খতিয়ান ১২৮
                </span>
              </div>
              <div style={{ width: '1.5px', height: '10px', background: 'var(--line)' }} />
            </div>
          </div>

          {/* Micro Floating Badge: Chain Continuity (Northwest boundary) */}
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              left: '6px',
              background: 'rgba(251, 252, 250, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid var(--line)',
              borderRadius: '7px',
              padding: '5px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 6px 16px rgba(16, 39, 42, 0.08)',
              zIndex: 15,
              animation: 'floatingMiniBadge 6s ease-in-out infinite alternate 1s'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--status-matched-text)',
              boxShadow: '0 0 6px var(--status-matched-text)'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CHAIN CONTINUITY
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 700 }}>
                {isBn ? 'ধারাবাহিকতা অক্ষুণ্ণ' : '100% Sequential Title'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          REGION B: Dedicated Land Information Card (RIGHT REGION)
          Physically separate layout region, positioned completely outside Region A.
          All fields (Owner, Dag No, Area, Khatian, Status) are 100% visible & legible.
         ========================================================================= */}
      <div 
        className="hero-visual-region-b"
        style={{
          width: '275px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <div 
          className="floating-glass-deed-card"
          style={{
            width: '100%',
            background: 'rgba(251, 252, 250, 0.96)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1.5px solid var(--line)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: '0 16px 36px rgba(16, 39, 42, 0.12), 0 2px 8px rgba(16, 39, 42, 0.06)',
            animation: 'floatingInfoCard 5s ease-in-out infinite alternate',
            color: 'var(--text-main)',
            boxSizing: 'border-box'
          }}
        >
          {/* Card Top Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--line)',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{
                background: 'var(--accent-tint)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex'
              }}>
                <FileCheck2 size={16} color="var(--primary-accent)" />
              </div>
              <span style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--primary-accent)',
                letterSpacing: '0.4px',
                fontWeight: 700
              }}>
                {isBn ? 'দলিল যাচাই রেকর্ড' : 'VERIFIED DEED'}
              </span>
            </div>

            <span style={{
              background: 'var(--dark-band)',
              color: '#FDE68A',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)'
            }}>
              DEMO
            </span>
          </div>

          {/* Sample Fields Requested by User */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {isBn ? 'মালিক (Owner):' : 'Owner:'}
              </span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontSize: '0.88rem' }}>
                সুলতানা জাহান
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {isBn ? 'দাগ নং (Dag No):' : 'Dag No:'}
              </span>
              <strong style={{ color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.86rem' }}>
                ৫৫৮ (558)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {isBn ? 'জমির পরিমাণ (Area):' : 'Area:'}
              </span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.86rem' }}>
                ১০ শতক (10 decimals)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {isBn ? 'খতিয়ান (Khatian):' : 'Khatian:'}
              </span>
              <span style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600 }}>
                ১২৮ (Savar)
              </span>
            </div>

            {/* Status Field */}
            <div style={{
              marginTop: '4px',
              paddingTop: '9px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                {isBn ? 'স্থিতি (Status):' : 'Status:'}
              </span>
              <span style={{
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                color: 'var(--status-matched-text)',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <ShieldCheck size={13} color="var(--status-matched-text)" />
                <span>{isBn ? 'যাচাইকৃত রেকর্ড' : 'Verified Demo Record'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS Animations & Media Queries */}
      <style>{`
        @keyframes floatingParcel {
          0% {
            transform: rotateX(54deg) rotateZ(-32deg) translateY(0px);
          }
          100% {
            transform: rotateX(52deg) rotateZ(-31deg) translateY(-10px);
          }
        }

        @keyframes floatingInfoCard {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-8px);
          }
        }

        @keyframes floatingMiniBadge {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-5px);
          }
        }

        @keyframes terrainScanSweep {
          0% {
            top: 2%;
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 96%;
            opacity: 0.8;
          }
        }

        @keyframes verifiedPulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.6;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .parcel-isometric-slab,
          .floating-glass-deed-card,
          .ai-laser-scanner-line,
          .parcel-3d-scene {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Tablet & Laptop Adjustments (861px to 1024px) */
        @media (max-width: 1024px) and (min-width: 861px) {
          .hero-visual-composite-layout {
            gap: 20px !important;
            max-width: 580px !important;
          }
          .hero-visual-region-a {
            width: 260px !important;
            height: 320px !important;
          }
          .hero-visual-region-b {
            width: 260px !important;
          }
        }

        /* Mobile Viewports (<= 860px): Stack Vertically (Parcel Above, Card Below) */
        @media (max-width: 860px) {
          .hero-visual-composite-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
            max-width: 100% !important;
          }
          .hero-visual-region-a {
            width: 100% !important;
            max-width: 300px !important;
            height: 260px !important;
          }
          .hero-visual-region-b {
            width: 100% !important;
            max-width: 320px !important;
          }
        }

        /* Small Mobile Devices (<= 420px) */
        @media (max-width: 420px) {
          .hero-visual-region-a {
            height: 230px !important;
            transform: scale(0.92) !important;
          }
          .hero-visual-region-b {
            max-width: 300px !important;
          }
          .floating-glass-deed-card {
            padding: 14px 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
