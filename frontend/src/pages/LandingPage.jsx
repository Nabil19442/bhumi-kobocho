import React from 'react';
import LandingHero from '../components/LandingHero';
import WorkflowSection from '../components/WorkflowSection';
import GuardianPreviewSection from '../components/GuardianPreviewSection';
import FinalCtaSection from '../components/FinalCtaSection';
import LandingFooter from '../components/LandingFooter';

/**
 * LandingPage
 * 
 * DESIGN CONCEPT: "The Living Land Map"
 * An intelligent digital land-record system:
 * 1. Immersive Split-Layout Hero: Editorial typography + The Living Land Map
 * 2. Connected Horizontal Land Verification Process: Upload → Extract → Cross-check → Report
 * 3. Distinctive Ownership-Conflict Investigation Panel (Land Guardian)
 * 4. Refined Closing Call-to-Action
 * 5. Cadastral Footer
 */
export default function LandingPage({
  lang = 'bn',
  t,
  onStartScanning,
  onStartCompare,
  onViewPassport,
  onViewIntegrity,
  onViewHistory,
  onViewLandPrice,
  onViewGuardian,
  onViewReports
}) {
  return (
    <div 
      className="landing-page-root" 
      style={{ 
        width: '100%', 
        overflowX: 'hidden', 
        background: 'var(--bg-primary)',
        color: 'var(--text-main)'
      }}
    >
      {/* 1. Hero Section: "The Living Land Map" & Editorial Split Layout */}
      <LandingHero
        lang={lang}
        onStartScanning={onStartScanning}
        onViewPassport={onViewPassport}
        onViewGuardian={onViewGuardian}
        onViewReports={onViewReports || onViewPassport}
      />

      {/* 2. Horizontal Connected Land Verification Process (Document Upload → AI Extraction → Cross-check → Report) */}
      <WorkflowSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* 3. Distinctive Ownership-Conflict Investigation Panel (Land Guardian) */}
      <GuardianPreviewSection
        lang={lang}
        onViewGuardian={onViewGuardian}
      />

      {/* 4. Refined Editorial Closing Action */}
      <FinalCtaSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* 5. Cadastral Footer */}
      <LandingFooter
        lang={lang}
      />
    </div>
  );
}
