import React from 'react';
import LandingHero from '../components/LandingHero';
import WorkflowSection from '../components/WorkflowSection';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import DemoCtaSection from '../components/DemoCtaSection';
import PassportPreviewSection from '../components/PassportPreviewSection';
import ComparisonPreviewSection from '../components/ComparisonPreviewSection';
import IntegrityPreviewSection from '../components/IntegrityPreviewSection';
import GuardianPreviewSection from '../components/GuardianPreviewSection';
import ScopeSection from '../components/ScopeSection';
import LandPricePreviewSection from '../components/LandPricePreviewSection';
import FinalCtaSection from '../components/FinalCtaSection';
import LandingFooter from '../components/LandingFooter';

export default function LandingPage({
  lang = 'bn',
  t,
  onStartScanning,
  onStartCompare,
  onViewPassport,
  onViewIntegrity,
  onViewHistory,
  onViewLandPrice,
  onViewGuardian
}) {
  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-root" style={{ width: '100%', overflowX: 'hidden' }}>
      {/* A. Hero Section with Headline, Supporting Text, CTAs, and Interactive 3D Land Parcel Visual */}
      <LandingHero
        lang={lang}
        onStartScanning={onStartScanning}
        onViewPassport={onViewPassport}
        onViewGuardian={onViewGuardian}
        onHowItWorks={() => handleScrollToSection('how-it-works')}
      />

      {/* B. How It Works: 4 Transparent Steps */}
      <WorkflowSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* C. Core Features: 6 Prominent Capabilities */}
      <CoreFeaturesSection
        lang={lang}
        onStartScanning={onStartScanning}
        onViewHistory={onViewHistory || onStartScanning}
        onViewPassport={onViewPassport}
        onViewLandPrice={onViewLandPrice}
      />

      {/* D. Live Synthetic Scenario Demo Section */}
      <DemoCtaSection
        lang={lang}
        onStartScanning={onStartScanning}
        onStartCompare={onStartCompare}
      />

      {/* Plot Passport Preview */}
      <PassportPreviewSection
        lang={lang}
        onViewPassport={onViewPassport}
      />

      {/* Record Comparison & Conflict Inspection Example */}
      <ComparisonPreviewSection
        lang={lang}
        onStartCompare={onStartCompare}
      />

      {/* Rural Land Price Intelligence Preview */}
      <LandPricePreviewSection
        lang={lang}
        onViewLandPrice={onViewLandPrice}
      />

      {/* QR & Integrity Verification Explanation */}
      <IntegrityPreviewSection
        lang={lang}
        onViewIntegrity={onViewIntegrity}
      />

      {/* Citizen Land Guardian Simulated Alert Preview */}
      <GuardianPreviewSection
        lang={lang}
        onViewGuardian={onViewGuardian}
      />

      {/* E. Trust and Disclaimer: Scope & Boundaries */}
      <ScopeSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* Final Call to Action */}
      <FinalCtaSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* Footer */}
      <LandingFooter
        lang={lang}
      />
    </div>
  );
}
