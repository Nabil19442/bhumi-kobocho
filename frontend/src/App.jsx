import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom';
import LandingHeader from './components/LandingHeader';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import Navigation from './components/Navigation';

const CheckLandPage = lazy(() => import('./pages/CheckLandPage'));
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

function PassportRouteWrapper({ t, lang, sharedExtractedData, comparisonResult, onViewGraph }) {
  const { id } = useParams();
  const plotId = id || 'PCL-DHK-SAV-045-0558';
  return (
    <PassportPage
      t={t}
      lang={lang}
      selectedPlotId={plotId}
      sharedExtractedData={sharedExtractedData}
      comparisonResult={comparisonResult}
      onViewGraph={onViewGraph}
    />
  );
}

function VerificationRouteWrapper({ lang, onBackToApp, onViewPassport, onViewGraph }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recordId = id || searchParams.get('verify') || searchParams.get('record_id') || 'rec-demo-001';
  return (
    <VerificationPage
      recordId={recordId}
      lang={lang}
      onBackToApp={onBackToApp}
      onViewPassport={onViewPassport}
      onViewGraph={onViewGraph}
    />
  );
}

export default function App() {
  const [lang, setLang] = useState('bn');
  const [sharedExtractedData, setSharedExtractedData] = useState(null);
  const [selectedPlotId, setSelectedPlotId] = useState('PCL-DHK-SAV-045-0558');
  const [latestComparisonResult, setLatestComparisonResult] = useState(null);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  const navigate = useNavigate();
  const location = useLocation();

  const t = lang === 'bn' ? bnTranslations : enTranslations;

  // Track online/offline status for PWA support
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute active navigation tab from URL pathname
  const getActiveTab = () => {
    const p = location.pathname;
    if (p === '/' || p === '') return 'landing';
    if (p.startsWith('/check')) return 'check';
    if (p.startsWith('/passport')) return 'passport';
    if (p.startsWith('/guardian')) return 'guardian';
    if (p.startsWith('/verify')) return 'verify';
    if (p.startsWith('/compare')) return 'compare';
    if (p.startsWith('/history')) return 'history';
    if (p.startsWith('/integrity')) return 'integrity';
    if (p.startsWith('/scanner')) return 'scanner';
    if (p.startsWith('/reports')) return 'reports';
    if (p.startsWith('/graph')) return 'graph';
    if (p.startsWith('/overview')) return 'overview';
    if (p.startsWith('/landprice')) return 'landprice';
    return 'landing';
  };

  const activeTab = getActiveTab();

  const handleSetActiveTab = (tab) => {
    if (tab === 'landing') navigate('/');
    else if (tab === 'passport') navigate(`/passport/${selectedPlotId || 'PCL-DHK-SAV-045-0558'}`);
    else if (tab === 'verify') navigate(`/verify/${selectedPlotId || 'rec-demo-001'}`);
    else navigate(`/${tab}`);
  };

  const handleProceedToCompare = (extractedData) => {
    setSharedExtractedData(extractedData);
    navigate('/compare');
  };

  const handleViewPassport = (plotId, comparisonResult = null) => {
    const targetId = plotId || selectedPlotId || 'PCL-DHK-SAV-045-0558';
    setSelectedPlotId(targetId);
    if (comparisonResult) {
      setLatestComparisonResult(comparisonResult);
    }
    navigate(`/passport/${targetId}`);
  };

  const handleViewGraph = (plotId) => {
    if (plotId) {
      setSelectedPlotId(plotId);
    }
    navigate('/graph');
  };

  const handleOpenVerification = (recordId) => {
    const id = recordId || selectedPlotId || 'rec-demo-001';
    setSelectedPlotId(id);
    navigate(`/verify/${id}`);
  };

  const handleReturnFromVerification = () => {
    navigate('/integrity');
  };

  const handleStartWalkthrough = () => {
    setWalkthroughStep(1);
    navigate('/check');
  };

  const handleWalkthroughStep = (step) => {
    setWalkthroughStep(step);
    if (step === 1) navigate('/check');
    else if (step === 2) navigate('/passport/PCL-DHK-SAV-045-0558');
    else if (step === 3) navigate('/guardian');
    else setWalkthroughStep(0);
  };

  const handleNavigateSection = (sec) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scrollToSection(sec);
      }, 120);
    } else {
      scrollToSection(sec);
    }
  };

  const scrollToSection = (sec) => {
    if (sec === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sec === 'how-it-works' || sec === 'c') {
      const el = document.getElementById('c') || document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'passport' || sec === 'passport-preview') {
      const el = document.getElementById('passport-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'guardian' || sec === 'guardian-preview') {
      const el = document.getElementById('guardian-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sec === 'boundaries' || sec === 'limitations' || sec === 'scope' || sec === 'd') {
      const el = document.getElementById('d') || document.getElementById('audit-scope');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Offline Mode Banner (Always includes DEMO DATA label) */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            background: '#9A2C14',
            color: '#FFFFFF',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 1100
          }}
        >
          <span>📡</span>
          <span>{t.offline_notice}</span>
        </aside>
      )}

      {/* Guided Judge & Evaluator Demo Walkthrough Floating Stepper */}
      {walkthroughStep > 0 && (
        <aside
          aria-label="Demo Walkthrough Guide"
          style={{
            background: '#092123',
            color: '#FFFFFF',
            borderBottom: '2px solid #005A5B',
            padding: '12px 20px',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#005A5B',
              color: '#B7DFCA',
              padding: '3px 10px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.78rem',
              letterSpacing: '0.5px'
            }}>
              {t.walkthrough_badge}
            </span>
            <div>
              <strong style={{ fontSize: '0.94rem', color: '#FFFFFF' }}>
                {walkthroughStep === 1 ? t.walkthrough_step_1_title : walkthroughStep === 2 ? t.walkthrough_step_2_title : t.walkthrough_step_3_title}
              </strong>
              <span style={{ fontSize: '0.84rem', color: '#B7DFCA', marginLeft: '8px' }}>
                {walkthroughStep === 1 ? t.walkthrough_step_1_desc : walkthroughStep === 2 ? t.walkthrough_step_2_desc : t.walkthrough_step_3_desc}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {walkthroughStep > 1 && (
              <button
                type="button"
                onClick={() => handleWalkthroughStep(walkthroughStep - 1)}
                style={{
                  background: 'transparent',
                  border: '1px solid #3C5558',
                  color: '#CFE0DA',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  minHeight: '36px'
                }}
              >
                {t.walkthrough_prev}
              </button>
            )}
            {walkthroughStep < 3 ? (
              <button
                type="button"
                onClick={() => handleWalkthroughStep(walkthroughStep + 1)}
                style={{
                  background: '#B7DFCA',
                  border: 'none',
                  color: '#0D2B2E',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  minHeight: '36px'
                }}
              >
                {t.walkthrough_next}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setWalkthroughStep(0)}
                style={{
                  background: '#005A5B',
                  border: '1px solid #B7DFCA',
                  color: '#FFFFFF',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  minHeight: '36px'
                }}
              >
                {t.walkthrough_exit}
              </button>
            )}
            <button
              type="button"
              onClick={() => setWalkthroughStep(0)}
              aria-label="Close walkthrough"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FB3AB',
                cursor: 'pointer',
                padding: '6px 10px',
                fontSize: '0.9rem'
              }}
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* Landing View Header or Standard App Header */}
      {location.pathname === '/' ? (
        <LandingHeader
          lang={lang}
          setLang={setLang}
          activeTab="landing"
          onLaunchApp={(tab = 'check') => handleSetActiveTab(tab)}
          onNavigateSection={handleNavigateSection}
        />
      ) : (
        <>
          <Header lang={lang} setLang={setLang} t={t} onReturnToLanding={() => navigate('/')} />
          <Navigation activeTab={activeTab} setActiveTab={handleSetActiveTab} t={t} />
        </>
      )}

      {/* Main Routed Area */}
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
          <Routes>
            <Route path="/" element={
              <LandingPage
                lang={lang}
                onStartScanning={() => navigate('/check')}
                onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-SAV-045-0558')}
                onViewGuardian={() => navigate('/guardian')}
                onStartWalkthrough={handleStartWalkthrough}
              />
            } />

            <Route path="/check" element={
              <CheckLandPage
                t={t}
                lang={lang}
                onViewPassport={(id) => handleViewPassport(id)}
                onProceedToCompare={handleProceedToCompare}
                onViewLandPrice={() => navigate('/landprice')}
              />
            } />

            <Route path="/overview" element={
              <OverviewPage
                t={t}
                lang={lang}
                onNavigate={(tab) => handleSetActiveTab(tab)}
              />
            } />

            <Route path="/scanner" element={
              <ScannerPage
                t={t}
                lang={lang}
                setSharedExtractedData={setSharedExtractedData}
                onProceedToCompare={handleProceedToCompare}
                onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-SAV-045-0558')}
              />
            } />

            <Route path="/history" element={
              <HistoryPage
                t={t}
                lang={lang}
                onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-SAV-045-0558')}
              />
            } />

            <Route path="/compare" element={
              <ComparePage
                t={t}
                lang={lang}
                sharedExtractedData={sharedExtractedData}
                onViewPassport={handleViewPassport}
                onComparisonUpdated={setLatestComparisonResult}
              />
            } />

            <Route path="/passport" element={
              <PassportRouteWrapper
                t={t}
                lang={lang}
                sharedExtractedData={sharedExtractedData}
                comparisonResult={latestComparisonResult}
                onViewGraph={handleViewGraph}
              />
            } />

            <Route path="/passport/:id" element={
              <PassportRouteWrapper
                t={t}
                lang={lang}
                sharedExtractedData={sharedExtractedData}
                comparisonResult={latestComparisonResult}
                onViewGraph={handleViewGraph}
              />
            } />

            <Route path="/guardian" element={
              <GuardianPage
                t={t}
                lang={lang}
              />
            } />

            <Route path="/reports" element={
              <ReportsPage
                t={t}
                lang={lang}
                onStartScanning={() => navigate('/scanner')}
                onNavigate={(tab) => handleSetActiveTab(tab)}
                onViewPassport={(id) => handleViewPassport(id || 'PCL-DHK-SAV-045-0558')}
              />
            } />

            <Route path="/graph" element={
              <GraphPage
                t={t}
                lang={lang}
                initialRecordId={selectedPlotId}
                onSelectRecord={(id) => setSelectedPlotId(id)}
                onViewPassport={handleViewPassport}
              />
            } />

            <Route path="/integrity" element={
              <IntegrityPage
                t={t}
                lang={lang}
                onOpenVerification={handleOpenVerification}
              />
            } />

            <Route path="/verify" element={
              <VerificationRouteWrapper
                lang={lang}
                onBackToApp={handleReturnFromVerification}
                onViewPassport={handleViewPassport}
                onViewGraph={handleViewGraph}
              />
            } />

            <Route path="/verify/:id" element={
              <VerificationRouteWrapper
                lang={lang}
                onBackToApp={handleReturnFromVerification}
                onViewPassport={handleViewPassport}
                onViewGraph={handleViewGraph}
              />
            } />

            <Route path="/landprice" element={
              <LandPricePage
                t={t}
                lang={lang}
              />
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Accessible Cadastral Footer for Non-Landing App Pages */}
      {location.pathname !== '/' && (
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
