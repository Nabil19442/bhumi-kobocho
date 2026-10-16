import React from 'react';
import LandingHero from '../components/LandingHero';
import WorkflowSection from '../components/WorkflowSection';
import PassportPreviewSection from '../components/PassportPreviewSection';
import ComparisonPreviewSection from '../components/ComparisonPreviewSection';
import GuardianPreviewSection from '../components/GuardianPreviewSection';
import IntegrityPreviewSection from '../components/IntegrityPreviewSection';
import ScopeSection from '../components/ScopeSection';
import FinalCtaSection from '../components/FinalCtaSection';
import LandingFooter from '../components/LandingFooter';

export default function LandingPage({
  lang = 'bn',
  t,
  onStartScanning,
  onStartCompare,
  onViewPassport,
  onViewIntegrity,
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
      {/* 3. Hero with 3D land illustration */}
      <LandingHero
        lang={lang}
        onStartScanning={onStartScanning}
        onViewPassport={onViewPassport}
        onHowItWorks={() => handleScrollToSection('how-it-works')}
      />

      {/* 4. "কীভাবে কাজ করে" — four simple steps */}
      <WorkflowSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* 5. Plot Passport preview */}
      <PassportPreviewSection
        lang={lang}
        onViewPassport={onViewPassport}
      />

      {/* 6. Record comparison example */}
      <ComparisonPreviewSection
        lang={lang}
        onStartCompare={onStartCompare}
      />

      {/* 7. Land Guardian simulated alert example */}
      <GuardianPreviewSection
        lang={lang}
        onViewGuardian={onViewGuardian}
      />

      {/* 8. QR and file integrity explanation */}
      <IntegrityPreviewSection
        lang={lang}
        onViewIntegrity={onViewIntegrity}
      />

      {/* 9. "কী যাচাই হয়, কী হয় না" (Scope & Boundaries) */}
      <ScopeSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* 10. Final Call to Action */}
      <FinalCtaSection
        lang={lang}
        onStartScanning={onStartScanning}
      />

      {/* 11. Footer with ZENOX and hackathon information */}
      <LandingFooter
        lang={lang}
      />
    </div>
  );
}
