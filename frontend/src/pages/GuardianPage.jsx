import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Info, 
  AlertTriangle,
  ShieldCheck, 
  ShieldAlert,
  RefreshCw,
  Bell,
  ArrowRightLeft,
  ExternalLink,
  Search,
  FileBadge,
  ArrowRight,
  Database,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  fetchSimulationEvents, 
  triggerSimulationApi, 
  fetchGuardianAlerts, 
  markAlertReviewedApi,
  fetchGuardianRiskReport 
} from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';
import GuardianAlertModal from '../components/GuardianAlertModal';

export default function GuardianPage({ lang = 'bn' }) {
  const isBn = lang === 'bn';
  const [eventsCatalog, setEventsCatalog] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('evt-558');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);

  // Evidence & Risk Report State
  const [riskReport, setRiskReport] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [auditQuery, setAuditQuery] = useState({
    dag_no: '558',
    khatian_no: '128',
    seller_name: 'আব্দুল করিম',
    buyer_name: 'অন্য ক্রেতা (Another Buyer)',
    area_decimal: '10.0',
    deed_no: 'PROP-2026-9999',
    parcel_id: 'PCL-DHK-SAV-045-0558'
  });

  const loadGuardianData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, alertsData] = await Promise.all([
        fetchSimulationEvents(),
        fetchGuardianAlerts()
      ]);
      if (eventsData && eventsData.events) {
        setEventsCatalog(eventsData.events);
        // Default to evt-558 if available, else first event
        const has558 = eventsData.events.some(e => e.event_id === 'evt-558');
        setSelectedEventId(has558 ? 'evt-558' : eventsData.events[0]?.event_id || 'evt-001');
      }
      if (alertsData && alertsData.alerts) {
        setActiveAlerts(alertsData.alerts);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runEvidenceAudit = async (customPayload = null) => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const payload = customPayload || {
        ...auditQuery,
        area_decimal: parseFloat(auditQuery.area_decimal) || 10.0
      };
      const res = await fetchGuardianRiskReport(payload);
      setRiskReport(res);
    } catch (err) {
      console.error(err);
      setAuditError(err);
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    loadGuardianData();
    // Run initial evidence audit for Dag 558 duplicate sale scenario
    runEvidenceAudit();
  }, []);

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    setError(null);
    try {
      const newAlert = await triggerSimulationApi(selectedEventId);
      if (newAlert) {
        setActiveAlerts(prev => [newAlert, ...prev.filter(a => a.alert_id !== newAlert.alert_id)]);
        // If the triggered alert carries a risk report, update the active report view
        if (newAlert.risk_report) {
          setRiskReport(newAlert.risk_report);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleMarkReviewed = async (alertId) => {
    setError(null);
    try {
      const updated = await markAlertReviewedApi(alertId);
      if (updated && updated.alert) {
        setActiveAlerts(prev =>
          prev.map(a => (a.alert_id === alertId ? { ...a, is_reviewed: true } : a))
        );
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  const setAuditPreset = (presetKey) => {
    let preset = null;
    if (presetKey === 'dag558_dup') {
      preset = {
        dag_no: '558',
        khatian_no: '128',
        seller_name: 'আব্দুল করিম',
        buyer_name: 'অন্য ক্রেতা (Another Buyer)',
        area_decimal: '10.0',
        deed_no: 'PROP-2026-9999',
        parcel_id: 'PCL-DHK-SAV-045-0558'
      };
    } else if (presetKey === 'dag558_clean') {
      preset = {
        dag_no: '558',
        khatian_no: '128',
        seller_name: 'আব্দুল করিম',
        buyer_name: 'সুলতানা জাহান',
        area_decimal: '10.0',
        deed_no: 'PROP-2026-9001',
        parcel_id: 'PCL-DHK-SAV-045-0558'
      };
    } else if (presetKey === 'dag777_overlap') {
      preset = {
        dag_no: '777',
        khatian_no: '333',
        seller_name: 'ফারহানা আক্তার',
        buyer_name: 'তৃতীয় পক্ষ',
        area_decimal: '6.0',
        deed_no: 'PROP-2026-EXCESS',
        parcel_id: 'PCL-TEST-OVERLAP-01'
      };
    } else if (presetKey === 'unknown_dag') {
      preset = {
        dag_no: '9999',
        khatian_no: '999',
        seller_name: 'অজ্ঞাত ব্যক্তি',
        buyer_name: 'নতুন ক্রেতা',
        area_decimal: '5.0',
        deed_no: 'PROP-UNKNOWN',
        parcel_id: 'PCL-UNKNOWN'
      };
    }
    if (preset) {
      setAuditQuery(preset);
      runEvidenceAudit({
        ...preset,
        area_decimal: parseFloat(preset.area_decimal) || 10.0
      });
    }
  };

  // Helper for rendering Risk Status styling
  const getRiskStatusMeta = (status) => {
    switch (status) {
      case 'Potential Duplicate Sale':
        return {
          bg: '#FEF2F2',
          border: '#FCA5A5',
          text: '#991B1B',
          badgeBg: '#DC2626',
          icon: <ShieldAlert size={20} color="#DC2626" />,
          labelBn: 'সম্ভাব্য দ্বৈত বিক্রয় (Potential Duplicate Sale)',
          labelEn: 'Potential Duplicate Sale'
        };
      case 'Potential Ownership Conflict':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#92400E',
          badgeBg: '#D97706',
          icon: <AlertTriangle size={20} color="#D97706" />,
          labelBn: 'সম্ভাব্য মালিকানা দ্বন্দ্ব (Potential Ownership Conflict)',
          labelEn: 'Potential Ownership Conflict'
        };
      case 'Needs Manual Review':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1E40AF',
          badgeBg: '#2563EB',
          icon: <Clock size={20} color="#2563EB" />,
          labelBn: 'ম্যানুয়াল পর্যালোচনা প্রয়োজন (Needs Manual Review)',
          labelEn: 'Needs Manual Review'
        };
      case 'No Conflict Found in Available Records':
      default:
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#065F46',
          badgeBg: '#059669',
          icon: <ShieldCheck size={20} color="#059669" />,
          labelBn: 'উপলব্ধ রেকর্ডে কোনো দ্বন্দ্ব পাওয়া যায়নি (No Conflict Found)',
          labelEn: 'No Conflict Found in Available Records'
        };
    }
  };

  const activeStatusMeta = getRiskStatusMeta(riskReport?.risk_status || 'Potential Duplicate Sale');

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            padding: '10px',
            borderRadius: 'var(--radius-std)',
            display: 'flex'
          }}>
            <Bell size={26} />
          </div>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
              lineHeight: 1.2
            }}>
              {isBn ? 'ল্যান্ড গার্ডিয়ান — প্রমাণ ও ঝুঁকি প্রতিবেদন' : 'Land Guardian Evidence & Risk Report'}
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              margin: '4px 0 0'
            }}>
              {isBn 
                ? 'মালিকানা সংঘাত ও দ্বৈত বিক্রয় শনাক্তকরণ: ঐতিহাসিক প্রমাণ, পূর্ববর্তী হস্তান্তরের বিবরণ ও ধারাবাহিক টাইমলাইন নিরীক্ষা।' 
                : 'Evidence-based land ownership conflict and duplicate conveyance detection with chronological title history.'}
            </p>
          </div>
        </div>
      </div>

      <ApiErrorNotice error={error || auditError} onRetry={() => { loadGuardianData(); runEvidenceAudit(); }} title={isBn ? 'ল্যান্ড গার্ডিয়ান সেবা সাময়িকভাবে উপলব্ধ নয়' : 'Land Guardian Service Unavailable'} />

      {/* SECTION 1: LAND GUARDIAN EVIDENCE & RISK REPORT */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid var(--line)',
        boxShadow: '0 2px 6px rgba(16, 39, 42, 0.05)',
        padding: '24px',
        marginBottom: '32px'
      }}>
        {/* Panel Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--line)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'var(--primary-accent)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              AUDIT ENGINE
            </span>
            <h2 style={{
              fontSize: '1.24rem',
              fontWeight: 800,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0
            }}>
              {isBn ? 'জমি মালিকানা সংঘাত ও প্রমাণ বিশ্লেষণ কেন্দ্র' : 'Land Ownership Conflict & Evidence Center'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => runEvidenceAudit()}
              disabled={isAuditing}
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                border: 'none',
                background: 'var(--primary-accent)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isAuditing ? 'spin' : ''} />
              <span>{isBn ? 'পুনরায় নিরীক্ষা চালান' : 'Refresh Audit'}</span>
            </button>
          </div>
        </div>

        {/* Quick Audit Scenario Presets */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--muted)',
            fontFamily: 'var(--font-heading)',
            marginBottom: '8px'
          }}>
            {isBn ? 'দ্রুত পরীক্ষা সিনারিও নির্বাচন করুন (Quick Scenarios):' : 'Select Quick Scenario:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              id="preset-dup-sale"
              onClick={() => setAuditPreset('dag558_dup')}
              style={{
                background: auditQuery.dag_no === '558' && auditQuery.buyer_name.includes('অন্য') ? '#FEE2E2' : 'var(--ground)',
                border: auditQuery.dag_no === '558' && auditQuery.buyer_name.includes('অন্য') ? '1px solid #F87171' : '1px solid var(--line)',
                color: auditQuery.dag_no === '558' && auditQuery.buyer_name.includes('অন্য') ? '#991B1B' : 'var(--ink)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldAlert size={14} color="#DC2626" />
              <span>{isBn ? 'দাগ ৫৫৮: দ্বৈত বিক্রয় পরীক্ষা (করিম ➔ অন্য ক্রেতা)' : 'Dag 558: Duplicate Sale (Karim -> Another)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuditPreset('dag558_clean')}
              style={{
                background: auditQuery.dag_no === '558' && auditQuery.buyer_name.includes('সুলতানা') ? '#ECFDF5' : 'var(--ground)',
                border: auditQuery.dag_no === '558' && auditQuery.buyer_name.includes('সুলতানা') ? '1px solid #34D399' : '1px solid var(--line)',
                color: auditQuery.dag_no === '558' && auditQuery.buyer_name.includes('সুলতানা') ? '#065F46' : 'var(--ink)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={14} color="#059669" />
              <span>{isBn ? 'দাগ ৫৫৮: প্রথম হস্তান্তর (করিম ➔ সুলতানা জাহান)' : 'Dag 558: Prior Sale (Karim -> Sultana)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuditPreset('dag777_overlap')}
              style={{
                background: auditQuery.dag_no === '777' ? '#FEF3C7' : 'var(--ground)',
                border: auditQuery.dag_no === '777' ? '1px solid #FBBF24' : '1px solid var(--line)',
                color: auditQuery.dag_no === '777' ? '#92400E' : 'var(--ink)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={14} color="#D97706" />
              <span>{isBn ? 'দাগ ৭৭৭: অতিরিক্ত জমি বিক্রয় চেষ্টা (অভারল্যাপ)' : 'Dag 777: Area Overlap'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuditPreset('unknown_dag')}
              style={{
                background: auditQuery.dag_no === '9999' ? '#E0E7FF' : 'var(--ground)',
                border: auditQuery.dag_no === '9999' ? '1px solid #818CF8' : '1px solid var(--line)',
                color: auditQuery.dag_no === '9999' ? '#3730A3' : 'var(--ink)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Clock size={14} color="#4F46E5" />
              <span>{isBn ? 'অনুপস্থিত দাগ: তথ্য ফাঁক (ম্যানুয়াল রিভিউ)' : 'Unknown Dag: Missing Link'}</span>
            </button>
          </div>
        </div>

        {/* 3A. RISK STATUS BANNER */}
        <div 
          id="risk-status-banner"
          style={{
            background: activeStatusMeta.bg,
            border: `1.5px solid ${activeStatusMeta.border}`,
            borderRadius: 'var(--radius-std)',
            padding: '18px 22px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {activeStatusMeta.icon}
              <div>
                <span style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: activeStatusMeta.text,
                  display: 'block'
                }}>
                  {isBn ? 'ঝুঁকি শ্রেণিবিভাগ (Risk Status):' : 'Risk Classification:'}
                </span>
                <strong style={{
                  fontSize: '1.18rem',
                  color: activeStatusMeta.text,
                  fontFamily: 'var(--font-heading)'
                }}>
                  {isBn ? activeStatusMeta.labelBn : activeStatusMeta.labelEn}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: activeStatusMeta.badgeBg,
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                SEVERITY: {riskReport?.severity || 'HIGH'}
              </span>
              <span style={{
                background: 'var(--white)',
                border: `1px solid ${activeStatusMeta.border}`,
                color: activeStatusMeta.text,
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                দাগ: {riskReport?.dag_no || auditQuery.dag_no}
              </span>
            </div>
          </div>

          {/* Explanation Reason Text */}
          <p style={{
            margin: '4px 0 0',
            fontSize: '0.94rem',
            color: activeStatusMeta.text,
            lineHeight: 1.6,
            fontFamily: 'var(--font-body)'
          }}>
            {isBn 
              ? (riskReport?.conflict_explanation?.reason_bn || riskReport?.message)
              : (riskReport?.conflict_explanation?.reason_en || riskReport?.message)}
          </p>

          <div style={{
            fontSize: '0.76rem',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            paddingTop: '6px',
            borderTop: `1px dashed ${activeStatusMeta.border}`
          }}>
            {riskReport?.disclaimer || 'DEMO DATABASE EVIDENCE — not an official government verdict. Missing government records must not be treated as proof of fraud.'}
          </div>
        </div>

        {/* 3C. EVIDENCE DETAILS COMPARISON CARDS */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}>
            <h3 style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={18} color="var(--primary-accent)" />
              <span>{isBn ? 'প্রমাণ বিবরণী (Evidence Details & Comparison)' : 'Evidence Details & Comparison'}</span>
            </h3>

            <span style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--muted)',
              fontWeight: 700
            }}>
              {isBn ? 'সংশ্লিষ্ট ২ টি রেকর্ড সংরক্ষিত' : '2 Linked Transaction Records'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '16px'
          }}>
            {/* Record 1: Previous Registered Transfer */}
            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: 'var(--radius-std)',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid #E2E8F0'
              }}>
                <span style={{
                  background: '#047857',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {isBn ? 'পূর্ববর্তী বৈধ হস্তান্তর' : 'PRIOR TRANSFER'}
                </span>
                <span style={{
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)'
                }}>
                  ID: {riskReport?.evidence?.previous_transaction_id || 'PROP-2026-9001'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'বিক্রেতা (Seller):' : 'Seller:'}</span>
                  <strong style={{ color: 'var(--ink)' }}>
                    {riskReport?.evidence?.previous_owner || 'আব্দুল করিম'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'ক্রেতা (Buyer):' : 'Buyer:'}</span>
                  <strong style={{ color: '#047857' }}>
                    {riskReport?.evidence?.current_demo_owner || 'সুলতানা জাহান'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'হস্তান্তরিত জমি:' : 'Transferred Area:'}</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
                    {riskReport?.evidence?.records?.[0]?.land_area || '10.0'} {isBn ? 'শতক' : 'decimals'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'দলিলের তারিখ:' : 'Deed Date:'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {riskReport?.evidence?.previous_transaction_date || '2026-10-17'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'দাগ ও খতিয়ান:' : 'Dag & Khatian:'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    দাগ {riskReport?.evidence?.dag_no || '558'}, খতিয়ান {riskReport?.evidence?.khatian_no || '128'}
                  </span>
                </div>

                <div style={{ 
                  marginTop: '6px', 
                  paddingTop: '8px', 
                  borderTop: '1px dashed #E2E8F0',
                  fontSize: '0.76rem',
                  color: 'var(--muted)'
                }}>
                  <strong>{isBn ? 'রেকর্ড উৎস:' : 'Record Source:'}</strong> {riskReport?.evidence?.record_sources?.previous_record || 'User-Submitted Records (Demo Database)'}
                </div>
              </div>
            </div>

            {/* Record 2: Current Attempted Transfer */}
            <div style={{
              background: activeStatusMeta.bg,
              border: `1.5px solid ${activeStatusMeta.border}`,
              borderRadius: 'var(--radius-std)',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${activeStatusMeta.border}`
              }}>
                <span style={{
                  background: activeStatusMeta.badgeBg,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {isBn ? 'বর্তমান দাখিলকৃত প্রস্তাব' : 'CURRENT ATTEMPT'}
                </span>
                <span style={{
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  color: activeStatusMeta.text
                }}>
                  ID: {riskReport?.evidence?.current_transaction_id || 'PROP-2026-9999'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'বিক্রেতা (Seller):' : 'Seller:'}</span>
                  <strong style={{ color: activeStatusMeta.text }}>
                    {auditQuery.seller_name}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'ক্রেতা (Buyer):' : 'Buyer:'}</span>
                  <strong style={{ color: activeStatusMeta.text }}>
                    {auditQuery.buyer_name}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'প্রস্তাবিত জমি:' : 'Proposed Area:'}</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: activeStatusMeta.text }}>
                    {riskReport?.evidence?.land_area || auditQuery.area_decimal} {isBn ? 'শতক' : 'decimals'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'দাখিলের তারিখ:' : 'Filing Date:'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {riskReport?.evidence?.current_transaction_date || '2026-10-18'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>{isBn ? 'দাগ ও খতিয়ান:' : 'Dag & Khatian:'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    দাগ {riskReport?.evidence?.dag_no || auditQuery.dag_no}, খতিয়ান {riskReport?.evidence?.khatian_no || auditQuery.khatian_no}
                  </span>
                </div>

                <div style={{ 
                  marginTop: '6px', 
                  paddingTop: '8px', 
                  borderTop: `1px dashed ${activeStatusMeta.border}`,
                  fontSize: '0.76rem',
                  color: 'var(--muted)'
                }}>
                  <strong>{isBn ? 'রেকর্ড উৎস:' : 'Record Source:'}</strong> {riskReport?.evidence?.record_sources?.current_record || 'Citizen Deed Upload / Proposed Purchase Simulation'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3B. EVIDENCE TIMELINE */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}>
            <h3 style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={18} color="var(--primary-accent)" />
              <span>{isBn ? 'প্রমাণ টাইমলাইন — কালানুক্রমিক মালিকানা ধারা' : 'Evidence Timeline — Chronological Chain of Custody'}</span>
            </h3>

            <span style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--muted)',
              fontWeight: 700
            }}>
              CHRONOLOGICAL
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            paddingLeft: '16px',
            borderLeft: '2px solid var(--line)',
            marginLeft: '8px'
          }}>
            {riskReport?.evidence_timeline?.map((item, idx) => {
              const isConflictItem = item.is_conflict;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    background: isConflictItem ? '#FEF2F2' : 'var(--ground)',
                    border: isConflictItem ? '1px solid #FCA5A5' : '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}
                >
                  {/* Step dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-23px',
                    top: '16px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: isConflictItem ? '#DC2626' : 'var(--primary-accent)',
                    border: '2px solid #FFFFFF'
                  }} />

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <strong style={{
                      fontSize: '0.94rem',
                      color: isConflictItem ? '#991B1B' : 'var(--ink)',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {isBn ? item.title_bn : item.title_en}
                    </strong>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--muted)'
                      }}>
                        {item.date}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isConflictItem ? '#DC2626' : '#E2E8F0',
                        color: isConflictItem ? '#FFFFFF' : 'var(--ink)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {item.status_badge}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '0.86rem',
                    color: isConflictItem ? '#7F1D1D' : 'var(--ink-soft)',
                    lineHeight: 1.5
                  }}>
                    {isBn ? item.detail_bn : item.detail_en}
                  </p>

                  <div style={{
                    marginTop: '6px',
                    fontSize: '0.74rem',
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    উৎস: {item.source}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: SIMULATION SCENARIO HUB */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid var(--line)',
        boxShadow: '0 1px 3px rgba(16, 39, 42, 0.05)',
        padding: '20px 24px',
        marginBottom: '28px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--line)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#B45309',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              {isBn ? 'সিমুলেশন কন্ট্রোল' : 'SIMULATION'}
            </span>
            <h2 style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0
            }}>
              {isBn ? 'সিমুলেশন সিনারিও কমান্ড সেন্টার' : 'Simulation Scenario Hub'}
            </h2>
          </div>
          <span style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            background: 'var(--ground)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            color: 'var(--muted)',
            fontWeight: 700
          }}>
            EVENT GENERATOR
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '16px',
          alignItems: 'flex-end'
        }}>
          <div>
            <label htmlFor="simulation-scenario-select" style={{
              display: 'block',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--ink)',
              marginBottom: '6px'
            }}>
              {isBn ? 'সিমুলেশন সিনারিও নির্বাচন করুন:' : 'Select Simulation Scenario:'}
            </label>
            <select
              id="simulation-scenario-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer'
              }}
            >
              {eventsCatalog.map(evt => (
                <option key={evt.event_id} value={evt.event_id}>
                  {evt.event_id}: {isBn ? evt.title_bn : evt.title_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              id="trigger-simulation-btn"
              type="button"
              onClick={handleTriggerSimulation}
              disabled={isSimulating}
              style={{
                height: '44px',
                padding: '0 20px',
                fontSize: '0.92rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                border: 'none',
                background: 'var(--accent)',
                color: 'var(--white)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={15} className={isSimulating ? 'spin' : ''} />
              <span>{isBn ? 'সিমুলেশন ইভেন্ট শুরু করুন' : 'Trigger Simulated Event'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: ACTIVE SIMULATED ALERTS LIST */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '1.18rem',
            fontWeight: 800,
            color: 'var(--ink)',
            fontFamily: 'var(--font-heading)',
            margin: 0
          }}>
            {isBn ? 'সক্রিয় সিমুলেটেড সতর্কতা সমূহ' : 'Active Simulated Alerts'}
          </h2>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
            color: 'var(--muted)',
            fontWeight: 700
          }}>
            {activeAlerts.length} {isBn ? 'টি সতর্কতা' : 'alerts'}
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1px solid var(--line)',
            padding: '36px 20px',
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            <Bell size={28} style={{ margin: '0 auto 8px', color: 'var(--muted)' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {isBn 
                ? 'বর্তমানে কোনো সিমুলেটেড সতর্কতা নেই। ওপরের কমান্ড সেন্টার থেকে একটি ইভেন্ট শুরু করুন।' 
                : 'No active simulated alerts. Trigger an event from the command center above.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeAlerts.map((alert) => {
              const isReviewed = alert.is_reviewed;

              return (
                <div
                  key={alert.alert_id}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-std)',
                    border: '1px solid var(--line)',
                    boxShadow: '0 1px 3px rgba(16, 39, 42, 0.04)',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Alert Header Row */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--line)',
                    background: isReviewed ? 'var(--paper)' : '#FFFAF5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: '#B45309',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.4px'
                      }}>
                        {isBn ? 'সিমুলেটেড' : 'SIMULATED'}
                      </span>
                      <strong style={{
                        fontSize: '1rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--ink)'
                      }}>
                        {isBn ? alert.title_bn : alert.title_en}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.76rem',
                        color: 'var(--muted)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <Clock size={13} />
                        <span>{alert.timestamp || 'N/A'}</span>
                      </div>

                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isReviewed ? 'var(--status-matched-bg)' : 'var(--status-review-bg)',
                        color: isReviewed ? 'var(--status-matched-text)' : 'var(--status-review-text)',
                        border: isReviewed ? '1px solid var(--status-matched-border)' : '1px solid var(--status-review-border)'
                      }}>
                        {isReviewed ? (isBn ? '✓ পর্যালোচিত' : 'Reviewed') : (isBn ? 'সক্রিয় পর্যালোচনা' : 'Active')}
                      </span>
                    </div>
                  </div>

                  {/* Alert Body Snippet */}
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--ink-soft)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.55,
                      margin: '0 0 14px'
                    }}>
                      {isBn ? alert.description_bn : alert.description_en}
                    </p>

                    {/* Quick Diff Pill Tags */}
                    {alert.diff_report && alert.diff_report.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '16px'
                      }}>
                        {alert.diff_report.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--paper)',
                              border: '1px solid var(--line)',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--ink)'
                            }}
                          >
                            <span>{d.field}:</span>
                            <span style={{ color: 'var(--muted)' }}>{String(d.old_value)}</span>
                            <ArrowRightLeft size={12} style={{ color: 'var(--primary-accent)' }} />
                            <strong style={{ color: '#B45309' }}>{String(d.new_value)}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--line)'
                    }}>
                      <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                        {isBn ? 'প্লট আইডি:' : 'Plot ID:'} <strong>{alert.record_id}</strong>
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Detail Modal Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedAlertForModal(alert)}
                          style={{
                            height: '38px',
                            padding: '0 14px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            borderRadius: 'var(--radius-std)',
                            border: '1px solid var(--line)',
                            background: 'var(--paper)',
                            color: 'var(--ink)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{isBn ? 'প্রমাণ ও পরিবর্তন দেখুন' : 'View Evidence & Details'}</span>
                          <ExternalLink size={14} />
                        </button>

                        {/* Inline Review Toggle */}
                        <button
                          type="button"
                          id={`mark-reviewed-${alert.alert_id}`}
                          onClick={() => handleMarkReviewed(alert.alert_id)}
                          disabled={isReviewed}
                          style={{
                            height: '38px',
                            padding: '0 14px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            borderRadius: 'var(--radius-std)',
                            border: isReviewed ? '1px solid var(--status-matched-border)' : '1px solid var(--accent)',
                            background: isReviewed ? 'var(--status-matched-bg)' : 'var(--accent)',
                            color: isReviewed ? 'var(--status-matched-text)' : 'var(--white)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: isReviewed ? 'default' : 'pointer'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {isReviewed 
                              ? (isBn ? '✓ পর্যালোচিত' : '✓ Reviewed')
                              : (isBn ? 'পর্যালোচিত চিহ্নিত করুন' : 'Mark Reviewed')}
                          </span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Details Modal Popup */}
      <GuardianAlertModal
        isOpen={Boolean(selectedAlertForModal)}
        alert={selectedAlertForModal}
        onClose={() => setSelectedAlertForModal(null)}
        onMarkReviewed={handleMarkReviewed}
        lang={lang}
      />
    </div>
  );
}
