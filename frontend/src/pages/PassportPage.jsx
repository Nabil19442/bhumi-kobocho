import React, { useState, useEffect } from 'react';
import { 
  FileBadge, 
  Printer, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertOctagon, 
  Hash, 
  Layers, 
  FileText,
  User,
  QrCode,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { fetchPlotPassport, fetchRecords } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function PassportPage({ t, lang, selectedPlotId = 'rec-demo-001', comparisonResult, sharedExtractedData }) {
  const [plotId, setPlotId] = useState(selectedPlotId);
  const [passport, setPassport] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = () => {
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchRecords()
        .then(data => {
          if (data && data.records) setRecords(data.records);
        }),
      fetchPlotPassport(plotId, lang)
        .then(data => {
          setPassport(data);
        })
    ])
      .catch(err => {
        console.error(err);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [plotId, lang]);

  const handlePrint = () => {
    window.print();
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

  if (isLoading && !passport) {
    return (
      <div className="app-viewport" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw size={24} className="spin" style={{ color: 'var(--cyan-secondary)', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Citizen Plot Passport...</p>
      </div>
    );
  }

  if (error && !passport) {
    return (
      <div className="app-viewport" style={{ padding: '40px 20px' }}>
        <ApiErrorNotice error={error} onRetry={loadData} title="Unable to load Plot Passport" />
      </div>
    );
  }

  if (!passport) {
    return null;
  }

  const rec = passport.record || {};
  // Use active comparison result if available, or fall back to passport baseline comparison
  const activeComparison = comparisonResult || passport.comparison_summary;

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="page-title">
              <FileBadge size={28} style={{ color: 'var(--emerald-primary)' }} />
              {t.passport_heading}
            </h2>
            <p className="page-subtitle">{t.passport_subheading}</p>
          </div>
          <button id="print-passport-btn" className="btn-secondary" onClick={handlePrint}>
            <Printer size={15} />
            <span>{t.print_btn}</span>
          </button>
        </div>
      </div>

      <ApiErrorNotice error={error} onRetry={loadData} title="Unable to refresh Plot Passport" />

      {/* Record Selector Card */}
      <div className="saas-card" style={{ padding: '16px 20px' }}>
        <div className="form-field">
          <label className="field-label-row" htmlFor="passport-plot-picker">
            <span>{t.select_plot_record}</span>
            <span className="code-badge">{t.plot_id_label}: {plotId}</span>
          </label>
          <select
            id="passport-plot-picker"
            className="field-select"
            value={plotId}
            onChange={(e) => setPlotId(e.target.value)}
          >
            {records.map(r => (
              <option key={r.id} value={r.id}>
                {r.id}: {r.owner_name_bn} &mdash; Mouza: {r.mouza} (Dag: {r.dag_no}, Khatian: {r.khatian_no})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Passport Card */}
      <div className="saas-card" style={{ border: '1.5px solid var(--line)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="status-pill matched">
                <ShieldCheck size={13} />
                PLOT PASSPORT SPECIMEN
              </span>
              <span className="code-badge">{passport.plot_id}</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.2px' }}>
              {lang === 'bn' ? rec.owner_name_bn : rec.owner_name_en}
            </h3>
            <p style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginTop: '4px' }}>
              <MapPin size={15} style={{ color: 'var(--accent)' }} />
              <span>{rec.mouza}, Upazila: {rec.upazila}, District: {rec.district}</span>
            </p>
          </div>

          {/* QR Code */}
          {passport.qr_code_base64 && (
            <div style={{ textAlign: 'center', background: 'var(--white)', padding: '10px', borderRadius: 'var(--radius-std)', border: '1px solid var(--line)' }}>
              <img
                src={passport.qr_code_base64}
                alt="Plot Passport QR Fingerprint"
                style={{ width: '120px', height: '120px', display: 'block' }}
              />
              <span style={{ color: 'var(--ink)', fontSize: '0.68rem', fontWeight: 700, display: 'block', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                DEMO DIGITAL FINGERPRINT
              </span>
            </div>
          )}
        </div>

        {/* 6 Core Specimen Attributes */}
        <div className="grid-cols-3" style={{ marginTop: '22px', background: 'var(--paper)', padding: '16px', borderRadius: 'var(--radius-std)', border: '1px solid var(--line)' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{t.field_khatian}</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>{rec.khatian_no}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{t.field_dag}</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>{rec.dag_no}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{t.recorded_area}</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              {rec.area_decimal} Decimal (শতাংশ)
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{t.land_class}</span>
            <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{rec.land_class}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{t.last_mutation}</span>
            <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{rec.last_mutation_case}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{t.deed_date_label}</span>
            <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{rec.deed_no} ({rec.document_date})</div>
          </div>
        </div>
      </div>

      {/* Integrated Verification & Comparison Audit Section (Workflow 5) */}
      {activeComparison && (
        <div className="saas-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="saas-card-header">
            <div>
              <h3 className="saas-card-title">
                <FileCheck2 size={18} style={{ color: 'var(--accent)' }} />
                {t.integrated_audit_title}
              </h3>
              <p className="saas-card-desc">{t.integrated_audit_sub}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="code-badge">
                Consistency: {activeComparison.record_consistency_indicator?.percentage}%
              </span>
            </div>
          </div>

          <div className="saas-table-wrapper" style={{ marginTop: '12px' }}>
            <table className="saas-table">
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
                {activeComparison.results?.map((item) => (
                  <tr key={item.field} className={item.status === 'Mismatch' ? 'mismatch-row' : ''}>
                    <td style={{ fontWeight: 600, color: 'var(--ink)' }}>
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
                      <span style={{ fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
                        {item.reason_code}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record History Timeline */}
      <div className="saas-card">
        <h3 className="saas-card-title">
          <Calendar size={18} style={{ color: 'var(--cyan-secondary)' }} />
          {t.timeline_heading}
        </h3>
        <p className="saas-card-desc">{t.timeline_desc}</p>

        <div className="timeline-track">
          {passport.timeline?.map((step, idx) => (
            <div key={idx} className="timeline-step">
              <div className="timeline-marker" />
              <div className="timeline-year-tag">{step.year} &mdash; {step.date}</div>
              <div className="timeline-step-title">{lang === 'bn' ? step.title_bn : step.title_en}</div>
              <div className="timeline-step-desc">{lang === 'bn' ? step.detail_bn : step.detail_en}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What Was NOT Checked & Next Steps Grid */}
      <div className="grid-cols-2">
        <div className="saas-card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <h4 className="saas-card-title" style={{ color: 'var(--amber-warn)', fontSize: '0.96rem' }}>
            <AlertOctagon size={16} />
            {t.not_checked_heading}
          </h4>
          <p className="saas-card-desc">
            {t.not_checked_warning_text}
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            {passport.not_checked_items?.map((item, idx) => (
              <li key={idx}><strong>{item}</strong></li>
            ))}
          </ul>
        </div>

        <div className="saas-card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <h4 className="saas-card-title" style={{ color: 'var(--emerald-light)', fontSize: '0.96rem' }}>
            <ShieldCheck size={16} />
            {t.next_steps_heading}
          </h4>
          <p className="saas-card-desc">
            {t.next_steps_desc}
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '12px', fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: '1.8' }}>
            {passport.next_official_steps?.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
