import React, { useState, Suspense, lazy } from 'react';
import LandingHeader from './components/LandingHeader';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import Navigation from './components/Navigation';

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const ScannerPage = lazy(() => import('./pages/ScannerPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const PassportPage = lazy(() => import('./pages/PassportPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const GuardianPage = lazy(() => import('./pages/GuardianPage'));
const IntegrityPage = lazy(() => import('./pages/IntegrityPage'));
const GraphPage = lazy(() => import('./pages/GraphPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const LandPricePage = lazy(() => import('./pages/LandPricePage'));

import bnTranslations from './i18n/bn.json';
import enTranslations from './i18n/en.json';

export default function App() {
  const [lang, setLang] = useState('bn');
  const [activeTab, setActiveTab] = useState('landing');
  const [sharedExtractedData, setSharedExtractedData] = useState(null);
  const [selectedPlotId, setSelectedPlotId] = useState('rec-demo-001');
  const [verifyRecordId, setVerifyRecordId] = useState(null);
  const [latestComparisonResult, setLatestComparisonResult] = useState(null);

  const t = lang === 'bn' ? bnTranslations : enTranslations;

  React.useEffect(() => {
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/verify\/([a-zA-Z0-9_-]+)/);
    const searchParams = new URLSearchParams(window.location.search);
    const queryVerify = searchParams.get('verify') || searchParams.get('record_id');

    if (match) {
      setVerifyRecordId(match[1]);
      setSelectedPlotId(match[1]);
      setActiveTab('verify');
    } else if (queryVerify) {
      setVerifyRecordId(queryVerify);
      setSelectedPlotId(queryVerify);
      setActiveTab('verify');
    }

    const handlePopState = () => {
      const p = window.location.pathname;
      const m = p.match(/^\/verify\/([a-zA-Z0-9_-]+)/);
      if (m) {
        setVerifyRecordId(m[1]);
        setActiveTab('verify');
      } else if (p === '/' || p === '') {
        setActiveTab('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const handleViewGraph = (plotId) => {
    if (plotId) {
      setSelectedPlotId(plotId);
    }
    setActiveTab('graph');
  };

  const handleOpenVerification = (recordId) => {
    const id = recordId || selectedPlotId;
    setVerifyRecordId(id);
    setSelectedPlotId(id);
    setActiveTab('verify');
    window.history.pushState(null, '', `/verify/${id}`);
  };

  const handleReturnFromVerification = () => {
    setActiveTab('integrity');
    window.history.pushState(null, '', '/');
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
    } else if (sec === 'guardian' || sec === 'guardian-preview') {
      const el = document.getElementById('guardian-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'boundaries' || sec === 'limitations' || sec === 'scope') {
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
        <Suspense fallback={
          <div style={{
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--text-muted, #64748B)',
            fontSize: '0.94rem',
            fontFamily: 'var(--font-body, system-ui, sans-serif)'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main, #1E293B)' }}>লোড হচ্ছে...</span> / Loading...
          </div>
        }>
          {activeTab === 'landing' && (
            <LandingPage
              lang={lang}
              t={t}
              onStartScanning={() => setActiveTab('scanner')}
              onStartCompare={() => setActiveTab('compare')}
              onViewHistory={() => setActiveTab('history')}
              onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-GUL-015-0550')}
              onViewIntegrity={() => setActiveTab('integrity')}
              onViewLandPrice={() => setActiveTab('landprice')}
              onViewGuardian={() => setActiveTab('guardian')}
              onViewReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewPage
              t={t}
              lang={lang}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'scanner' && (
            <ScannerPage
              t={t}
              lang={lang}
              setSharedExtractedData={setSharedExtractedData}
              onProceedToCompare={handleProceedToCompare}
              onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-GUL-015-0550')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              t={t}
              lang={lang}
              onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-GUL-015-0550')}
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
              onViewGraph={handleViewGraph}
            />
          )}

          {activeTab === 'guardian' && (
            <GuardianPage
              t={t}
              lang={lang}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              t={t}
              lang={lang}
              onStartScanning={() => setActiveTab('scanner')}
              onNavigate={(tab) => setActiveTab(tab)}
              onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-GUL-015-0550')}
            />
          )}

          {activeTab === 'graph' && (
            <GraphPage
              t={t}
              lang={lang}
              initialRecordId={selectedPlotId}
              onSelectRecord={(id) => setSelectedPlotId(id)}
              onViewPassport={handleViewPassport}
            />
          )}

          {activeTab === 'integrity' && (
            <IntegrityPage
              t={t}
              lang={lang}
              onOpenVerification={handleOpenVerification}
            />
          )}

          {activeTab === 'verify' && (
            <VerificationPage
              recordId={verifyRecordId || selectedPlotId}
              lang={lang}
              onBackToApp={handleReturnFromVerification}
              onViewPassport={handleViewPassport}
              onViewGraph={handleViewGraph}
            />
          )}

          {activeTab === 'landprice' && (
            <LandPricePage
              t={t}
              lang={lang}
            />
          )}
        </Suspense>
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
