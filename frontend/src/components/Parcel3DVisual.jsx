import React, { useState } from 'react';
import { 
  ArrowRight, 
  Compass, 
  Layers, 
  User,
  Plus,
  Minus,
  Crosshair,
  CheckCircle2
} from 'lucide-react';

/**
 * Cadastral3DView (Parcel3DVisual)
 * 
 * Interactive 3D Cadastral Map Experience for Bhumi Kobocho:
 * - Elevated isometric 3D camera angle with realistic agricultural land parcels
 * - Truly interactive parcels (Dag 555, 557, 558, 559, 560)
 * - Map clicks and bottom navigation share the exact same `selectedDag` state
 * - Floating translucent annotation overlay with connector lines updating dynamically
 * - Map controls: Zoom In (+), Zoom Out (-), Reset Camera (⌖)
 * - Bottom parcel navigation strip with active states and "সম্পূর্ণ প্রতিবেদন দেখুন →" CTA
 */
export default function Parcel3DVisual({ 
  lang = 'bn', 
  onStartScanning, 
  onViewPassport, 
  onViewReports 
}) {
  const isBn = lang === 'bn';
  const [selectedDag, setSelectedDag] = useState('558');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Parcel database with authentic cadastral geometry, vertex coordinates, and record attributes
  // All 5 plots (558, 555, 560, 557, 559) are fully mapped with precise coordinates
  const parcels = {
    '558': {
      id: '558',
      dagNo: '৫৫৮',
      dagNoEn: '558',
      area: isBn ? '১০.০ শতক' : '10.0 Decimal',
      owner: isBn ? 'সুলতানা জাহান' : 'Sultana Jahan',
      khatian: isBn ? '১২৮ (RS/BS)' : '128 (RS/BS)',
      mouza: isBn ? 'সাভার মৌজা, JL-৪৫' : 'Savar Mouza, JL-45',
      statusText: isBn ? 'যাচাইকৃত রেকর্ড • মিল পাওয়া গেছে' : 'Verified Record • Matched',
      statusType: 'matched',
      // SVG polygon points in 620x360 space
      polyPoints: '210,108 360,98 348,228 195,238',
      center: { x: 278, y: 168 },
      vertexPin: { x: 360, y: 98 },
      tagPos: { x: 278, y: 168 },
      hasExternalTag: false,
      vertices: [
        { x: 210, y: 108, label: 'A1' },
        { x: 360, y: 98, label: 'A2' },
        { x: 348, y: 228, label: 'A3' },
        { x: 195, y: 238, label: 'A4' }
      ]
    },
    '555': {
      id: '555',
      dagNo: '৫৫৫',
      dagNoEn: '555',
      area: isBn ? '১২.০ শতক' : '12.0 Decimal',
      owner: isBn ? 'মোঃ আব্দুল হামিদ' : 'Md. Abdul Hamid',
      khatian: isBn ? '১২৪ (RS)' : '124 (RS)',
      mouza: isBn ? 'সাভার মৌজা, JL-৪৫' : 'Savar Mouza, JL-45',
      statusText: isBn ? 'যাচাইকৃত রেকর্ড • একক মালিকানা' : 'Verified Record • Clean Title',
      statusType: 'matched',
      polyPoints: '195,238 348,228 335,302 182,312',
      center: { x: 265, y: 270 },
      vertexPin: { x: 348, y: 228 },
      tagPos: { x: 410, y: 285 },
      tagAnchor: { x: 342, y: 265 },
      hasExternalTag: true,
      vertices: [
        { x: 195, y: 238, label: 'B1' },
        { x: 348, y: 228, label: 'B2' },
        { x: 335, y: 302, label: 'B3' },
        { x: 182, y: 312, label: 'B4' }
      ]
    },
    '560': {
      id: '560',
      dagNo: '৫৬০',
      dagNoEn: '560',
      area: isBn ? '৮.৫ শতক' : '8.5 Decimal',
      owner: isBn ? 'মোঃ নাসরিন আক্তার' : 'Md. Nasreen Akter',
      khatian: isBn ? '১২৫ (RS)' : '125 (RS)',
      mouza: isBn ? 'সাভার মৌজা, JL-৪৫' : 'Savar Mouza, JL-45',
      statusText: isBn ? 'যাচাইকৃত রেকর্ড • মিল পাওয়া গেছে' : 'Verified Record • Matched',
      statusType: 'matched',
      // Positioned below y:130 so top-right floating card never obstructs it
      polyPoints: '360,132 490,138 474,248 348,228',
      center: { x: 418, y: 188 },
      vertexPin: { x: 490, y: 138 },
      tagPos: { x: 535, y: 192 },
      tagAnchor: { x: 482, y: 192 },
      hasExternalTag: true,
      vertices: [
        { x: 360, y: 132, label: 'C1' },
        { x: 490, y: 138, label: 'C2' },
        { x: 474, y: 248, label: 'C3' },
        { x: 348, y: 228, label: 'C4' }
      ]
    },
    '557': {
      id: '557',
      dagNo: '৫৫৭',
      dagNoEn: '557',
      area: isBn ? '১৪.২ শতক' : '14.2 Decimal',
      owner: isBn ? 'মোঃ কামরুল হাসান' : 'Md. Kamrul Hasan',
      khatian: isBn ? '১২৬ (RS)' : '126 (RS)',
      mouza: isBn ? 'সাভার মৌজা, JL-৪৫' : 'Savar Mouza, JL-45',
      statusText: isBn ? 'যাচাইকৃত রেকর্ড • মিউটেশন হালনাগাদ' : 'Verified Record • Mutated',
      statusType: 'matched',
      polyPoints: '75,118 210,108 195,238 60,248',
      center: { x: 135, y: 178 },
      vertexPin: { x: 210, y: 108 },
      tagPos: { x: 32, y: 178 },
      tagAnchor: { x: 68, y: 178 },
      hasExternalTag: true,
      vertices: [
        { x: 75, y: 118, label: 'D1' },
        { x: 210, y: 108, label: 'D2' },
        { x: 195, y: 238, label: 'D3' },
        { x: 60, y: 248, label: 'D4' }
      ]
    },
    '559': {
      id: '559',
      dagNo: '৫৫৯',
      dagNoEn: '559',
      area: isBn ? '৯.০ শতক' : '9.0 Decimal',
      owner: isBn ? 'আনোয়ারা বেগম' : 'Anowara Begum',
      khatian: isBn ? '১৩০ (RS)' : '130 (RS)',
      mouza: isBn ? 'সাভার মৌজা, JL-৪৫' : 'Savar Mouza, JL-45',
      statusText: isBn ? 'যাচাইকৃত রেকর্ড • মিল পাওয়া গেছে' : 'Verified Record • Matched',
      statusType: 'matched',
      polyPoints: '170,25 380,20 360,98 210,108',
      center: { x: 280, y: 62 },
      vertexPin: { x: 360, y: 98 },
      tagPos: { x: 280, y: 62 },
      hasExternalTag: false,
      vertices: [
        { x: 170, y: 25, label: 'E1' },
        { x: 380, y: 20, label: 'E2' },
        { x: 360, y: 98, label: 'E3' },
        { x: 210, y: 108, label: 'E4' }
      ]
    }
  };

  const currentParcel = parcels[selectedDag] || parcels['558'];

  // Single shared selection handler for both map clicks and bottom navigation buttons
  const handleSelectParcel = (dagId) => {
    if (parcels[dagId]) {
      setSelectedDag(dagId);
    }
  };

  const handleOpenReport = () => {
    if (onViewReports) {
      onViewReports();
    } else if (onViewPassport) {
      onViewPassport(`PCL-DHK-SAV-045-0${currentParcel.dagNoEn}`);
    } else if (onStartScanning) {
      onStartScanning();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.15, 1.45));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.15, 0.9));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      className="cadastral-3d-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* Outer Cadastral Card Container */}
      <div 
        className="cadastral-3d-card"
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--line)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(16, 39, 42, 0.09), 0 2px 8px rgba(16, 39, 42, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* =========================================================================
            1. TOP TOOLBAR: Mouza Coordinates & North Reference
           ========================================================================= */}
        <div 
          style={{
            padding: '8px 16px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            zIndex: 3
          }}
        >
          {/* Left: Mouza & Sheet Identification */}
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

          {/* Right: Technical Drawing Metadata & North Orientation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              color: 'var(--primary-accent)',
              fontSize: '0.68rem',
              fontWeight: 700
            }}>
              <Layers size={12} color="var(--primary-accent)" />
              <span>CADASTRAL 3D VIEW</span>
            </div>
            <span style={{
              fontWeight: 800,
              color: 'var(--text-main)',
              background: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: '3px',
              border: '1px solid var(--line)',
              fontSize: '0.70rem'
            }}>
              ↑ N
            </span>
          </div>
        </div>

        {/* =========================================================================
            2. INTERACTIVE 3D CADASTRAL TERRAIN CANVAS
           ========================================================================= */}
        <div 
          className="cadastral-canvas-viewport"
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(155deg, #CFE3D3 0%, #B8D4BF 45%, #C2DCC4 100%)',
            boxSizing: 'border-box',
            minHeight: '330px'
          }}
        >
          {/* Zoomable & Scalable 3D Map Container */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              transformOrigin: 'center center'
            }}
          >
            <svg
              viewBox="0 0 620 360"
              preserveAspectRatio="xMidYMid meet"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            >
              <defs>
                {/* 3D Elevated Shadow for Selected Parcel */}
                <filter id="parcel-elevated-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0D2B2E" floodOpacity="0.36" />
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2742A0" floodOpacity="0.45" />
                </filter>

                {/* Tree Drop Shadow */}
                <filter id="tree-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0D2B2E" floodOpacity="0.25" />
                </filter>

                {/* Building Drop Shadow */}
                <filter id="house-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0D2B2E" floodOpacity="0.28" />
                </filter>

                {/* Agricultural Paddy Furrow Hatch Pattern */}
                <pattern id="crop-furrow-pattern" width="10" height="10" patternTransform="rotate(35 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(33, 70, 45, 0.14)" strokeWidth="1.2" />
                </pattern>

                {/* Dense Furrow Pattern for Variety */}
                <pattern id="dense-furrow-pattern" width="8" height="8" patternTransform="rotate(-40 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(25, 60, 38, 0.12)" strokeWidth="1" />
                </pattern>

                {/* Topo Survey Grid Pattern */}
                <pattern id="survey-topo-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(16, 39, 42, 0.04)" strokeWidth="0.8" />
                </pattern>

                {/* AI Laser Scanner Beam Gradient */}
                <linearGradient id="laser-scan-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(39, 66, 160, 0)" />
                  <stop offset="50%" stopColor="rgba(39, 66, 160, 0.9)" />
                  <stop offset="100%" stopColor="rgba(39, 66, 160, 0)" />
                </linearGradient>

                {/* Active Parcel Surface Gradient */}
                <linearGradient id="active-parcel-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(39, 66, 160, 0.35)" />
                  <stop offset="50%" stopColor="rgba(77, 123, 243, 0.22)" />
                  <stop offset="100%" stopColor="rgba(39, 66, 160, 0.40)" />
                </linearGradient>

                {/* Soft ground gradients */}
                <linearGradient id="terrain-mesh-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#81B48E" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#558C64" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Base Cadastral Topo Grid */}
              <rect width="100%" height="100%" fill="url(#survey-topo-grid)" />

              {/* Natural Agricultural Background Mesh */}
              <rect x="0" y="0" width="620" height="360" fill="url(#terrain-mesh-gradient)" />

              {/* Subtle Natural Elevation Contours */}
              <path d="M -20,60 Q 300,25 640,65" fill="none" stroke="rgba(45, 80, 55, 0.12)" strokeWidth="1" strokeDasharray="6,4" />
              <path d="M -20,165 Q 310,140 640,175" fill="none" stroke="rgba(45, 80, 55, 0.10)" strokeWidth="1" strokeDasharray="6,4" />
              <path d="M -20,270 Q 300,245 640,285" fill="none" stroke="rgba(45, 80, 55, 0.12)" strokeWidth="1" strokeDasharray="6,4" />

              {/* Surrounding Landscape: Countryside settlement buildings on the East edge */}
              <g filter="url(#house-shadow)">
                {/* Homestead 1 */}
                <polygon points="560,175 585,160 595,178 570,193" fill="#B7957A" />
                <polygon points="570,193 595,178 595,190 570,205" fill="#8C735D" />
                <polygon points="560,175 570,193 570,205 560,187" fill="#D9D1C7" />

                {/* Homestead 2 */}
                <polygon points="575,225 598,212 608,228 585,241" fill="#A88B72" />
                <polygon points="585,241 608,228 608,238 585,251" fill="#7D6551" />
                <polygon points="575,225 585,241 585,251 575,235" fill="#C4BCB1" />
              </g>

              {/* Public Access Road (মৌজা সংযোগ সড়ক / ACCESS ROAD) */}
              <g>
                <path 
                  d="M -20,328 C 180,320 380,332 640,338" 
                  fill="none" 
                  stroke="#475952" 
                  strokeWidth="20" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M -20,328 C 180,320 380,332 640,338" 
                  fill="none" 
                  stroke="#E8ECE9" 
                  strokeWidth="1.6" 
                  strokeDasharray="8,6" 
                />
                <text x="140" y="342" fill="#F4F8F5" fontSize="8.5" fontFamily="var(--font-mono)" letterSpacing="0.8px" fontWeight="600">
                  প্রবেশ সড়ক • ACCESS ROAD
                </text>
              </g>

              {/* Realistic Shaded 3D Tree Clusters around boundaries */}
              <g filter="url(#tree-shadow)">
                {/* West Boundary Forest Grove */}
                <circle cx="28" cy="75" r="14" fill="#204229" />
                <circle cx="31" cy="72" r="10" fill="#3D734C" />
                <circle cx="24" cy="140" r="16" fill="#1C3D25" />
                <circle cx="27" cy="136" r="12" fill="#4B8A5E" />
                <circle cx="20" cy="205" r="15" fill="#204229" />
                <circle cx="23" cy="201" r="11" fill="#3D734C" />
                <circle cx="26" cy="270" r="16" fill="#1C3D25" />
                <circle cx="29" cy="266" r="12" fill="#4B8A5E" />

                {/* East Boundary Trees */}
                <circle cx="538" cy="85" r="15" fill="#204229" />
                <circle cx="541" cy="81" r="11" fill="#4B8A5E" />
                <circle cx="548" cy="145" r="14" fill="#1C3D25" />
                <circle cx="551" cy="141" r="10" fill="#3D734C" />
                <circle cx="535" cy="280" r="16" fill="#204229" />
                <circle cx="538" cy="276" r="12" fill="#4B8A5E" />

                {/* Roadside Trees */}
                <circle cx="95" cy="318" r="10" fill="#204229" />
                <circle cx="97" cy="316" r="7" fill="#4B8A5E" />
                <circle cx="480" cy="328" r="11" fill="#204229" />
                <circle cx="482" cy="325" r="8" fill="#3D734C" />
              </g>

              {/* =============================================================
                  INTERACTIVE PARCEL POLYGONS (555, 557, 558, 559, 560)
                 ============================================================= */}
              
              {/* Render non-selected parcels first */}
              {['559', '557', '560', '555', '558'].map((dagKey) => {
                const p = parcels[dagKey];
                const isSelected = selectedDag === dagKey;
                if (isSelected) return null; // rendered in elevated active group below

                return (
                  <g 
                    key={dagKey}
                    id={`cadastral-plot-${dagKey}`}
                    onClick={() => handleSelectParcel(dagKey)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    className="neighbor-parcel-group"
                  >
                    {/* Plot Base Surface with Agricultural Furrow Texture */}
                    <polygon 
                      points={p.polyPoints}
                      fill="#4E875E"
                      opacity="0.88"
                    />
                    <polygon 
                      points={p.polyPoints}
                      fill="url(#crop-furrow-pattern)"
                    />
                    {/* Cadastral Boundary Line */}
                    <polygon 
                      points={p.polyPoints}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.78)"
                      strokeWidth="1.5"
                      strokeDasharray="5,4"
                      className="neighbor-boundary-stroke"
                    />

                    {/* Corner Survey vertices */}
                    {p.vertices.map((v, i) => (
                      <circle 
                        key={i} 
                        cx={v.x} 
                        cy={v.y} 
                        r="2.5" 
                        fill="rgba(255, 255, 255, 0.85)" 
                        stroke="#204229" 
                        strokeWidth="1" 
                      />
                    ))}

                    {/* Internal Watermark / Center Label */}
                    <text 
                      x={p.center.x} 
                      y={p.center.y} 
                      textAnchor="middle" 
                      fill="rgba(255, 255, 255, 0.88)" 
                      fontSize="12" 
                      fontWeight="800" 
                      fontFamily="var(--font-heading)"
                      style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
                    >
                      {isBn ? `দাগ ${p.dagNo}` : `Dag ${p.dagNoEn}`}
                    </text>

                    {/* External Leader Callout Tag matching reference image */}
                    {p.hasExternalTag && (
                      <g className="external-tag-callout">
                        {/* Thin Connector Leader Line */}
                        <line 
                          x1={p.tagAnchor.x} 
                          y1={p.tagAnchor.y} 
                          x2={p.tagPos.x} 
                          y2={p.tagPos.y} 
                          stroke="rgba(255, 255, 255, 0.85)" 
                          strokeWidth="1.2" 
                          strokeDasharray="3,2" 
                        />
                        <circle cx={p.tagAnchor.x} cy={p.tagAnchor.y} r="2.5" fill="#FFFFFF" />
                        
                        {/* Callout Pill Tag */}
                        <g transform={`translate(${p.tagPos.x}, ${p.tagPos.y})`}>
                          <rect 
                            x="-28" 
                            y="-11" 
                            width="56" 
                            height="22" 
                            rx="5" 
                            fill="rgba(251, 252, 250, 0.94)" 
                            stroke="rgba(16, 39, 42, 0.25)" 
                            strokeWidth="1" 
                            className="tag-pill-rect"
                          />
                          <text 
                            x="0" 
                            y="4" 
                            textAnchor="middle" 
                            fill="#10272A" 
                            fontSize="10" 
                            fontWeight="800" 
                            fontFamily="var(--font-heading)"
                          >
                            {isBn ? `দাগ ${p.dagNo}` : `Dag ${p.dagNoEn}`}
                          </text>
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* =============================================================
                  ELEVATED ACTIVE SELECTED PARCEL (Elevated 3D Surface & Blue Glow)
                 ============================================================= */}
              {currentParcel && (
                <g 
                  id={`active-selected-plot-${selectedDag}`}
                  filter="url(#parcel-elevated-shadow)"
                  style={{ transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                >
                  {/* Base Crop Layer */}
                  <polygon 
                    points={currentParcel.polyPoints}
                    fill="#3E6F4D"
                  />
                  <polygon 
                    points={currentParcel.polyPoints}
                    fill="url(#dense-furrow-pattern)"
                  />

                  {/* Active Elevated Blue Highlight Overlay */}
                  <polygon 
                    points={currentParcel.polyPoints}
                    fill="url(#active-parcel-fill)"
                    stroke="#2742A0"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />

                  {/* Survey Crosshair Guidelines inside selected parcel */}
                  <line 
                    x1={currentParcel.center.x} 
                    y1={currentParcel.center.y - 34} 
                    x2={currentParcel.center.x} 
                    y2={currentParcel.center.y + 34} 
                    stroke="rgba(255, 255, 255, 0.5)" 
                    strokeWidth="1" 
                    strokeDasharray="3,3" 
                  />
                  <line 
                    x1={currentParcel.center.x - 42} 
                    y1={currentParcel.center.y} 
                    x2={currentParcel.center.x + 42} 
                    y2={currentParcel.center.y} 
                    stroke="rgba(255, 255, 255, 0.5)" 
                    strokeWidth="1" 
                    strokeDasharray="3,3" 
                  />

                  {/* 4 Corner Cadastral Survey Pillars (Vertices) */}
                  {currentParcel.vertices.map((v, i) => (
                    <g key={i}>
                      <circle 
                        cx={v.x} 
                        cy={v.y} 
                        r="4.5" 
                        fill="#FFFFFF" 
                        stroke="#2742A0" 
                        strokeWidth="2.5" 
                      />
                      <circle cx={v.x} cy={v.y} r="1.5" fill="#2742A0" />
                      <text 
                        x={v.x + (v.x > currentParcel.center.x ? 6 : -18)} 
                        y={v.y + (v.y > currentParcel.center.y ? 12 : -6)} 
                        fill="#FFFFFF" 
                        fontSize="8.5" 
                        fontFamily="var(--font-mono)" 
                        fontWeight="800"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}
                      >
                        {v.label}
                      </text>
                    </g>
                  ))}

                  {/* Center Prominent Dag Badge with Pin Icon */}
                  <g transform={`translate(${currentParcel.center.x}, ${currentParcel.center.y})`}>
                    {/* Shadowed Dark Cadastral Badge */}
                    <rect 
                      x="-55" 
                      y="-22" 
                      width="110" 
                      height="44" 
                      rx="8" 
                      fill="rgba(13, 43, 46, 0.95)" 
                      stroke="#4D7BF3" 
                      strokeWidth="1.5" 
                    />
                    
                    {/* Pin Icon with animated pulse dot */}
                    <circle cx="0" cy="-30" r="8" fill="#2742A0" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="0" cy="-30" r="3" fill="#FFFFFF" />

                    {/* Prominent Dag Title */}
                    <text 
                      x="0" 
                      y="-3" 
                      textAnchor="middle" 
                      fill="#FFFFFF" 
                      fontSize="14" 
                      fontWeight="900" 
                      fontFamily="var(--font-heading)"
                      letterSpacing="0.4px"
                    >
                      {isBn ? `দাগ ${currentParcel.dagNo}` : `Dag ${currentParcel.dagNoEn}`}
                    </text>

                    {/* Area Subtitle */}
                    <text 
                      x="0" 
                      y="14" 
                      textAnchor="middle" 
                      fill="#E7EEFB" 
                      fontSize="10" 
                      fontWeight="700" 
                      fontFamily="var(--font-mono)"
                    >
                      {currentParcel.area}
                    </text>
                  </g>

                  {/* AI Scanner Laser Line Animation */}
                  <g className="laser-beam-sweep">
                    <line 
                      x1={currentParcel.center.x - 48} 
                      y1={currentParcel.center.y} 
                      x2={currentParcel.center.x + 48} 
                      y2={currentParcel.center.y} 
                      stroke="url(#laser-scan-gradient)" 
                      strokeWidth="3.5" 
                    />
                  </g>
                </g>
              )}

              {/* Dynamic Technical Leader Line from Floating Card to Parcel Pin */}
              {currentParcel && (
                <g>
                  <polyline 
                    points={`470,70 ${Math.max(currentParcel.vertexPin.x + 20, 420)},${Math.max(currentParcel.vertexPin.y - 15, 60)} ${currentParcel.vertexPin.x},${currentParcel.vertexPin.y}`}
                    fill="none"
                    stroke="#2742A0"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <circle cx={currentParcel.vertexPin.x} cy={currentParcel.vertexPin.y} r="3" fill="#2742A0" stroke="#FFFFFF" strokeWidth="1" />
                </g>
              )}
            </svg>
          </div>

          {/* =========================================================================
              FLOATING LAND RECORD ANNOTATION CARD (OVER THE MAP)
              Positioned in the open top-right area so it NEVER covers parcel boundaries
             ========================================================================= */}
          {currentParcel && (
            <div 
              className="floating-parcel-annotation-card"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '215px',
                maxWidth: 'calc(100% - 20px)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1.5px solid var(--line)',
                borderRadius: '12px',
                padding: '10px 12px',
                boxShadow: '0 8px 24px rgba(16, 39, 42, 0.12)',
                zIndex: 4,
                pointerEvents: 'auto',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Header: Owner Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#E8F0FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-accent)',
                    flexShrink: 0
                  }}
                >
                  <User size={15} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{
                    display: 'block',
                    fontSize: '0.62rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase'
                  }}>
                    {isBn ? 'মালিক (Owner)' : 'Owner'}
                  </span>
                  <strong style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-heading)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentParcel.owner}
                  </strong>
                </div>
              </div>

              {/* 2-Column Compact Specs */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  padding: '5px 0',
                  borderTop: '1px dashed var(--line)',
                  borderBottom: '1px dashed var(--line)',
                  marginBottom: '6px'
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.60rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {isBn ? 'জমির পরিমাণ' : 'Area'}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {currentParcel.area}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.60rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {isBn ? 'খতিয়ান নং' : 'Khatian'}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {currentParcel.khatian}
                  </span>
                </div>
              </div>

              {/* Verification Status Pill */}
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--status-matched-bg)',
                  border: '1px solid var(--status-matched-border)',
                  color: 'var(--status-matched-text)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  maxWidth: '100%'
                }}
              >
                <CheckCircle2 size={11} style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentParcel.statusText}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Zoom & Target Controls (Bottom-Right overlay) */}
          <div 
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              boxShadow: '0 4px 12px rgba(16, 39, 42, 0.12)',
              overflow: 'hidden',
              zIndex: 4
            }}
          >
            <button
              type="button"
              aria-label="Zoom In"
              id="map-zoom-in-btn"
              onClick={handleZoomIn}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-main)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Plus size={13} />
            </button>
            <button
              type="button"
              aria-label="Zoom Out"
              id="map-zoom-out-btn"
              onClick={handleZoomOut}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-main)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              aria-label="Reset Camera"
              id="map-zoom-reset-btn"
              onClick={handleZoomReset}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-main)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Crosshair size={13} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            3. BOTTOM PARCEL NAVIGATION STRIP
            - Adjacent dag buttons (555, 557, 558, 559, 560)
            - "সম্পূর্ণ প্রতিবেদন দেখুন →" CTA button
           ========================================================================= */}
        <div 
          className="cadastral-3d-bottom-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#FFFFFF',
            borderTop: '1px solid var(--line)',
            boxSizing: 'border-box',
            gap: '8px',
            zIndex: 3
          }}
        >
          {/* Left: Adjacent Parcels Label & Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#E8F0FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-accent)',
                flexShrink: 0
              }}
            >
              <User size={14} />
            </div>

            <div>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.15
              }}>
                {isBn ? 'পার্শ্ববর্তী দাগসমূহ' : 'Adjacent Parcels'}
              </div>
              <div style={{
                fontSize: '0.60rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.15
              }}>
                {isBn ? 'ক্লিক করে দেখুন' : 'Click to inspect'}
              </div>
            </div>
          </div>

          {/* Middle: Quick Dag Navigation Pills (555, 557, 558, 559, 560) */}
          <div 
            className="adjacent-dags-pills"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              flex: '1 1 auto',
              justifyContent: 'flex-start',
              minWidth: 0,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '2px 0'
            }}
          >
            {[
              { id: '555', labelBn: 'দাগ ৫৫৫ →', labelEn: 'Dag 555 →' },
              { id: '557', labelBn: 'দাগ ৫৫৭ →', labelEn: 'Dag 557 →' },
              { id: '558', labelBn: 'দাগ ৫৫৮ →', labelEn: 'Dag 558 →' },
              { id: '559', labelBn: 'দাগ ৫৫৯ →', labelEn: 'Dag 559 →' },
              { id: '560', labelBn: 'দাগ ৫৬০ →', labelEn: 'Dag 560 →' }
            ].map((p) => {
              const isSelected = selectedDag === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  id={`bottom-nav-dag-${p.id}-btn`}
                  onClick={() => handleSelectParcel(p.id)}
                  style={{
                    padding: '3px 6px',
                    borderRadius: '5px',
                    border: `1.5px solid ${isSelected ? 'var(--primary-accent)' : 'var(--line)'}`,
                    background: isSelected ? 'var(--accent-tint)' : '#FFFFFF',
                    color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                    fontSize: '0.66rem',
                    fontWeight: isSelected ? 800 : 600,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 1px 4px rgba(39, 66, 160, 0.18)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  {isBn ? p.labelBn : p.labelEn}
                </button>
              );
            })}
          </div>

          {/* Right: Primary CTA "সম্পূর্ণ প্রতিবেদন দেখুন →" */}
          <button
            type="button"
            id="view-full-record-report-btn"
            onClick={handleOpenReport}
            className="btn-primary"
            style={{
              height: '30px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0 10px',
              background: 'var(--primary-accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-std)',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(39, 66, 160, 0.25)',
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
            <span>{isBn ? 'সম্পূর্ণ প্রতিবেদন দেখুন' : 'View Full Report'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Laser Scanning Animation and Interactive Hover Styles */}
      <style>{`
        @keyframes laserSweepVertical {
          0% {
            transform: translateY(-24px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(0px);
            opacity: 0.95;
          }
          100% {
            transform: translateY(24px);
            opacity: 0.2;
          }
        }
        .laser-beam-sweep {
          animation: laserSweepVertical 3s ease-in-out infinite alternate;
        }

        .neighbor-parcel-group:hover polygon.neighbor-boundary-stroke {
          stroke: #2742A0 !important;
          stroke-width: 2 !important;
          stroke-dasharray: none !important;
        }

        .neighbor-parcel-group:hover .tag-pill-rect {
          fill: #E7EEFB !important;
          stroke: #2742A0 !important;
        }

        @media (max-width: 680px) {
          .cadastral-3d-bottom-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .adjacent-dags-pills {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
          }
          #view-full-record-report-btn {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
