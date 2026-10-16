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
  RefreshCw,
  Hash,
  Lock,
  FileCheck2,
  AlertTriangle,
  Download,
  Printer,
  Camera,
  ExternalLink
} from 'lucide-react';
import { fetchRecords, fetchRecordQr, checkIntegrityApi } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';
import QrScannerModal from '../components/QrScannerModal';

export default function IntegrityPage({ t, lang = 'bn', onOpenVerification }) {
  const isBn = lang === 'bn';
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('rec-demo-001');
  const [qrData, setQrData] = useState(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const loadData = async () => {
    setError(null);
    setQrLoading(true);
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
        const qr = await fetchRecordQr(selectedRecordId, window.location.origin);
        setQrData(qr);
        if (qr && qr.stored_hash) {
          setExpectedHash(qr.stored_hash);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQr = () => {
    const src = qrData?.qr_code_base64 || qrData?.qr_base64;
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `bhumi_kobocho_qr_${selectedRecordId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintQr = () => {
    const src = qrData?.qr_code_base64 || qrData?.qr_base64;
    const currentRec = records.find(r => r.id === selectedRecordId) || {};
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Verification Card - ${selectedRecordId}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: #FBFCFA; }
            .card { border: 2px solid #10272A; border-radius: 8px; padding: 24px; max-width: 360px; margin: 0 auto; background: #FFFFFF; }
            img { width: 180px; height: 180px; margin: 16px 0; }
            .disclaimer { font-size: 11px; color: #713F12; background: #FEF9C3; padding: 8px; border-radius: 4px; margin-top: 16px; border: 1px solid #FDE047; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 style="margin: 0; color: #10272A;">ভূমি কবচ (Bhumi Kobocho)</h2>
            <p style="font-size: 14px; margin: 4px 0 12px; color: #2D4649;">ডিজিটাল কিউআর সনদ কার্ড</p>
            <p style="margin: 4px 0;"><strong>রেকর্ড আইডি:</strong> ${selectedRecordId}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>মৌজা:</strong> ${currentRec.mouza || 'N/A'} | <strong>দাগ:</strong> ${currentRec.dag_no || 'N/A'}</p>
            ${src ? `<img src="${src}" alt="QR Code" />` : ''}
            <div class="disclaimer">DEMO DATA — not a legal verdict. Scan with smartphone camera to open verification page.</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      <div className="page-header-block" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            padding: '8px',
            borderRadius: 'var(--radius-std)',
            display: 'flex'
          }}>
            <Lock size={24} />
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
              {isBn ? 'কিউআর ও SHA-256 ফাইল সত্যতা যাচাই' : 'QR & SHA-256 Bit Integrity Verification'}
            </h1>
            <p style={{
              fontSize: '0.96rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              margin: '4px 0 0'
            }}>
              {isBn 
                ? 'ক্রিপ্টোগ্রাফিক হ্যাশের মাধ্যমে ফাইলের প্রতিটি বিটের ডিজিটাল অবিকৃত অবস্থা নিশ্চিত করুন।' 
                : 'Cryptographically verify file integrity against recorded SHA-256 digital fingerprint.'}
            </p>
          </div>
        </div>
      </div>

      <ApiErrorNotice error={error} onRetry={loadData} title={isBn ? 'সত্যতা যাচাই সেবা সাময়িকভাবে উপলব্ধ নয়' : 'Integrity Service Unavailable'} />

      {/* Record Selector & Expected Hash Card */}
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
            <Database size={18} color="var(--primary-accent)" />
            <span>{isBn ? 'প্লট রেকর্ড ও রেফারেন্স হ্যাশ নির্বাচন' : 'Plot Record & Reference Hash'}</span>
          </h3>
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
            SHA-256 CRYTOGRAPHIC DIGEST
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <div className="form-field">
            <label htmlFor="integrity-record-select" style={{
              display: 'block',
              fontSize: '0.86rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              marginBottom: '6px'
            }}>
              {isBn ? 'রেফারেন্স রেকর্ড নির্বাচন:' : 'Select Baseline Record:'}
            </label>
            <select
              id="integrity-record-select"
              value={selectedRecordId}
              onChange={(e) => {
                const recId = e.target.value;
                setSelectedRecordId(recId);
                const r = records.find(x => x.id === recId);
                if (r) setExpectedHash(r.file_hash_sha256);
                setVerificationResult(null);
              }}
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
                  {r.id}: {r.owner_name_bn} (খতিয়ান: {r.khatian_no}, দাগ: {r.dag_no})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="expected-hash-input" style={{
              display: 'block',
              fontSize: '0.86rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              marginBottom: '6px'
            }}>
              {isBn ? 'প্রত্যাশিত রেফারেন্স SHA-256 ফিঙ্গারপ্রিন্ট:' : 'Expected Reference SHA-256 Hash:'}
            </label>
            <input
              id="expected-hash-input"
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              style={{
                width: '100%',
                height: '46px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                border: '1.5px solid #CAD7CF',
                background: 'var(--paper)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-mono)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Upload & Test + QR Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'stretch',
        marginBottom: '28px'
      }}>
        {/* Left Card: File Upload & Simulation Tests */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-std)',
          border: '1px solid #CAD7CF',
          boxShadow: 'var(--shadow-hard-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.14rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Upload size={18} color="var(--primary-accent)" />
              <span>{isBn ? 'হ্যাশ যাচাইয়ের জন্য দলিল আপলোড করুন' : 'Upload Deed for Hash Verification'}</span>
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: '0 0 16px' }}>
              {isBn 
                ? 'SHA-256 ডাইজেস্ট গণনার জন্য লোকাল কম্পিউটার বা ফোন থেকে ফাইল নির্বাচন করুন:' 
                : 'Upload document file from local storage to compute SHA-256 digest:'}
            </p>

            <div style={{ marginBottom: '18px' }}>
              <input
                id="integrity-file-input"
                type="file"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-std)',
                  border: '1.5px dashed #9AAFAA',
                  background: '#F8FAF8',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Quick Test Buttons */}
            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid #CAD7CF'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                {isBn ? 'অথবা এক ক্লিকে টেস্ট সিনারিও চালান:' : 'Or run quick simulation checks:'}
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  id="test-unmodified-btn"
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleSimulateCheck(false)}
                  disabled={isChecking}
                  style={{
                    height: '42px',
                    padding: '0 14px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid var(--text-main)',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  <CheckCircle2 size={16} color="#14633A" />
                  <span>{isBn ? 'টেস্ট ০১: মূল অবিকৃত দলিল' : 'Test 1: Authentic File'}</span>
                </button>

                <button
                  id="test-modified-btn"
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleSimulateCheck(true)}
                  disabled={isChecking}
                  style={{
                    height: '42px',
                    padding: '0 14px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid var(--text-main)',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  <XCircle size={16} color="#9A2C14" />
                  <span>{isBn ? 'টেস্ট ০২: পরিবর্তিত দলিল' : 'Test 2: Tampered File'}</span>
                </button>
              </div>
            </div>

            {/* Checking State Spinner */}
            {isChecking && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-accent)' }}>
                <RefreshCw size={16} className="spin" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{isBn ? 'SHA-256 হ্যাশ গণনা চলছে...' : 'Computing SHA-256 hash...'}</span>
              </div>
            )}

            {/* Verification Result Banner */}
            {verificationResult && !isChecking && (
              <div
                id="integrity-result-banner"
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: 'var(--radius-std)',
                  background: verificationResult.is_intact ? 'var(--status-matched-bg)' : 'var(--status-mismatch-bg)',
                  border: `1.5px solid ${verificationResult.is_intact ? 'var(--status-matched-border)' : 'var(--status-mismatch-border)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {verificationResult.is_intact ? (
                    <CheckCircle2 size={20} color="var(--status-matched-text)" />
                  ) : (
                    <XCircle size={20} color="var(--status-mismatch-text)" />
                  )}
                  <strong style={{
                    fontSize: '1rem',
                    fontFamily: 'var(--font-heading)',
                    color: verificationResult.is_intact ? 'var(--status-matched-text)' : 'var(--status-mismatch-text)'
                  }}>
                    {verificationResult.is_intact 
                      ? (isBn ? 'ফাইলের হ্যাশ মিলেছে (Unchanged)' : 'Hash Matched (Unchanged)')
                      : (isBn ? 'ফাইলের বিষয়বস্তু বদলেছে (File content changed)' : 'File Content Changed (Mismatch)')}
                  </strong>
                </div>

                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--text-main)', marginTop: '6px' }}>
                  <strong>{isBn ? 'গণনাকৃত হ্যাশ:' : 'Calculated Hash:'}</strong> {verificationResult.calculated_sha256}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Functional Digital QR Code Hub */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-std)',
          border: '1px solid #CAD7CF',
          boxShadow: 'var(--shadow-hard-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
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
                <QrCode size={18} color="var(--primary-accent)" />
                <span>{isBn ? 'প্লটের ডিজিটাল কিউআর কোড' : 'Plot Digital QR Fingerprint'}</span>
              </h3>

              <button
                type="button"
                id="open-qr-scanner-btn"
                className="btn-primary"
                onClick={() => setScannerOpen(true)}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'var(--primary-accent)',
                  color: '#FFFFFF',
                  border: '1.5px solid var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Camera size={14} />
                <span>{isBn ? 'কিউআর স্ক্যান করুন' : 'Scan QR'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: '0 0 16px' }}>
              {isBn
                ? 'স্মার্টফোন বা ওয়েবক্যাম দিয়ে স্ক্যান করে সরাসরি এই প্লটের অনুমোদিত ডেটা সারসংক্ষেপ খুলুন।'
                : 'Scan with smartphone camera or webcam to inspect the verified record summary.'}
            </p>

            {/* QR Code Container */}
            <div style={{
              textAlign: 'center',
              background: 'var(--paper)',
              padding: '16px',
              borderRadius: 'var(--radius-std)',
              border: '1px solid #CAD7CF',
              marginBottom: '16px',
              position: 'relative'
            }}>
              {qrLoading ? (
                <div style={{ padding: '36px 0', color: 'var(--primary-accent)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.82rem' }}>{isBn ? 'কিউআর তৈরি হচ্ছে...' : 'Generating QR code...'}</span>
                </div>
              ) : (qrData && (qrData.qr_code_base64 || qrData.qr_base64)) ? (
                <div>
                  <img
                    src={qrData.qr_code_base64 || qrData.qr_base64}
                    alt="QR Code"
                    style={{ width: '150px', height: '150px', display: 'block', margin: '0 auto', background: '#FFFFFF', padding: '6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                  />
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginTop: '8px' }}>
                    {selectedRecordId}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                    {window.location.origin}/verify/{selectedRecordId}
                  </span>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      id="download-qr-btn"
                      className="btn-secondary"
                      onClick={handleDownloadQr}
                      style={{
                        height: '32px',
                        padding: '0 10px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-std)',
                        border: '1px solid var(--text-main)',
                        background: '#FFFFFF',
                        color: 'var(--text-main)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={13} />
                      <span>{isBn ? 'ডাউনলোড PNG' : 'Download PNG'}</span>
                    </button>

                    <button
                      type="button"
                      id="print-qr-btn"
                      className="btn-secondary"
                      onClick={handlePrintQr}
                      style={{
                        height: '32px',
                        padding: '0 10px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-std)',
                        border: '1px solid var(--text-main)',
                        background: '#FFFFFF',
                        color: 'var(--text-main)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Printer size={13} />
                      <span>{isBn ? 'প্রিন্ট কিউআর' : 'Print QR'}</span>
                    </button>

                    {onOpenVerification && (
                      <button
                        type="button"
                        id="open-verify-page-btn"
                        className="btn-secondary"
                        onClick={() => onOpenVerification(selectedRecordId)}
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-std)',
                          border: '1px solid var(--primary-accent)',
                          background: 'var(--accent-tint)',
                          color: 'var(--primary-accent)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>{isBn ? 'যাচাই পেজ দেখুন' : 'Verify View'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: '0.84rem' }}>
                  {isBn ? 'কিউআর কোড লোড করা যায়নি' : 'Unable to load QR code'}
                </div>
              )}
            </div>

            {/* Verification Summary Breakdown Box */}
            <div style={{
              background: '#F8FAF9',
              border: '1px solid #CAD7CF',
              borderRadius: 'var(--radius-std)',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '8px' }}>
                {isBn ? 'যাচাইকরণ সারসংক্ষেপ (Verification Summary)' : 'Verification Summary'}
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-body)' }}>{isBn ? 'রেকর্ড অস্তিত্ব:' : 'Record Reference:'}</span>
                  <span style={{ color: '#15803D', fontWeight: 700 }}>{isBn ? 'বিদ্যমান (Matched)' : 'Matched'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-body)' }}>{isBn ? 'ফাইল হ্যাশ স্ট্যাটাস:' : 'File Hash Status:'}</span>
                  <span style={{ color: verificationResult ? (verificationResult.is_intact ? '#15803D' : '#991B1B') : '#6B7280', fontWeight: 700 }}>
                    {verificationResult 
                      ? (verificationResult.is_intact ? (isBn ? 'মিলেছে (Matched)' : 'Matched') : (isBn ? 'অমিল (Mismatch)' : 'Mismatch'))
                      : (isBn ? 'যাচাই করা হয়নি (Not checked)' : 'Not checked')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-body)' }}>{isBn ? 'বায়া ও চেইন নিরীক্ষা:' : 'Review Status:'}</span>
                  <span style={{ color: selectedRecordId === 'rec-demo-001' ? '#C2410C' : '#15803D', fontWeight: 700 }}>
                    {selectedRecordId === 'rec-demo-001' 
                      ? (isBn ? 'পর্যালোচনা প্রয়োজন (Needs review)' : 'Needs review')
                      : (isBn ? 'সঙ্গতিপূর্ণ (Matched)' : 'Matched')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div style={{
            padding: '12px 14px',
            background: '#F1F5F0',
            border: '1px solid #CBD8D2',
            borderRadius: 'var(--radius-std)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Info size={16} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {isBn 
                ? 'ক্রিপ্টোগ্রাফিক মূলনীতি: ডিজিটাল হ্যাশ শুধুমাত্র ফাইলের প্রতিটি বিটের অবিকৃত অবস্থা যাচাই করে। এটি কোনো আদালতের রায় বা মালিকানা সনদ নয়।' 
                : 'Cryptographic principle: File hashing proves bit-level immutability; it does not confer legal ownership or court title.'}
            </span>
          </div>
        </div>
      </div>

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(scannedId) => {
          setSelectedRecordId(scannedId);
          if (onOpenVerification) {
            onOpenVerification(scannedId);
          }
        }}
        lang={lang}
      />
    </div>
  );
}
