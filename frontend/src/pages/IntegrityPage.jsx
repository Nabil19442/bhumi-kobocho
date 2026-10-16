import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  ShieldCheck, 
  Info, 
  FileCode2,
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { fetchRecords, fetchRecordQr, checkIntegrityApi } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function IntegrityPage({ t, lang }) {
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('rec-demo-001');
  const [qrData, setQrData] = useState(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setError(null);
    try {
      const data = await fetchRecords();
      if (data && data.records) {
        setRecords(data.records);
        const first = data.records.find(r => r.id === selectedRecordId) || data.records[0];
        if (first && !expectedHash) {
          setExpectedHash(first.file_hash_sha256);
        }
      }
      if (selectedRecordId) {
        const qr = await fetchRecordQr(selectedRecordId);
        setQrData(qr);
        if (qr && qr.stored_hash) {
          setExpectedHash(qr.stored_hash);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRecordId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsChecking(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expected_hash', expectedHash);
      const res = await checkIntegrityApi(formData);
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSimulateCheck = async (simulateModified) => {
    setIsChecking(true);
    setError(null);
    try {
      const formData = new FormData();
      const content = simulateModified
        ? 'Modified sample deed content - Byte alteration simulated'
        : 'Exact authentic sample deed bytes matching record';
      
      const fileBlob = new Blob([content], { type: 'text/plain' });
      formData.append('file', fileBlob, simulateModified ? 'tampered_deed.pdf' : 'deed_sample_001.png');

      if (!simulateModified) {
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
        const hashArray = Array.from(new Uint8Array(buffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        formData.append('expected_hash', hashHex);
      } else {
        formData.append('expected_hash', expectedHash);
      }

      const res = await checkIntegrityApi(formData);
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block">
        <h2 className="page-title">
          <QrCode size={28} style={{ color: 'var(--emerald-primary)' }} />
          {t.integrity_heading}
        </h2>
        <p className="page-subtitle">{t.integrity_subheading}</p>
      </div>

      <ApiErrorNotice error={error} onRetry={loadData} title="Integrity Service Unavailable" />

      {/* Record Selector Card */}
      <div className="saas-card">
        <div className="saas-card-header">
          <h3 className="saas-card-title">
            <Database size={18} style={{ color: 'var(--cyan-secondary)' }} />
            {t.select_plot_record}
          </h3>
          <span className="status-pill not-checked">SHA-256 BIT LEVEL HASH</span>
        </div>

        <div className="grid-cols-2">
          <div className="form-field">
            <label className="field-label-row" htmlFor="integrity-record-select">
              <span>{t.reference_select_label}</span>
            </label>
            <select
              id="integrity-record-select"
              className="field-select"
              value={selectedRecordId}
              onChange={(e) => {
                const recId = e.target.value;
                setSelectedRecordId(recId);
                const r = records.find(x => x.id === recId);
                if (r) setExpectedHash(r.file_hash_sha256);
                setVerificationResult(null);
              }}
            >
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.owner_name_bn} (Khatian: {r.khatian_no}, Dag: {r.dag_no})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="field-label-row" htmlFor="expected-hash-input">
              <span>{t.expected_sha256_label}</span>
            </label>
            <input
              id="expected-hash-input"
              className="field-input"
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem' }}
            />
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* File Verification Form */}
        <div className="saas-card">
          <h3 className="saas-card-title" style={{ marginBottom: '6px' }}>
            <Upload size={18} style={{ color: 'var(--emerald-primary)' }} />
            {t.upload_for_hash}
          </h3>
          <p className="saas-card-desc">
            {t.upload_compute_hash_desc}
          </p>

          <div style={{ marginTop: '16px' }}>
            <input
              id="integrity-file-input"
              type="file"
              className="field-input"
              onChange={handleFileUpload}
              style={{ padding: '8px 12px' }}
            />
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              {t.quick_test_label}
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                id="test-unmodified-btn"
                className="btn-secondary"
                onClick={() => handleSimulateCheck(false)}
                disabled={isChecking}
              >
                <CheckCircle2 size={15} style={{ color: 'var(--emerald-light)' }} />
                <span>{t.test_unchanged_btn}</span>
              </button>
              <button
                id="test-modified-btn"
                className="btn-secondary"
                onClick={() => handleSimulateCheck(true)}
                disabled={isChecking}
              >
                <XCircle size={15} style={{ color: 'var(--rose-mismatch)' }} />
                <span>{t.test_changed_btn}</span>
              </button>
            </div>
          </div>

          {/* Verification Results Feedback */}
          {verificationResult && (
            <div
              id="integrity-result-banner"
              style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: verificationResult.is_intact ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
                border: `1px solid ${verificationResult.is_intact ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {verificationResult.is_intact ? (
                  <CheckCircle2 size={22} style={{ color: 'var(--emerald-light)' }} />
                ) : (
                  <XCircle size={22} style={{ color: 'var(--rose-mismatch)' }} />
                )}
                <div>
                  <h4 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: verificationResult.is_intact ? 'var(--status-matched-text)' : 'var(--status-mismatch-text)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {verificationResult.status === 'Unchanged' ? t.hash_unchanged : t.hash_changed}
                  </h4>
                  <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                    Standard Status: <strong style={{ color: 'var(--ink)' }}>{verificationResult.status}</strong>
                  </small>
                </div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--ink)' }}>
                <div style={{ marginBottom: '4px' }}><strong>Computed SHA-256:</strong> {verificationResult.calculated_sha256}</div>
                <div><strong>Recorded SHA-256:</strong> {verificationResult.expected_sha256}</div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.84rem', color: 'var(--status-review-text)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Info size={14} style={{ flexShrink: 0 }} />
                <span>{verificationResult.notice}</span>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Presentation */}
        <div className="saas-card" style={{ textAlign: 'center' }}>
          <h3 className="saas-card-title" style={{ justifyContent: 'center' }}>
            <QrCode size={18} style={{ color: 'var(--accent)' }} />
            {t.qr_heading}
          </h3>
          <p className="saas-card-desc">
            {t.integrity_subheading}
          </p>

          {qrData && qrData.qr_base64 && (
            <div style={{ display: 'inline-block', background: 'var(--white)', padding: '14px', borderRadius: 'var(--radius-std)', border: '1px solid var(--line)', margin: '16px 0' }}>
              <img
                src={qrData.qr_base64}
                alt="Record QR Code"
                style={{ width: '160px', height: '160px', display: 'block' }}
              />
              <span style={{ color: 'var(--ink)', fontSize: '0.74rem', fontWeight: 700, display: 'block', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                {qrData.record_id}
              </span>
            </div>
          )}

          <div style={{ textAlign: 'left', background: 'var(--paper)', padding: '12px 16px', borderRadius: 'var(--radius-std)', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
              🔒 <strong>{t.crypto_principle_title}:</strong> {t.crypto_principle_text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
