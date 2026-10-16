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
  FileBadge
} from 'lucide-react';
import { compareRecordsApi, fetchRecords } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function ComparePage({ t, lang = 'bn', sharedExtractedData, onViewPassport, onComparisonUpdated }) {
  const isBn = lang === 'bn';
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('rec-demo-001');
  const [tolerance, setTolerance] = useState(0.05);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRecords = async () => {
    try {
      const data = await fetchRecords();
      if (data && data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const runComparison = async (refId = selectedRecordId, tol = tolerance) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        reference_record_id: refId,
        extracted_data: sharedExtractedData || {
          owner_name: 'মোঃ রফিকুল ইসলাম',
          khatian_no: '412',
          dag_no: '1058',
          area_decimal: '15.5',
          document_date: '2021-04-12',
        },
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
    <div className="app-viewport" style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', padding: '32px var(--gutter-desktop)' }}>
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '32px' }}>
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
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.owner_name_bn} | মৌজা: {r.mouza} — দাগ: {r.dag_no}, খতিয়ান: {r.khatian_no}
                </option>
              ))}
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
                            {item.extracted_value !== null ? String(item.extracted_value) : '—'}
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
                            {item.reference_value !== null ? String(item.reference_value) : '—'}
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
                onClick={() => onViewPassport(selectedRecordId, comparison)}
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
