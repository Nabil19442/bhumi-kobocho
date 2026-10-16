import React, { useState } from 'react';
import LandingHeader from './components/LandingHeader';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ScannerPage from './pages/ScannerPage';
import ComparePage from './pages/ComparePage';
import PassportPage from './pages/PassportPage';
import IntegrityPage from './pages/IntegrityPage';
import GuardianPage from './pages/GuardianPage';

import bnTranslations from './i18n/bn.json';
import enTranslations from './i18n/en.json';

export default function App() {
  const [lang, setLang] = useState('bn');
  const [activeTab, setActiveTab] = useState('landing');
  const [sharedExtractedData, setSharedExtractedData] = useState(null);
  const [selectedPlotId, setSelectedPlotId] = useState('rec-demo-001');
  const [latestComparisonResult, setLatestComparisonResult] = useState(null);

  const t = lang === 'bn' ? bnTranslations : enTranslations;

  const handleProceedToCompare = (extractedData) => {
    setSharedExtractedData(extractedData);
    setActiveTab('compare');
  };

  const handleViewPassport = (plotId, comparisonResult = null) => {
    setSelectedPlotId(plotId);
    if (comparisonResult) {
      setLatestComparisonResult(comparisonResult);
    }
    setActiveTab('passport');
  };

  const handleNavigateSection = (sec) => {
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        scrollToSection(sec);
      }, 100);
    } else {
      scrollToSection(sec);
    }
  };

  const scrollToSection = (sec) => {
    if (sec === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sec === 'how-it-works') {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'passport') {
      const el = document.getElementById('passport-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'guardian') {
      const el = document.getElementById('guardian-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'boundaries') {
      const el = document.getElementById('audit-scope');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Landing View Header or App Header */}
      {activeTab === 'landing' ? (
        <LandingHeader
          lang={lang}
          setLang={setLang}
          activeTab={activeTab}
          onLaunchApp={(tab = 'scanner') => setActiveTab(tab)}
          onNavigateSection={handleNavigateSection}
        />
      ) : (
        <>
          <Header lang={lang} setLang={setLang} t={t} onReturnToLanding={() => setActiveTab('landing')} />
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
        </>
      )}

      {/* Active View / Main Area */}
      <main id="main-content" tabIndex="-1" style={{ flex: 1 }}>
        {activeTab === 'landing' && (
          <LandingPage
            lang={lang}
            t={t}
            onStartScanning={() => setActiveTab('scanner')}
            onStartCompare={() => setActiveTab('compare')}
            onViewPassport={(id) => handleViewPassport(id || 'rec-demo-001')}
            onViewIntegrity={() => setActiveTab('integrity')}
            onViewGuardian={() => setActiveTab('guardian')}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerPage
            t={t}
            lang={lang}
            setSharedExtractedData={setSharedExtractedData}
            onProceedToCompare={handleProceedToCompare}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePage
            t={t}
            lang={lang}
            sharedExtractedData={sharedExtractedData}
            onViewPassport={handleViewPassport}
            onComparisonUpdated={setLatestComparisonResult}
          />
        )}

        {activeTab === 'passport' && (
          <PassportPage
            t={t}
            lang={lang}
            selectedPlotId={selectedPlotId}
            sharedExtractedData={sharedExtractedData}
            comparisonResult={latestComparisonResult}
          />
        )}

        {activeTab === 'integrity' && (
          <IntegrityPage
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'guardian' && (
          <GuardianPage
            t={t}
            lang={lang}
          />
        )}
      </main>

      {/* Accessible Cadastral Footer for App Pages */}
      {activeTab !== 'landing' && (
        <footer className="app-footer" style={{
          background: 'var(--dark-band)',
          color: '#EAF0E8',
          padding: '24px 20px',
          textAlign: 'center',
          borderTop: '2px solid var(--text-main)',
          fontSize: '0.84rem'
        }}>
          <div className="landing-container">
            <p style={{ fontWeight: 700, color: '#FDE68A', letterSpacing: '0.3px', marginBottom: '6px' }}>
              {t.demo_banner}
            </p>
            <p style={{ color: '#BACEC7', marginBottom: '4px' }}>
              Bhumi Kobocho (ভূমি কবচ) &bull; Citizen Land Record Intelligence &bull; Team ZENOX &bull; LandTech Innovation Hackathon 2026
            </p>
            <p style={{ fontSize: '0.75rem', color: '#8BA59E' }}>
              Rules decide; AI explains. All names, deeds, khatians, and dags are generated dummy data for demonstration only.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
