import React, { useState, useEffect } from 'react';
import { 
  GitCompareArrows, 
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
  RefreshCw
} from 'lucide-react';
import { compareRecordsApi, fetchRecords } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function ComparePage({ t, lang, sharedExtractedData, onViewPassport, onComparisonUpdated }) {
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

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="status-pill matched">
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>{t.status_matched}</span>
          </span>
        );
      case 'Mismatch':
        return (
          <span className="status-pill mismatch">
            <XCircle size={13} aria-hidden="true" />
            <span>{t.status_mismatch}</span>
          </span>
        );
      case 'Needs review':
        return (
          <span className="status-pill needs-review">
            <AlertTriangle size={13} aria-hidden="true" />
            <span>{t.status_needs_review}</span>
          </span>
        );
      default:
        return (
          <span className="status-pill not-checked">
            <HelpCircle size={13} aria-hidden="true" />
            <span>{t.status_not_checked}</span>
          </span>
        );
    }
  };

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block">
        <h2 className="page-title">
          <GitCompareArrows size={28} style={{ color: 'var(--emerald-primary)' }} />
          {t.compare_heading}
        </h2>
        <p className="page-subtitle">{t.compare_subheading}</p>
      </div>

      <ApiErrorNotice error={error} onRetry={handleRetry} title="Comparison Service Unavailable" />

      {/* Control Configuration Card */}
      <div className="saas-card">
        <div className="saas-card-header">
          <h3 className="saas-card-title">
            <Sliders size={18} style={{ color: 'var(--cyan-secondary)' }} />
            {t.audit_parameters_title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isLoading && (
              <span className="status-pill needs-review" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={11} className="spin" />
                <span>Running Comparison...</span>
              </span>
            )}
            <span className="status-pill not-checked">DETERMINISTIC RULE ENGINE</span>
          </div>
        </div>

        <div className="grid-cols-2">
          <div className="form-field">
            <label className="field-label-row" htmlFor="ref-record-select">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={14} />
                {t.reference_select_label}
              </span>
            </label>
            <select
              id="ref-record-select"
              className="field-select"
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
            >
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.owner_name_bn} | Mouza: {r.mouza} &mdash; Dag: {r.dag_no}, Khatian: {r.khatian_no}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="field-label-row" htmlFor="tolerance-input">
              <span>{t.area_tolerance_label}</span>
              <strong style={{ color: 'var(--emerald-light)' }}>{tolerance} dec</strong>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '42px' }}>
              <input
                id="tolerance-input"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--emerald-primary)', cursor: 'pointer' }}
              />
              <span className="code-badge" style={{ minWidth: '70px', textAlign: 'center' }}>
                &plusmn;{tolerance} dec
              </span>
            </div>
          </div>
        </div>
      </div>

      {comparison && (
        <>
          {/* Consistency Indicator Card */}
          <div className="consistency-card">
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)' }}>
                  {lang === 'bn' 
                    ? comparison.record_consistency_indicator?.label_bn 
                    : comparison.record_consistency_indicator?.label}
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--muted)', marginTop: '4px' }}>
                {comparison.record_consistency_indicator?.caution}
              </p>
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${comparison.record_consistency_indicator?.percentage}%` }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {comparison.record_consistency_indicator?.percentage}%
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '4px', display: 'block', fontFamily: 'var(--font-mono)' }}>
                Formula: {comparison.record_consistency_indicator?.formula}
              </span>
            </div>
          </div>

          {/* Audit Comparison Table */}
          <div className="saas-card">
            <div className="saas-card-header">
              <h3 className="saas-card-title">
                {t.audit_table_heading}
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="status-pill matched">{comparison.status_counts?.Matched || 0} Matched</span>
                <span className="status-pill mismatch">{comparison.status_counts?.Mismatch || 0} Mismatch</span>
                <span className="status-pill needs-review">{comparison.status_counts?.["Needs review"] || 0} Needs Review</span>
              </div>
            </div>

            <div className="saas-table-wrapper">
              <table className="saas-table" id="comparison-results-table">
                <thead>
                  <tr>
                    <th>{t.th_field}</th>
                    <th>{t.th_extracted}</th>
                    <th>{t.th_reference}</th>
                    <th>{t.th_status}</th>
                    <th>{t.th_reason}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.results?.map((item) => (
                    <tr key={item.field} id={`result-row-${item.field}`} className={item.status === 'Mismatch' ? 'mismatch-row' : ''}>
                      <td style={{ fontWeight: 700, color: 'var(--ink)' }}>
                        {lang === 'bn' ? item.field_label_bn : item.field_label_en}
                      </td>
                      <td>
                        <span className="code-badge">
                          {item.extracted_value !== null ? String(item.extracted_value) : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="code-badge">
                          {item.reference_value !== null ? String(item.reference_value) : '—'}
                        </span>
                      </td>
                      <td>{renderStatusBadge(item.status)}</td>
                      <td>
                        <span style={{ fontSize: '0.86rem', color: 'var(--ink-soft)' }}>
                          {item.reason_code}
                          {item.similarity_score !== undefined && item.similarity_score < 1.0 && (
                            <span style={{ display: 'block', color: 'var(--status-review-text)', fontWeight: 600, marginTop: '2px' }}>
                              Phonetic similarity: {Math.round(item.similarity_score * 100)}%
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Plain Language Explainer */}
          <div className="saas-card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="saas-card-header">
              <h3 className="saas-card-title">
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                {t.explainer_heading}
              </h3>
              <span className="status-pill not-checked">
                {comparison.explanation?.provider}
              </span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.94rem', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
              {lang === 'bn'
                ? comparison.explanation?.explanation_bn
                : comparison.explanation?.explanation_en}
            </div>
          </div>

          {/* Next Steps & Scope Limitations */}
          <div className="grid-cols-2">
            <div className="saas-card">
              <h4 className="saas-card-title" style={{ fontSize: '1rem', color: 'var(--status-review-text)' }}>
                <Info size={16} />
                {t.not_checked_heading}
              </h4>
              <p className="saas-card-desc">
                {t.not_checked_warning_text}
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '12px', fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: '1.8' }}>
                {comparison.not_checked_items?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 className="saas-card-title" style={{ fontSize: '1rem', color: 'var(--accent)' }}>
                  <Shield size={16} />
                  {t.next_steps_heading}
                </h4>
                <p className="saas-card-desc">
                  {t.next_steps_desc}
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '12px', fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: '1.8' }}>
                  {comparison.next_official_steps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  id="view-passport-btn"
                  className="btn-primary"
                  onClick={() => onViewPassport(selectedRecordId, comparison)}
                  style={{ width: '100%' }}
                >
                  <span>{t.view_passport_btn}</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
