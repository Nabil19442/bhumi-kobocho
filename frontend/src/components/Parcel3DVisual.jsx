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
      className="parcel-3d-visual-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '620px',
        margin: '0 auto',
        minHeight: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none'
      }}
    >
      {/* Ambient background glow behind 3D visual */}
      <div 
        className="parcel-ambient-glow"
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(39, 66, 160, 0.12) 0%, rgba(203, 216, 210, 0.25) 45%, transparent 70%)',
          filter: 'blur(36px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} 
      />

      {/* 3D Floating Scene Container */}
      <div 
        className="parcel-3d-scene"
        style={{
          position: 'relative',
          width: '100%',
          height: '440px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          zIndex: 1
        }}
      >
        {/* Soft Ground Contact Shadow */}
        <div 
          className="parcel-ground-shadow"
          style={{
            position: 'absolute',
            left: '12px',
            top: '230px',
            width: '330px',
            height: '130px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(16, 39, 42, 0.22) 0%, rgba(16, 39, 42, 0.08) 50%, transparent 70%)',
            filter: 'blur(16px)',
            transform: 'rotateX(60deg)',
            pointerEvents: 'none',
            zIndex: 1
          }} 
        />

        {/* Isometric 3D Land Parcel Base (Positioned to left on desktop so it does NOT overlap the card) */}
        <div 
          className="parcel-isometric-slab"
          style={{
            position: 'absolute',
            left: '18px',
            top: '95px',
            width: '295px',
            height: '215px',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(54deg) rotateZ(-32deg)',
            animation: 'floatingParcel 6s ease-in-out infinite alternate',
            zIndex: 5
          }}
        >
          {/* Layer 1: Bottom Bedrock / Geological Strata Side Face (Left) */}
          <div style={{
            position: 'absolute',
            bottom: '-28px',
            left: 0,
            width: '100%',
            height: '28px',
            background: 'linear-gradient(180deg, #2D4649 0%, #1A383B 60%, #10272A 100%)',
            transformOrigin: 'bottom',
            transform: 'rotateX(90deg)',
            borderBottom: '2px solid var(--line)',
            boxShadow: '0 8px 20px rgba(16, 39, 42, 0.2)',
            zIndex: 6
          }}>
            {/* Strata layer lines */}
            <div style={{
              width: '100%',
              height: '8px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              borderBottom: '1px solid rgba(0,0,0,0.25)',
              marginTop: '6px',
              background: 'rgba(16, 39, 42, 0.15)'
            }} />
          </div>

          {/* Layer 2: Extruded Soil Layer Side Face (Right) */}
          <div style={{
            position: 'absolute',
            right: '-28px',
            top: 0,
            width: '28px',
            height: '100%',
            background: 'linear-gradient(90deg, #233D40 0%, #183336 50%, #10272A 100%)',
            transformOrigin: 'right',
            transform: 'rotateY(90deg)',
            zIndex: 6
          }}>
            {/* Soil texture lines */}
            <div style={{
              height: '100%',
              width: '10px',
              borderLeft: '1px solid rgba(255,255,255,0.12)',
              borderRight: '1px solid rgba(0,0,0,0.25)',
              marginLeft: '6px'
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
              borderRadius: '8px',
              boxShadow: 'inset 0 0 25px rgba(16, 39, 42, 0.08), 0 4px 18px rgba(16, 39, 42, 0.12)',
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
                <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="20%" stopColor="rgba(39, 66, 160, 0.2)" />
                  <stop offset="50%" stopColor="#2742A0" />
                  <stop offset="80%" stopColor="rgba(39, 66, 160, 0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
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
                height: '4px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(39, 66, 160, 0.2) 20%, #2742A0 50%, rgba(39, 66, 160, 0.2) 80%, transparent 100%)',
                boxShadow: '0 0 14px 2px rgba(39, 66, 160, 0.5), 0 0 4px 1px #2742A0',
                animation: 'terrainScanSweep 4.5s ease-in-out infinite alternate',
                zIndex: 8,
                pointerEvents: 'none'
              }}
            />

            {/* Verification status pulse aura on Dag 558 */}
            <div style={{
              position: 'absolute',
              top: '45px',
              left: '115px',
              width: '125px',
              height: '115px',
              background: 'radial-gradient(circle, rgba(39, 66, 160, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'verifiedPulse 2.5s ease-in-out infinite'
            }} />
          </div>

          {/* 3D Billboards: Floating Land Record Markers standing upright above terrain */}
          {/* Marker 1: Primary Dag 558 Pin (Centered above Dag 558) */}
          <div 
            onClick={() => setActiveMarker('dag558')}
            style={{
              position: 'absolute',
              top: '70px',
              left: '158px',
              transform: 'translateZ(45px) rotateZ(32deg) rotateX(-54deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 12,
              filter: 'drop-shadow(0 4px 8px rgba(16, 39, 42, 0.25))',
              transition: 'transform 0.3s ease'
            }}
          >
            <div style={{
              background: 'var(--primary-accent)',
              border: '1.5px solid #C4D6F5',
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(39, 66, 160, 0.4)',
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)'
              }} />
              <strong style={{ color: '#FFFFFF', fontSize: '0.78rem', fontFamily: 'var(--font-heading)' }}>
                দাগ ৫৫৮ • ১০ শতক
              </strong>
            </div>
            {/* Pin pointer leg */}
            <div style={{
              width: '2px',
              height: '18px',
              background: 'linear-gradient(180deg, var(--primary-accent) 0%, transparent 100%)'
            }} />
          </div>

          {/* Marker 2: Cadastral Survey Boundary Pillar (Northwest Corner) */}
          <div 
            onClick={() => setActiveMarker('pillar45')}
            style={{
              position: 'absolute',
              top: '22px',
              left: '24px',
              transform: 'translateZ(30px) rotateZ(32deg) rotateX(-54deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 12,
              filter: 'drop-shadow(0 4px 6px rgba(16, 39, 42, 0.2))'
            }}
          >
            <div style={{
              background: 'rgba(251, 252, 250, 0.95)',
              border: '1.5px solid var(--text-main)',
              borderRadius: '16px',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(16, 39, 42, 0.1)'
            }}>
              <Compass size={11} color="var(--primary-accent)" />
              <span style={{ color: 'var(--text-main)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                পিলার #৪৫
              </span>
            </div>
            <div style={{ width: '1.5px', height: '14px', background: 'var(--text-main)' }} />
          </div>

          {/* Marker 3: Khatian 128 (Repositioned to Northeast survey corner away from information card) */}
          <div 
            onClick={() => setActiveMarker('khatian128')}
            style={{
              position: 'absolute',
              top: '24px',
              right: '38px',
              transform: 'translateZ(30px) rotateZ(32deg) rotateX(-54deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 12,
              filter: 'drop-shadow(0 4px 6px rgba(16, 39, 42, 0.2))'
            }}
          >
            <div style={{
              background: 'rgba(251, 252, 250, 0.95)',
              border: '1.5px solid var(--line)',
              borderRadius: '16px',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(16, 39, 42, 0.1)'
            }}>
              <Layers size={11} color="var(--primary-accent)" />
              <span style={{ color: 'var(--text-main)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                খতিয়ান ১২৮
              </span>
            </div>
            <div style={{ width: '1.5px', height: '14px', background: 'var(--line)' }} />
          </div>
        </div>

        {/* Floating Glassmorphic Document Card (Positioned to the right with comfortable clearance, fully legible) */}
        <div 
          className="floating-glass-deed-card"
          style={{
            position: 'absolute',
            top: '52px',
            right: '8px',
            width: '265px',
            background: 'rgba(251, 252, 250, 0.96)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1.5px solid var(--line)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 16px 36px rgba(16, 39, 42, 0.12), 0 2px 8px rgba(16, 39, 42, 0.06)',
            zIndex: 20,
            animation: 'floatingGlassCard 5s ease-in-out infinite alternate',
            color: 'var(--text-main)'
          }}
        >
          {/* Card Top Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--line)',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                background: 'var(--accent-tint)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex'
              }}>
                <FileCheck2 size={15} color="var(--primary-accent)" />
              </div>
              <span style={{
                fontSize: '0.72rem',
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
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)'
            }}>
              DEMO
            </span>
          </div>

          {/* Sample Fields Requested by User */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                {isBn ? 'মালিক (Owner):' : 'Owner:'}
              </span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                সুলতানা জাহান
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                {isBn ? 'দাগ নং (Dag No):' : 'Dag No:'}
              </span>
              <strong style={{ color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                ৫৫৮ (558)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                {isBn ? 'জমির পরিমাণ (Area):' : 'Area:'}
              </span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                ১০ শতক (10 decimals)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                {isBn ? 'খতিয়ান (Khatian):' : 'Khatian:'}
              </span>
              <span style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                ১২৮ (Savar)
              </span>
            </div>

            {/* Status Field */}
            <div style={{
              marginTop: '4px',
              paddingTop: '8px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                {isBn ? 'স্থিতি (Status):' : 'Status:'}
              </span>
              <span style={{
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                color: 'var(--status-matched-text)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={12} color="var(--status-matched-text)" />
                <span>{isBn ? 'যাচাইকৃত রেকর্ড' : 'Verified Demo Record'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Micro Floating Badge: AI Confidence & Chain Continuity (Northwest boundary) */}
        <div 
          className="floating-continuity-badge"
          style={{
            position: 'absolute',
            top: '16px',
            left: '14px',
            background: 'rgba(251, 252, 250, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(16, 39, 42, 0.08)',
            zIndex: 25,
            animation: 'floatingMiniBadge 6s ease-in-out infinite alternate 1s'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--status-matched-text)',
            boxShadow: '0 0 8px var(--status-matched-text)'
          }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              CHAIN CONTINUITY
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 700 }}>
              {isBn ? 'ধারাবাহিকতা অক্ষুণ্ণ' : '100% Sequential Title'}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded CSS Animations & Responsive Media Queries */}
      <style>{`
        @keyframes floatingParcel {
          0% {
            transform: rotateX(54deg) rotateZ(-32deg) translateY(0px);
          }
          100% {
            transform: rotateX(52deg) rotateZ(-31deg) translateY(-14px);
          }
        }

        @keyframes floatingGlassCard {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-10px) rotate(-1deg);
          }
        }

        @keyframes floatingGlassCardMobile {
          0% {
            transform: translateX(-50%) translateY(0px);
          }
          100% {
            transform: translateX(-50%) translateY(-8px);
          }
        }

        @keyframes floatingMiniBadge {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-8px);
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
          .parcel-3d-scene,
          .floating-continuity-badge {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Tablet / Medium viewports (769px to 1024px) */
        @media (max-width: 1024px) and (min-width: 769px) {
          .parcel-3d-visual-wrapper {
            max-width: 600px !important;
            min-height: 430px !important;
          }
          .parcel-isometric-slab {
            left: 14px !important;
            top: 90px !important;
          }
          .floating-glass-deed-card {
            right: 4px !important;
            top: 48px !important;
          }
        }

        /* Mobile Viewports (<= 768px): Vertical Stack to Guarantee Zero Overlap */
        @media (max-width: 768px) {
          .parcel-3d-visual-wrapper {
            min-height: auto !important;
            max-width: 100% !important;
            perspective: none !important;
            padding: 10px 0 20px !important;
          }
          .parcel-3d-scene {
            height: auto !important;
            min-height: 520px !important;
            position: relative !important;
            width: 100% !important;
          }
          .parcel-ground-shadow {
            left: 50% !important;
            margin-left: -140px !important;
            top: 150px !important;
            width: 280px !important;
            height: 100px !important;
          }
          .parcel-isometric-slab {
            left: 50% !important;
            margin-left: -135px !important;
            top: 35px !important;
            width: 270px !important;
            height: 195px !important;
            transform: scale(0.85) rotateX(54deg) rotateZ(-32deg) !important;
          }
          .floating-glass-deed-card {
            left: 50% !important;
            right: auto !important;
            top: 245px !important;
            transform: translateX(-50%) !important;
            width: calc(100% - 32px) !important;
            max-width: 320px !important;
            animation: floatingGlassCardMobile 5s ease-in-out infinite alternate !important;
          }
          .floating-continuity-badge {
            top: 8px !important;
            left: 12px !important;
            transform: scale(0.88) !important;
            transform-origin: left top !important;
          }
        }

        /* Small Mobile Devices (<= 420px) */
        @media (max-width: 420px) {
          .parcel-3d-scene {
            min-height: 485px !important;
          }
          .parcel-ground-shadow {
            top: 130px !important;
            width: 240px !important;
            margin-left: -120px !important;
          }
          .parcel-isometric-slab {
            top: 25px !important;
            margin-left: -125px !important;
            width: 250px !important;
            height: 180px !important;
            transform: scale(0.76) rotateX(54deg) rotateZ(-32deg) !important;
          }
          .floating-glass-deed-card {
            top: 215px !important;
            max-width: 300px !important;
            padding: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}
