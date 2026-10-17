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
        maxWidth: '560px',
        margin: '0 auto',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none'
      }}
    >
      {/* Ambient background glow behind 3D visual */}
      <div style={{
        position: 'absolute',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(39, 66, 160, 0.08) 45%, transparent 70%)',
        filter: 'blur(36px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* 3D Floating Scene Container */}
      <div 
        className="parcel-3d-scene"
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          zIndex: 1
        }}
      >
        {/* Soft Ground Contact Shadow */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          width: '360px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(3, 18, 20, 0.45) 0%, rgba(3, 18, 20, 0.15) 50%, transparent 75%)',
          filter: 'blur(16px)',
          transform: 'rotateX(60deg)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Isometric 3D Land Parcel Base */}
        <div 
          className="parcel-isometric-slab"
          style={{
            position: 'relative',
            width: '330px',
            height: '240px',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(54deg) rotateZ(-32deg)',
            animation: 'floatingParcel 6s ease-in-out infinite alternate',
            zIndex: 1
          }}
        >
          {/* Layer 1: Bottom Bedrock / Geological Strata Side Face (Left) */}
          <div style={{
            position: 'absolute',
            bottom: '-28px',
            left: 0,
            width: '100%',
            height: '28px',
            background: 'linear-gradient(180deg, #153B3E 0%, #0B2426 60%, #061718 100%)',
            transformOrigin: 'bottom',
            transform: 'rotateX(90deg)',
            borderBottom: '2px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            zIndex: 1
          }}>
            {/* Strata layer lines */}
            <div style={{
              width: '100%',
              height: '8px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(0,0,0,0.3)',
              marginTop: '6px',
              background: 'rgba(20, 50, 52, 0.5)'
            }} />
          </div>

          {/* Layer 2: Extruded Soil Layer Side Face (Right) */}
          <div style={{
            position: 'absolute',
            right: '-28px',
            top: 0,
            width: '28px',
            height: '100%',
            background: 'linear-gradient(90deg, #1A464A 0%, #0F2D30 50%, #081D1F 100%)',
            transformOrigin: 'right',
            transform: 'rotateY(90deg)',
            zIndex: 1
          }}>
            {/* Soil texture lines */}
            <div style={{
              height: '100%',
              width: '10px',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              borderRight: '1px solid rgba(0,0,0,0.3)',
              marginLeft: '6px'
            }} />
          </div>

          {/* Layer 3: Top Cadastral Terrain Surface */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1B4E4F 0%, #153F40 45%, #0F3334 100%)',
              border: '2px solid #2ED573',
              borderRadius: '8px',
              boxShadow: 'inset 0 0 35px rgba(16, 185, 129, 0.25), 0 0 15px rgba(16, 185, 129, 0.2)',
              overflow: 'hidden',
              zIndex: 2
            }}
          >
            {/* Topographic Contour Map Pattern & Cadastral Grid */}
            <svg 
              width="100%" 
              height="100%" 
              style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="cadastralGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(167, 243, 208, 0.22)" strokeWidth="0.8" />
                </pattern>
                <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="20%" stopColor="rgba(52, 211, 153, 0.2)" />
                  <stop offset="50%" stopColor="#34D399" />
                  <stop offset="80%" stopColor="rgba(52, 211, 153, 0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#cadastralGrid)" />

              {/* Contour elevation curves */}
              <path d="M -20,60 Q 90,20 180,75 T 350,90" fill="none" stroke="rgba(209, 250, 229, 0.28)" strokeWidth="1.2" />
              <path d="M -20,110 Q 120,70 200,125 T 350,140" fill="none" stroke="rgba(209, 250, 229, 0.28)" strokeWidth="1.2" />
              <path d="M -20,160 Q 140,130 220,185 T 350,190" fill="none" stroke="rgba(209, 250, 229, 0.22)" strokeWidth="1.2" />
              <path d="M 40,-10 Q 110,90 140,250" fill="none" stroke="rgba(209, 250, 229, 0.18)" strokeWidth="1" strokeDasharray="3,3" />
              <path d="M 230,-10 Q 240,110 260,250" fill="none" stroke="rgba(209, 250, 229, 0.18)" strokeWidth="1" strokeDasharray="3,3" />

              {/* Sub-Plot Divisions (Adjacent Dags 557 & 559) */}
              <polygon points="15,20 120,15 110,120 10,105" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(167, 243, 208, 0.35)" strokeWidth="1" strokeDasharray="4,4" />
              <text x="45" y="65" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">দাগ ৫৫৭</text>

              <polygon points="210,125 315,120 310,225 205,215" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(167, 243, 208, 0.35)" strokeWidth="1" strokeDasharray="4,4" />
              <text x="245" y="175" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">দাগ ৫৫৯</text>

              {/* Primary Active Plot: DAG 558 */}
              <polygon 
                points="125,50 255,40 245,175 115,160" 
                fill="rgba(16, 185, 129, 0.22)" 
                stroke="#10B981" 
                strokeWidth="2.2" 
              />
              <text x="160" y="105" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="sans-serif">দাগ ৫৫৮</text>
              <text x="162" y="122" fill="#6EE7B7" fontSize="10" fontWeight="600" fontFamily="monospace">১০.০ শতক</text>
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
                background: 'linear-gradient(90deg, transparent 0%, rgba(52, 211, 153, 0.2) 20%, #34D399 50%, rgba(52, 211, 153, 0.2) 80%, transparent 100%)',
                boxShadow: '0 0 16px 3px #10B981, 0 0 6px 1px #34D399',
                animation: 'terrainScanSweep 4.5s ease-in-out infinite alternate',
                zIndex: 4,
                pointerEvents: 'none'
              }}
            />

            {/* Verification status pulse aura on Dag 558 */}
            <div style={{
              position: 'absolute',
              top: '50px',
              left: '125px',
              width: '125px',
              height: '115px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'verifiedPulse 2.5s ease-in-out infinite'
            }} />
          </div>

          {/* 3D Billboards: Floating Land Record Markers standing upright above terrain */}
          {/* Marker 1: Primary Dag 558 Pin */}
          <div 
            onClick={() => setActiveMarker('dag558')}
            style={{
              position: 'absolute',
              top: '75px',
              left: '175px',
              transform: 'translateZ(45px) rotateZ(32deg) rotateX(-54deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 10,
              filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.45))',
              transition: 'transform 0.3s ease'
            }}
          >
            <div style={{
              background: '#047857',
              border: '1.5px solid #6EE7B7',
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(4, 120, 87, 0.5)',
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#34D399',
                boxShadow: '0 0 8px 2px #34D399'
              }} />
              <strong style={{ color: '#FFFFFF', fontSize: '0.78rem', fontFamily: 'var(--font-heading)' }}>
                দাগ ৫৫৮ • ১০ শতক
              </strong>
            </div>
            {/* Pin pointer leg */}
            <div style={{
              width: '2px',
              height: '18px',
              background: 'linear-gradient(180deg, #6EE7B7 0%, transparent 100%)'
            }} />
          </div>

          {/* Marker 2: Cadastral Survey Boundary Pillar */}
          <div 
            onClick={() => setActiveMarker('pillar45')}
            style={{
              position: 'absolute',
              top: '25px',
              left: '30px',
              transform: 'translateZ(30px) rotateZ(32deg) rotateX(-54deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 9,
              filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))'
            }}
          >
            <div style={{
              background: 'rgba(15, 34, 38, 0.92)',
              border: '1px solid rgba(167, 243, 208, 0.4)',
              borderRadius: '16px',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}>
              <Compass size={11} color="#6EE7B7" />
              <span style={{ color: '#E2E8F0', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                পিলার #৪৫
              </span>
            </div>
            <div style={{ width: '1.5px', height: '14px', background: 'rgba(167, 243, 208, 0.4)' }} />
          </div>

          {/* Marker 3: Khatian 128 Mutation Inscription */}
          <div 
            onClick={() => setActiveMarker('khatian128')}
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '35px',
              transform: 'translateZ(30px) rotateZ(32deg) rotateX(-54deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 9,
              filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))'
            }}
          >
            <div style={{
              background: 'rgba(15, 34, 38, 0.92)',
              border: '1px solid rgba(196, 214, 245, 0.4)',
              borderRadius: '16px',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}>
              <Layers size={11} color="#93C5FD" />
              <span style={{ color: '#E2E8F0', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                খতিয়ান ১২৮
              </span>
            </div>
            <div style={{ width: '1.5px', height: '14px', background: 'rgba(196, 214, 245, 0.4)' }} />
          </div>
        </div>

        {/* Floating Glassmorphic Document Card */}
        <div 
          className="floating-glass-deed-card"
          style={{
            position: 'absolute',
            bottom: '18px',
            right: '-10px',
            width: '270px',
            background: 'rgba(10, 28, 30, 0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1.5px solid rgba(52, 211, 153, 0.35)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            zIndex: 15,
            animation: 'floatingGlassCard 5s ease-in-out infinite alternate',
            color: '#FFFFFF'
          }}
        >
          {/* Card Top Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex'
              }}>
                <FileCheck2 size={15} color="#34D399" />
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: '#A7F3D0',
                letterSpacing: '0.4px',
                fontWeight: 700
              }}>
                {isBn ? 'দলিল যাচাই রেকর্ড' : 'VERIFIED DEED'}
              </span>
            </div>

            <span style={{
              background: '#047857',
              color: '#FFFFFF',
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
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.76rem' }}>
                {isBn ? 'মালিক (Owner):' : 'Owner:'}
              </span>
              <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
                সুলতানা জাহান
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.76rem' }}>
                {isBn ? 'দাগ নং (Dag No):' : 'Dag No:'}
              </span>
              <strong style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                ৫৫৮ (558)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.76rem' }}>
                {isBn ? 'জমির পরিমাণ (Area):' : 'Area:'}
              </span>
              <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                ১০ শতক (10 decimals)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.76rem' }}>
                {isBn ? 'খতিয়ান (Khatian):' : 'Khatian:'}
              </span>
              <span style={{ color: '#CBD5E1', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                ১২৮ (Savar)
              </span>
            </div>

            {/* Status Field */}
            <div style={{
              marginTop: '4px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.74rem' }}>
                {isBn ? 'স্থিতি (Status):' : 'Status:'}
              </span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid #10B981',
                color: '#6EE7B7',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={12} color="#34D399" />
                <span>{isBn ? 'যাচাইকৃত রেকর্ড' : 'Verified Demo Record'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Micro Floating Badge: AI Confidence & Chain Continuity */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '-6px',
          background: 'rgba(13, 43, 46, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 14,
          animation: 'floatingMiniBadge 6s ease-in-out infinite alternate 1s'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 10px #10B981'
          }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
              CHAIN CONTINUITY
            </span>
            <span style={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 700 }}>
              {isBn ? 'ধারাবাহিকতা অক্ষুণ্ণ' : '100% Sequential Title'}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded CSS Animations */}
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
          .parcel-3d-scene {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (max-width: 768px) {
          .parcel-3d-visual-wrapper {
            min-height: 360px;
            transform: scale(0.85);
          }
          .floating-glass-deed-card {
            width: 240px;
            right: 0px;
            bottom: 0px;
          }
        }

        @media (max-width: 480px) {
          .parcel-3d-visual-wrapper {
            min-height: 310px;
            transform: scale(0.75);
            margin: -20px auto;
          }
        }
      `}</style>
    </div>
  );
}
