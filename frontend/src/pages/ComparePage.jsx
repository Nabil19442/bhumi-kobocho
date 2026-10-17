import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Shield, 
  Sparkles, 
  ArrowRight,
  Info,
  Sliders,
  Database,
  RefreshCw,
  Compass,
  FileBadge,
  AlertOctagon,
  Layers,
  History
} from 'lucide-react';
import { compareRecordsApi, fetchRecords, fetchConflictScenarios } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function ComparePage({ t, lang = 'bn', sharedExtractedData, onViewPassport, onComparisonUpdated }) {
  const isBn = lang === 'bn';
  const [records, setRecords] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('auto');
  const [tolerance, setTolerance] = useState(0.05);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInitialData = async () => {
    try {
      const [recordsData, scenariosData] = await Promise.all([
        fetchRecords().catch(() => ({ records: [] })),
        fetchConflictScenarios().catch(() => ({ scenarios: [] }))
      ]);
      if (recordsData && recordsData.records) {
        setRecords(recordsData.records);
      }
      if (scenariosData && scenariosData.scenarios) {
        setScenarios(scenariosData.scenarios);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const SCENARIO_PRESETS = {
    'rec-scen-001-b': {
      dag_no: '550',
      khatian_no: '220',
      deed_no: '4520/2023',
      area_decimal: '10.0',
      owner_name: 'তারেক রহমান',
      document_date: '2023-08-15',
      mouza: 'গুলশান (Gulshan)'
    },
    'rec-scen-002-b': {
      dag_no: '784',
      khatian_no: '129',
      deed_no: '5812/2022',
      area_decimal: '7.0',
      owner_name: 'মাহমুদ হাসান',
      document_date: '2022-11-20',
      mouza: 'সাভার (Savar)'
    },
    'rec-scen-003-b': {
      dag_no: '1058',
      khatian_no: '412',
      deed_no: '1482/2021',
      area_decimal: '5.0',
      owner_name: 'আমিনুল হক',
      document_date: '2021-04-12',
      mouza: 'মিরপুর (Mirpur)'
    },
    'rec-scen-004-a': {
      dag_no: '3310',
      khatian_no: '991',
      deed_no: '1099/2024',
      area_decimal: '8.0',
      owner_name: 'নাসির উদ্দিন',
      document_date: '2024-01-10',
      mouza: 'আন্দরকিল্লা (Anderkilla)'
    },
    'rec-scen-005-d': {
      dag_no: '1540',
      khatian_no: '605',
      deed_no: '8112/2018',
      area_decimal: '6.0',
      owner_name: 'মাকসুদা বেগম',
      document_date: '2018-12-05',
      mouza: 'আম্বরখানা (Amberkhana)'
    },
    'rec-demo-deed-active': {
      dag_no: '1234',
      khatian_no: '456',
      deed_no: '2026-0017',
      area_decimal: '10.0',
      owner_name: 'মোঃ সাকিব হাসান',
      document_date: '15 অক্টোবর ২০২৬',
      mouza: 'শান্তিপুর (কাল্পনিক)'
    },
    'unrecorded-plot': {
      dag_no: '999999',
      khatian_no: '888888',
      deed_no: '0000/2026',
      area_decimal: '15.0',
      owner_name: 'অজ্ঞাত ব্যক্তি',
      document_date: '2026-01-01',
      mouza: 'অজানা মৌজা'
    }
  };

  const runComparison = async (refId = selectedRecordId, tol = tolerance) => {
    setIsLoading(true);
    setError(null);
    try {
      let extractedPayload = sharedExtractedData;
      if (SCENARIO_PRESETS[refId]) {
        extractedPayload = SCENARIO_PRESETS[refId];
      } else if (!extractedPayload) {
        extractedPayload = {
          owner_name: 'মোঃ সাকিব হাসান',
          khatian_no: '456',
          dag_no: '1234',
          area_decimal: '10.0',
          document_date: '15 অক্টোবর ২০২৬',
          deed_no: '2026-0017',
          mouza: 'শান্তিপুর (কাল্পনিক)'
        };
      }

      const payload = {
        reference_record_id: refId,
        extracted_data: extractedPayload,
        area_tolerance_decimal: parseFloat(tol),
        language: lang,
      };
      const res = await compareRecordsApi(payload);
      setComparison(res);
      if (onComparisonUpdated) {
        onComparisonUpdated(res);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runComparison(selectedRecordId, tolerance);
  }, [selectedRecordId, lang, sharedExtractedData]);

  const handleRetry = () => {
    loadRecords();
    runComparison(selectedRecordId, tolerance);
  };

  const formatDisplayVal = (val) => {
    if (val === null || val === undefined) return isBn ? 'তথ্য পাওয়া যায়নি' : 'Data not found';
    const s = String(val).trim();
    if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') {
      return isBn ? 'তথ্য পাওয়া যায়নি' : 'Data not found';
    }
    return s;
  };

  // 4 official statuses only — each must have an icon and text label
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: 'var(--status-matched-bg)',
            border: '1px solid var(--status-matched-border)',
            color: 'var(--status-matched-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>{isBn ? 'মিলেছে (Matched)' : 'Matched'}</span>
          </span>
        );
      case 'Mismatch':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: 'var(--status-mismatch-bg)',
            border: '1px solid var(--status-mismatch-border)',
            color: 'var(--status-mismatch-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <XCircle size={13} aria-hidden="true" />
            <span>{isBn ? 'অমিল (Mismatch)' : 'Mismatch'}</span>
          </span>
        );
      case 'Needs review':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: 'var(--status-review-bg)',
            border: '1px solid var(--status-review-border)',
            color: 'var(--status-review-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <AlertTriangle size={13} aria-hidden="true" />
            <span>{isBn ? 'আরও যাচাই দরকার (Needs review)' : 'Needs review'}</span>
          </span>
        );
      case 'Not checked':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: 'var(--status-notchecked-bg)',
            border: '1px solid var(--status-notchecked-border)',
            color: 'var(--status-notchecked-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <HelpCircle size={13} aria-hidden="true" />
            <span>{isBn ? 'যাচাই করা হয়নি (Not checked)' : 'Not checked'}</span>
          </span>
        );
    }
  };

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            padding: '8px',
            borderRadius: 'var(--radius-std)',
            display: 'flex'
          }}>
            <GitCompare size={24} />
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
              {isBn ? 'অসঙ্গতি নিরীক্ষা ও নিয়ম-ভিত্তিক তুলনা' : 'Mismatch Detector & Deterministic Audit'}
            </h1>
            <p style={{
              fontSize: '0.98rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              margin: '4px 0 0'
            }}>
              {isBn
                ? 'দলিল থেকে প্রাপ্ত তথ্যের সাথে অফিসিয়াল মৌজা রেফারেন্স রেকর্ডের নিয়মমাফিক তুলনা ও অমিল শনাক্তকরণ।'
                : 'Deterministic cross-examination comparing extracted deed fields against baseline mouza records.'}
            </p>
          </div>
        </div>
      </div>

      <ApiErrorNotice error={error} onRetry={handleRetry} title={isBn ? 'তুলনা সেবা সাময়িকভাবে উপলব্ধ নয়' : 'Comparison Service Unavailable'} />

      {/* Control Configuration Card */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid #CAD7CF',
        boxShadow: 'var(--shadow-hard-sm)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid #CAD7CF',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '1.14rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sliders size={18} color="var(--primary-accent)" />
            <span>{isBn ? 'নিরীক্ষার প্যারামিটার ও রেফারেন্স রেকর্ড' : 'Audit Parameters & Reference Dataset'}</span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isLoading && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '12px',
                background: 'var(--status-review-bg)',
                color: 'var(--status-review-text)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>
                <RefreshCw size={12} className="spin" />
                <span>{isBn ? 'তুলনা চলছে...' : 'Running Comparison...'}</span>
              </span>
            )}
            <span style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              background: 'var(--ground)',
              border: '1px solid #CBD8D2',
              borderRadius: '4px',
              color: 'var(--muted)',
              fontWeight: 700
            }}>
              {isBn ? 'নিয়ম ইঞ্জিন' : 'RULE ENGINE'}
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* Reference Record Select */}
          <div className="form-field">
            <label htmlFor="ref-record-select" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              marginBottom: '6px'
            }}>
              <Database size={15} color="var(--primary-accent)" />
              <span>{isBn ? 'তুলনার জন্য ডেমো রেফারেন্স রেকর্ড:' : 'Reference Baseline Record:'}</span>
            </label>
            <select
              id="ref-record-select"
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              style={{
                width: '100%',
                height: '46px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                border: '1.5px solid #CAD7CF',
                background: 'var(--paper)',
                color: 'var(--text-main)',
                fontSize: '0.94rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer'
              }}
            >
              <option value="auto">
                🔍 {isBn ? 'স্বয়ংক্রিয় অনুসন্ধান: সংশ্লিষ্ট দলিলের ইতিহাস (Search Synthetic Parcel History)' : 'Auto-Search Synthetic Parcel History'}
              </option>
              
              <optgroup label={isBn ? 'দ্বন্দ্ব যাচাই দৃশ্যপট (Conflict Test Scenarios)' : 'Conflict Test Scenarios'}>
                <option value="rec-scen-001-b">
                  ⚠️ {isBn ? 'দৃশ্যপট ১: একই জমির দ্বৈত বিক্রয় (Duplicate Sale Scenario)' : 'Scenario 1: Duplicate Sale of Same Portion'}
                </option>
                <option value="rec-scen-002-b">
                  ⚠️ {isBn ? 'দৃশ্যপট ২: অতিরিক্ত জমি বিক্রয় (Overlapping Area Scenario)' : 'Scenario 2: Overlapping Area Sale'}
                </option>
                <option value="rec-scen-003-b">
                  ✓ {isBn ? 'দৃশ্যপট ৩: স্বাভাবিক বিক্রয় — কোনো দ্বন্দ্ব নেই (Normal Sale / Clean Chain)' : 'Scenario 3: Normal Sale (No Overlap)'}
                </option>
                <option value="rec-scen-004-a">
                  ⚠️ {isBn ? 'দৃশ্যপট ৪: অসম্পূর্ণ ইতিহাস বা যোগসূত্রের ফাঁক (History Continuity Gap)' : 'Scenario 4: Incomplete History Gap'}
                </option>
                <option value="rec-scen-005-d">
                  ✓ {isBn ? 'দৃশ্যপট ৫: বহুবিধ লেনদেনের ধারাবাহিকতা (Multiple Transactions Chain)' : 'Scenario 5: Multi-Transaction Chain'}
                </option>
                <option value="rec-demo-deed-active">
                  📄 {isBn ? 'নমুনা আপলোডকৃত দলিল (Sample Land Deed Demo PDF - Shantipur)' : 'Sample Uploaded Deed (Shantipur Plot 1234)'}
                </option>
                <option value="unrecorded-plot">
                  ❓ {isBn ? 'অজানা দাগ/খতিয়ান (Previous Land Record Not Found)' : 'Unrecorded Parcel (Record Not Found)'}
                </option>
              </optgroup>

              <optgroup label={isBn ? 'অন্যান্য ডেমো রেকর্ড (Traditional Demo Records)' : 'Traditional Demo Records'}>
                {records.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.owner_name_bn} | মৌজা: {r.mouza} — দাগ: {r.dag_no}, খতিয়ান: {r.khatian_no}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Tolerance Slider */}
          <div className="form-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="tolerance-input" style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-main)'
              }}>
                {isBn ? 'ক্ষেত্রফল সহনশীলতা (শতাংশ):' : 'Area Tolerance (Decimal):'}
              </label>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)', fontSize: '0.92rem' }}>
                ±{tolerance} {isBn ? 'শতক' : 'dec'}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '46px' }}>
              <input
                id="tolerance-input"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
              />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                background: 'var(--ground)',
                border: '1px solid #CBD8D2',
                padding: '4px 10px',
                borderRadius: '4px'
              }}>
                ±{tolerance}
              </span>
            </div>
          </div>
        </div>
      </div>

      {comparison && (
        <>
          {/* 1. PREVIOUS RECORD NOT FOUND ALERT (When no matching parcel history exists) */}
          {comparison.has_history === false && (
            <div style={{
              background: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: 'var(--radius-std)',
              padding: '24px',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-hard-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <AlertTriangle size={24} color="#D97706" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#92400E', fontFamily: 'var(--font-heading)' }}>
                  {isBn ? 'পূর্ববর্তী রেকর্ড পাওয়া যায়নি (Previous Land Record Not Found)' : 'Previous Land Record Not Found'}
                </h3>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '0.94rem', color: '#78350F', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                {isBn 
                  ? 'এই দলিলের দাগ বা খতিয়ানের বিপরীতে ২০,০০০ সিন্থেটিক জমি রেকর্ডের ডেটাসেটে কোনো পূর্ববর্তী নিবন্ধিত লেনদেন বা সিএস/এসএ রেকর্ড খুঁজে পাওয়া যায়নি। কোনো কৃত্রিম পূর্ববর্তী তথ্য অনুমান বা তৈরি করা হয়নি। সাব-রেজিস্ট্রি আর্কাইভ ও ভূমি রেকর্ডে সরাসরি অনুসন্ধান প্রয়োজন।'
                  : 'No prior registered transactions or cadastral baseline records were found matching this Dag and Khatian in the 20,000 synthetic land transaction registry. No fabricated prior data has been generated. Direct archival verification is required.'}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                color: '#92400E',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                <Info size={14} />
                <span>{isBn ? 'স্থিতি: পূর্ববর্তী রেকর্ড পাওয়া যায়নি' : 'Status: Previous Land Record Not Found'}</span>
              </div>
            </div>
          )}

          {/* 2. CONFLICT ALERTS (Duplicate sale, Area overlap, History gap) */}
          {comparison.conflict_analysis?.conflicts?.map((conflict, cIdx) => (
            <div key={cIdx} style={{
              background: conflict.severity === 'CRITICAL' ? '#FEF2F2' : (conflict.severity === 'HIGH' ? '#FFF7ED' : '#FEFCE8'),
              border: `2px solid ${conflict.severity === 'CRITICAL' ? '#EF4444' : (conflict.severity === 'HIGH' ? '#F97316' : '#EAB308')}`,
              borderRadius: 'var(--radius-std)',
              padding: '20px 24px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-hard-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {conflict.severity === 'CRITICAL' ? <AlertOctagon size={22} color="#DC2626" /> : <AlertTriangle size={22} color="#D97706" />}
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: conflict.severity === 'CRITICAL' ? '#991B1B' : '#9A3412', fontFamily: 'var(--font-heading)' }}>
                    {isBn ? conflict.title_bn : conflict.title_en}
                  </h3>
                </div>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: conflict.severity === 'CRITICAL' ? '#FEE2E2' : '#FFEDD5',
                  color: conflict.severity === 'CRITICAL' ? '#B91C1C' : '#C2410C',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  border: `1px solid ${conflict.severity === 'CRITICAL' ? '#FCA5A5' : '#FDBA74'}`
                }}>
                  {conflict.code}
                </span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.92rem', color: conflict.severity === 'CRITICAL' ? '#7F1D1D' : '#7C2D12', lineHeight: 1.5 }}>
                {isBn ? conflict.description_bn : conflict.description_en}
              </p>
              {conflict.conflicting_deed_no && (
                <div style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', background: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  <strong>{isBn ? 'দ্বন্দ্বপূর্ণ পূর্ববর্তী দলিল:' : 'Conflicting Prior Deed:'}</strong> {conflict.conflicting_deed_no}
                  {conflict.conflicting_date && ` (${conflict.conflicting_date})`}
                  {conflict.conflicting_buyer && ` • ${isBn ? 'পূর্ববর্তী ক্রেতা:' : 'Prior Buyer:'} ${conflict.conflicting_buyer}`}
                  {conflict.excess_decimals && ` • ${isBn ? 'অতিরিক্ত পরিমাণ:' : 'Excess Area:'} ${conflict.excess_decimals} শতক`}
                </div>
              )}
            </div>
          ))}

          {/* 3. CLEAN TITLE CHAIN BANNER (When no conflict detected) */}
          {comparison.conflict_analysis?.has_history && (!comparison.conflict_analysis?.conflicts || comparison.conflict_analysis.conflicts.length === 0) && (
            <div style={{
              background: '#F0FDF4',
              border: '2px solid #22C55E',
              borderRadius: 'var(--radius-std)',
              padding: '18px 24px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-hard-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={22} color="#16A34A" />
                <h3 style={{ margin: 0, fontSize: '1.14rem', fontWeight: 800, color: '#166534', fontFamily: 'var(--font-heading)' }}>
                  {isBn ? comparison.conflict_analysis.status_label_bn : comparison.conflict_analysis.status_label_en}
                </h3>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#14532D', lineHeight: 1.5 }}>
                {isBn 
                  ? 'এই দলিলের স্বত্বধারার ধারাবাহিকতা এবং হস্তান্তরিত পরিমাণ পূর্ববর্তী লেনদেনের সাথে সামঞ্জস্যপূর্ণ। কোনো দ্বৈত বিক্রয় বা সীমার অতিরিক্ত হস্তান্তরের অমিল পাওয়া যায়নি।'
                  : 'The chain of title and transferred area are consistent with previous transactions on this parcel. No duplicate conveyances or area overlaps detected.'}
              </p>
            </div>
          )}

          {/* 4. SUPPORTING PREVIOUS REGISTERED DEEDS HISTORY TABLE */}
          {comparison.conflict_analysis?.supporting_records?.length > 0 && (
            <div style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius-std)',
              border: '1px solid #CAD7CF',
              boxShadow: 'var(--shadow-hard-sm)',
              overflow: 'hidden',
              marginBottom: '28px'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #CAD7CF',
                background: '#FAFBF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.14rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {isBn ? 'সংশ্লিষ্ট পূর্ববর্তী নিবন্ধিত দলিলের ইতিহাস' : 'Supporting Previous Registered Deeds History'}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {isBn ? 'পার্সেল আইডি:' : 'Parcel ID:'} {comparison.conflict_analysis.parcel_id} • {comparison.conflict_analysis.supporting_records.length} {isBn ? 'টি লেনদেনের রেকর্ড' : 'transactions found'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onViewPassport(comparison.conflict_analysis.parcel_id || (comparison.reference_record && comparison.reference_record.id !== 'auto' ? comparison.reference_record.id : selectedRecordId), comparison)}
                  style={{
                    background: 'var(--ground)',
                    border: '1px solid #CAD7CF',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--primary-accent)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileBadge size={15} />
                  <span>{isBn ? 'পার্সেল পাসপোর্ট ও কিউআর' : 'Parcel Passport & QR'}</span>
                </button>
              </div>

              <div className="table-responsive-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '660px' }}>
                  <thead>
                    <tr style={{
                      background: 'var(--ground)',
                      borderBottom: '2px solid #CBD8D2',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-main)',
                      textTransform: 'uppercase'
                    }}>
                      <th style={{ padding: '10px 16px' }}>{isBn ? 'দলিল নম্বর' : 'Deed No'}</th>
                      <th style={{ padding: '10px 16px' }}>{isBn ? 'তারিখ' : 'Date'}</th>
                      <th style={{ padding: '10px 16px' }}>{isBn ? 'বিক্রেতা' : 'Seller'}</th>
                      <th style={{ padding: '10px 16px' }}>{isBn ? 'ক্রেতা' : 'Buyer'}</th>
                      <th style={{ padding: '10px 16px' }}>{isBn ? 'জমির পরিমাণ' : 'Area'}</th>
                      <th style={{ padding: '10px 16px' }}>{isBn ? 'পূর্ববর্তী সূত্র' : 'Prior Link'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.conflict_analysis.supporting_records.map((tx, idx) => (
                      <tr key={idx} style={{
                        background: idx % 2 === 1 ? '#FAFCF9' : '#FFFFFF',
                        borderBottom: '1px solid #E3EAE6',
                        fontSize: '0.88rem'
                      }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                          {tx.deed_no}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                          {tx.transaction_date}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                          {tx.seller_name_bn}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {tx.buyer_name_bn}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)', fontWeight: 700 }}>
                          {tx.transferred_area} {isBn ? 'শতক' : 'dec'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                          {tx.prior_deed_no || (isBn ? 'সিএস রেকর্ড' : 'CS Record')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Consistency Indicator Card */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1.5px solid var(--text-main)',
            boxShadow: 'var(--shadow-hard)',
            padding: '24px',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Shield size={20} color="var(--primary-accent)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  {isBn 
                    ? comparison.record_consistency_indicator?.label_bn 
                    : comparison.record_consistency_indicator?.label}
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                {comparison.record_consistency_indicator?.caution}
              </p>
              <div style={{
                width: '100%',
                height: '10px',
                background: '#E0EAE5',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${comparison.record_consistency_indicator?.percentage}%`,
                    height: '100%',
                    background: 'var(--primary-accent)',
                    borderRadius: '5px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--primary-accent)',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1
              }}>
                {comparison.record_consistency_indicator?.percentage}%
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '4px', display: 'block', fontFamily: 'var(--font-mono)' }}>
                {isBn ? 'হিসাব সূত্র:' : 'Formula:'} {comparison.record_consistency_indicator?.formula}
              </span>
            </div>
          </div>

          {/* Audit Comparison Table Card */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1px solid #CAD7CF',
            boxShadow: 'var(--shadow-hard-sm)',
            overflow: 'hidden',
            marginBottom: '28px'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #CAD7CF',
              background: '#FAFBF9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h3 style={{
                fontSize: '1.14rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                {isBn ? 'ফিল্ড-ভিত্তিক বিশ্লেষণ ও ফলাফল' : 'Field-by-Field Audit Results'}
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'var(--status-matched-bg)',
                  color: 'var(--status-matched-text)',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  {comparison.status_counts?.Matched || 0} Matched
                </span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'var(--status-mismatch-bg)',
                  color: 'var(--status-mismatch-text)',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  {comparison.status_counts?.Mismatch || 0} Mismatch
                </span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'var(--status-review-bg)',
                  color: 'var(--status-review-text)',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  {comparison.status_counts?.["Needs review"] || 0} Needs Review
                </span>
              </div>
            </div>

            {/* Table wrapper for mobile horizontal scroll */}
            <div className="table-responsive-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '660px' }}>
                <thead>
                  <tr style={{
                    background: 'var(--ground)',
                    borderBottom: '2px solid #CBD8D2',
                    fontSize: '0.84rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-main)',
                    textTransform: 'uppercase'
                  }}>
                    <th style={{ padding: '12px 18px', width: '22%' }}>{isBn ? 'ক্ষেত্রের নাম' : 'Field'}</th>
                    <th style={{ padding: '12px 18px', width: '22%' }}>{isBn ? 'দলিলের মান' : 'Deed Value'}</th>
                    <th style={{ padding: '12px 18px', width: '22%' }}>{isBn ? 'রেফারেন্স রেকর্ড' : 'Reference'}</th>
                    <th style={{ padding: '12px 18px', width: '18%' }}>{isBn ? 'ফলাফল' : 'Status'}</th>
                    <th style={{ padding: '12px 18px', width: '16%' }}>{isBn ? 'পর্যবেক্ষণ' : 'Observation'}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.results?.map((item, idx) => {
                    const isMismatch = item.status === 'Mismatch';
                    const isAlt = idx % 2 === 1;

                    return (
                      <tr
                        key={item.field}
                        id={`result-row-${item.field}`}
                        style={{
                          background: isMismatch ? 'var(--status-mismatch-row)' : (isAlt ? '#FAFCF9' : '#FFFFFF'),
                          borderBottom: '1px solid #E3EAE6',
                          fontSize: '0.9rem'
                        }}
                      >
                        {/* Field */}
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                          {isBn ? item.field_label_bn : item.field_label_en}
                        </td>

                        {/* Extracted Deed Value */}
                        <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 600 }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#F1F5F0',
                            border: '1px solid #CBD8D2'
                          }}>
                            {formatDisplayVal(item.extracted_value)}
                          </span>
                        </td>

                        {/* Baseline Reference Record */}
                        <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#F8FAF8',
                            border: '1px solid #E0E7E3'
                          }}>
                            {formatDisplayVal(item.reference_value)}
                          </span>
                        </td>

                        {/* Status Chip (Icon + Text) */}
                        <td style={{ padding: '14px 18px' }}>
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Reason / Observation */}
                        <td style={{ padding: '14px 18px', fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.45 }}>
                          <div>{item.reason_code}</div>
                          {item.similarity_score !== undefined && item.similarity_score < 1.0 && (
                            <span style={{ display: 'block', color: 'var(--status-review-text)', fontWeight: 700, marginTop: '2px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                              {isBn ? 'সাদৃশ্য স্কোর:' : 'Similarity:'} {Math.round(item.similarity_score * 100)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inconsistency Educational Disclaimer */}
            <div style={{
              padding: '12px 18px',
              background: '#FFF9E6',
              borderTop: '1px solid #F5E29E',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Info size={16} style={{ color: '#8F6B00', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#664D00', lineHeight: 1.45 }}>
                {isBn
                  ? 'সতর্কীকরণ: অমিল বা অসংগতি ধরা পড়ার অর্থ জালিয়াতি নয়; এটি শুধুমাত্র সহকারী কমিশনার (ভূমি) অফিসে গিয়ে বালাম বহি যাচাই করার দিকনির্দেশনা।'
                  : 'Important: Discrepancies represent review flags for official verification, not evidence of fraud or judicial verdict.'}
              </span>
            </div>
          </div>

          {/* AI Plain Language Explainer */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1px solid #CAD7CF',
            borderLeft: '4px solid var(--primary-accent)',
            boxShadow: 'var(--shadow-hard-sm)',
            padding: '20px 24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary-accent)" />
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  {isBn ? 'সহজ ভাষার এআই ব্যাখ্যা' : 'AI Plain Language Explanation'}
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', background: 'var(--ground)', padding: '2px 8px', borderRadius: '4px' }}>
                {comparison.explanation?.provider}
              </span>
            </div>

            <p style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: '0.94rem',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-body)',
              margin: 0
            }}>
              {isBn
                ? comparison.explanation?.explanation_bn
                : comparison.explanation?.explanation_en}
            </p>
          </div>

          {/* Next Steps & Scope Limitations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Box 1: What was NOT checked */}
            <div style={{
              background: '#FEF4F0',
              border: '1px solid #F3BFB3',
              borderRadius: 'var(--radius-std)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9A2C14', marginBottom: '10px' }}>
                <Info size={18} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>
                  {isBn ? 'যা এই সিস্টেমে যাচাই করা হয়নি' : 'What Was NOT Checked'}
                </h4>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#70220F', marginBottom: '10px', lineHeight: 1.5 }}>
                {isBn 
                  ? 'নাগরিক সুরক্ষা সতর্কতা: এই ডিজিটাল ব্যবস্থায় নিচের আইনি বিষয়গুলো যাচাই হয়নি:'
                  : 'Important citizen protection: This automated system intentionally omits:'}
              </p>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.84rem', color: '#70220F', lineHeight: 1.65 }}>
                {comparison.not_checked_items?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Box 2: Next Steps & CTA to Passport */}
            <div style={{
              background: 'var(--white)',
              border: '1px solid #CAD7CF',
              boxShadow: 'var(--shadow-hard-sm)',
              borderRadius: 'var(--radius-std)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-accent)', marginBottom: '10px' }}>
                  <Compass size={18} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {isBn ? 'পরবর্তী সরকারি যাচাইকরণ পদক্ষেপ' : 'Recommended Next Steps'}
                  </h4>
                </div>
                <ul style={{ paddingLeft: '18px', margin: '0 0 16px', fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.65 }}>
                  {comparison.next_official_steps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <button
                id="view-passport-btn"
                type="button"
                onClick={() => {
                  const targetId = comparison.conflict_analysis?.parcel_id || (comparison.reference_record && comparison.reference_record.id !== 'auto' ? comparison.reference_record.id : selectedRecordId);
                  onViewPassport(targetId, comparison);
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '46px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  boxShadow: 'var(--shadow-hard-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '44px'
                }}
              >
                <FileBadge size={17} />
                <span>{isBn ? 'সম্পূর্ণ প্লট পাসপোর্ট দেখুন →' : 'View Full Plot Passport →'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
