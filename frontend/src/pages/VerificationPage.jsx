import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Download, 
  Printer, 
  Upload, 
  RefreshCw, 
  Hash, 
  QrCode, 
  ArrowLeft,
  FileBadge,
  Network,
  Clock
} from 'lucide-react';
import { fetchRecordVerification, fetchRecordQr, checkIntegrityApi } from '../api';
import QRCode from 'qrcode';

export default function VerificationPage({ 
  recordId = 'rec-demo-001', 
  lang = 'bn', 
  onBackToApp, 
  onViewPassport, 
  onViewGraph 
}) {
  const isBn = lang === 'bn';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  
  // File byte integrity check state (Tier 2)
  const [fileCheckStatus, setFileCheckStatus] = useState('Not checked'); // 'Not checked' | 'Matched' | 'Mismatch'
  const [fileCheckResult, setFileCheckResult] = useState(null);
  const [isHashingFile, setIsHashingFile] = useState(false);
  const [fileError, setFileError] = useState(null);

  const loadVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecordVerification(recordId);
      setData(res);

      // Generate verification QR code data URL client-side or fetch from backend
      const canonicalUrl = `${window.location.origin}/verify/${encodeURIComponent(recordId)}`;
      try {
        const clientQr = await QRCode.toDataURL(canonicalUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#10272A',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(clientQr);
      } catch (qrErr) {
        // Fallback to backend QR endpoint
        const backendQr = await fetchRecordQr(recordId, window.location.origin);
        if (backendQr && (backendQr.qr_code_base64 || backendQr.qr_base64)) {
          setQrDataUrl(backendQr.qr_code_base64 || backendQr.qr_base64);
        }
      }
    } catch (err) {
      console.error('Failed to load verification:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, [recordId]);

  // Handle byte-level SHA-256 upload verification
  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !data || !data.reference_sha256) return;

    setIsHashingFile(true);
    setFileError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expected_hash', data.reference_sha256);

      const res = await checkIntegrityApi(formData);
      setFileCheckResult(res);
      setFileCheckStatus(res.is_intact ? 'Matched' : 'Mismatch');
    } catch (err) {
      console.error('File verification error:', err);
      setFileError(err.message || 'File check failed');
      setFileCheckStatus('Mismatch');
    } finally {
      setIsHashingFile(false);
    }
  };

  // Download QR code as PNG image
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `bhumi_kobocho_qr_${recordId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '14px',
            background: 'var(--status-matched-bg)',
            border: '1px solid var(--status-matched-border)',
            color: 'var(--status-matched-text)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
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
            borderRadius: '14px',
            background: 'var(--status-mismatch-bg)',
            border: '1px solid var(--status-mismatch-border)',
            color: 'var(--status-mismatch-text)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
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
            borderRadius: '14px',
            background: 'var(--status-review-bg)',
            border: '1px solid var(--status-review-border)',
            color: 'var(--status-review-text)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <AlertTriangle size={13} aria-hidden="true" />
            <span>{isBn ? 'পর্যালোচনা প্রয়োজন (Needs review)' : 'Needs review'}</span>
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
            borderRadius: '14px',
            background: 'var(--status-notchecked-bg)',
            border: '1px solid var(--status-notchecked-border)',
            color: 'var(--status-notchecked-text)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <HelpCircle size={13} aria-hidden="true" />
            <span>{isBn ? 'যাচাই করা হয়নি (Not checked)' : 'Not checked'}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="app-viewport" style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '720px', margin: '0 auto' }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--primary-accent)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', margin: 0 }}>
          {isBn ? 'কিউআর ডিজিটাল সনদ যাচাই করা হচ্ছে...' : 'Verifying Digital Record Reference...'}
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', marginTop: '8px' }}>
          {isBn ? 'ডাটাবেজ ও ক্রিপ্টোগ্রাফিক ফিঙ্গারপ্রিন্ট তথ্য লোড হচ্ছে।' : 'Retrieving public metadata and cryptographic reference.'}
        </p>
      </div>
    );
  }

  if (error || !data) {
    const is404 = error && (error.status === 404 || String(error.message || '').includes('404'));
    return (
      <div className="app-viewport" style={{ maxWidth: '680px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{
          background: 'var(--white)',
          border: '2px solid var(--text-main)',
          borderRadius: 'var(--radius-std)',
          boxShadow: 'var(--shadow-hard-md)',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', margin: '0 0 8px' }}>
            {is404 
              ? (isBn ? 'রেকর্ডটি খুঁজে পাওয়া যায়নি (HTTP 404)' : 'Record Reference Not Found (404)')
              : (isBn ? 'যাচাইকরণ সংযোগে ত্রুটি' : 'Verification Service Error')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '20px' }}>
            {is404
              ? (isBn 
                  ? `আইডি "${recordId}" এর বিপরীতে কোনো অনুমোদিত ভূমি রেকর্ড সংরক্ষিত নেই। এটি একটি ভুল বা অকার্যকর কিউআর কোড হতে পারে।`
                  : `No recorded land document corresponds to reference "${recordId}". This QR reference does not exist in the database.`)
              : (error?.message || 'Server error')}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onBackToApp}
              style={{
                height: '42px',
                padding: '0 18px',
                background: 'var(--primary-accent)',
                color: '#FFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              <ArrowLeft size={16} />
              <span>{isBn ? 'মূল অ্যাপ্লিকেশনে ফিরে যান' : 'Back to Main Application'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const meta = data.public_metadata || {};
  const findings = data.graph_findings || [];
  const hasMissingFinding = findings.some(f => f.finding_type === 'MISSING_REFERENCE');
  const reviewStatus = hasMissingFinding ? 'Needs review' : 'Matched';

  return (
    <div className="verification-page-root" style={{
      maxWidth: '840px',
      margin: '0 auto',
      padding: '32px 20px 60px',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Top Bar with Return Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        {onBackToApp && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onBackToApp}
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: '1.5px solid var(--text-main)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={15} />
            <span>{isBn ? 'অ্যাপে ফিরে যান' : 'Return to App'}</span>
          </button>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownloadQr}
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: '1.5px solid var(--text-main)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>{isBn ? 'কিউআর ডাউনলোড' : 'Download QR'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handlePrint}
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: '1.5px solid var(--text-main)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Printer size={15} />
            <span>{isBn ? 'প্রিন্ট সনদ' : 'Print Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory / Safety Disclaimer Box */}
      <div style={{
        background: '#FEF9C3',
        border: '1.5px solid #EAB308',
        borderRadius: 'var(--radius-std)',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-hard-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertTriangle size={20} color="#854D0E" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.94rem', color: '#854D0E', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
              {isBn ? 'ডেমো ডেটা সতর্কতা — কোনো আইনি সিদ্ধান্ত নয়' : 'DEMO DATA — not a legal verdict'}
            </strong>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#713F12', lineHeight: 1.55 }}>
              {isBn
                ? 'এটি একটি ডেমো সিস্টেম। QR Code বা Hash Match জমির মালিকানা বা দলিলের আইনগত সত্যতা প্রমাণ করে না। চূড়ান্ত যাচাইয়ের জন্য যথাযথ কর্তৃপক্ষের রেকর্ড প্রয়োজন।'
                : 'DEMO DATA — not a legal verdict. A QR code or hash match does not prove legal ownership or the legal authenticity of a land document.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Verification Certificate Card */}
      <div style={{
        background: 'var(--white)',
        border: '2px solid var(--text-main)',
        borderRadius: 'var(--radius-std)',
        boxShadow: 'var(--shadow-hard-md)',
        padding: '28px 24px',
        marginBottom: '24px'
      }}>
        {/* Certificate Header with QR Code & Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: '20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--accent-tint)',
              color: 'var(--primary-accent)',
              fontSize: '0.74rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: '8px'
            }}>
              <QrCode size={13} />
              <span>{isBn ? 'ডিজিটাল কিউআর সনদপত্র' : 'Digital QR Verification Certificate'}</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 6px',
              lineHeight: 1.25
            }}>
              {meta.label || `Record ${meta.id}`}
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: 0 }}>
              {isBn ? 'রেফারেন্স আইডি:' : 'Reference ID:'} <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)' }}>{meta.id}</strong>
              {' '}&bull;{' '}
              {isBn ? 'মৌজা:' : 'Mouza:'} <strong>{meta.mouza || 'N/A'}</strong>
            </p>
          </div>

          {qrDataUrl && (
            <div style={{
              textAlign: 'center',
              background: '#FFFFFF',
              border: '1.5px solid #CAD7CF',
              borderRadius: 'var(--radius-std)',
              padding: '8px',
              boxShadow: 'var(--shadow-hard-sm)'
            }}>
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: '120px', height: '120px', display: 'block' }}
              />
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                {meta.id}
              </span>
            </div>
          )}
        </div>

        {/* 3 Distinct Verification Status Pillars */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '0 0 16px' }}>
          {isBn ? 'ত্রি-স্তরীয় যাচাইকরণ বিশ্লেষণ (Three-Tier Integrity Breakdown)' : 'Three-Tier Verification Breakdown'}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Tier 1: Record Reference Lookup */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid #CAD7CF',
            borderRadius: 'var(--radius-std)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                ১. রেকর্ড উপস্থিতি (Record Lookup)
              </span>
              {renderStatusBadge('Matched')}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: '0 0 6px', fontWeight: 600 }}>
              {isBn ? 'ডাটাবেজ রেকর্ড উপস্থিত' : 'Database record exists'}
            </p>
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.4, display: 'block' }}>
              {isBn 
                ? 'অনুমোদিত ডেমো ডাটাবেজে এই দলিলের সুনির্দিষ্ট রেকর্ড সংরক্ষিত রয়েছে।' 
                : 'The referenced document exists in the demo database.'}
            </span>
          </div>

          {/* Tier 2: File Hash Comparison */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid #CAD7CF',
            borderRadius: 'var(--radius-std)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                ২. বাইট হ্যাশ সততা (Bit Integrity)
              </span>
              {renderStatusBadge(fileCheckStatus)}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: '0 0 6px', fontWeight: 600 }}>
              {fileCheckStatus === 'Matched' 
                ? (isBn ? 'ফাইল অপরিবর্তিত (Unchanged)' : 'File bytes match reference')
                : (fileCheckStatus === 'Mismatch' 
                    ? (isBn ? 'ফাইলের হ্যাশ অমিল' : 'Hash mismatch detected')
                    : (isBn ? 'ফাইল আপলোড করা হয়নি' : 'No file uploaded yet'))}
            </p>
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.4, display: 'block' }}>
              {isBn 
                ? 'শুধুমাত্র পেজ লোড করা হ্যাশ ভেরিফিকেশন নয়; আসল দলিলের বাইট যাচাইয়ের জন্য নিচে ফাইল আপলোড করুন।' 
                : 'Viewing metadata is not a file hash match; upload a document below to compute SHA-256.'}
            </span>
          </div>

          {/* Tier 3: Chain & Graph Review */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid #CAD7CF',
            borderRadius: 'var(--radius-std)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                ৩. বায়া ও চেইন নিরীক্ষা (Review)
              </span>
              {renderStatusBadge(reviewStatus)}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: '0 0 6px', fontWeight: 600 }}>
              {hasMissingFinding 
                ? (isBn ? 'অনুপস্থিত বায়া রেফারেন্স রয়েছে' : 'Missing references identified')
                : (isBn ? 'উদ্ধৃত রেফারেন্স সঙ্গতিপূর্ণ' : 'References consistent')}
            </p>
            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.4, display: 'block' }}>
              {isBn 
                ? 'সম্পর্ক গ্রাফের মাধ্যমে পূর্ববর্তী বায়া দলিল ও মূল খতিয়ান ধারাবাহিকতা পরীক্ষা করা হয়েছে।' 
                : 'Relationship graph audit of prior deed citations and mutation parent khatians.'}
            </span>
          </div>
        </div>

        {/* Public Record Metadata Table */}
        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '0 0 12px' }}>
          {isBn ? 'প্রকাশ্য ডেমো রেকর্ড তথ্য (Public Metadata)' : 'Public Demo Record Metadata'}
        </h4>

        <div style={{
          border: '1px solid #CAD7CF',
          borderRadius: 'var(--radius-std)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #CAD7CF', background: '#F8FAF9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)', width: '35%' }}>
                  {isBn ? 'মালিকের নাম (ডেমো):' : 'Owner Name (Demo):'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontWeight: 600 }}>
                  {meta.owner_name_bn} ({meta.owner_name_en})
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #CAD7CF' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isBn ? 'দলিল নম্বর ও তারিখ:' : 'Deed No & Date:'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {meta.deed_no} &bull; {meta.document_date}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #CAD7CF', background: '#F8FAF9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isBn ? 'খতিয়ান ও দাগ নম্বর:' : 'Khatian & Dag No:'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  খতিয়ান: {meta.khatian_no} &bull; দাগ: {meta.dag_no}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #CAD7CF' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isBn ? 'মৌজা ও এলাকা:' : 'Mouza & Administrative Area:'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>
                  {meta.mouza}, {meta.upazila}, {meta.district}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #CAD7CF', background: '#F8FAF9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isBn ? 'জমির পরিমাণ ও শ্রেণি:' : 'Land Area & Class:'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>
                  <strong>{meta.area_decimal} শতক (decimal)</strong> &bull; {meta.land_class}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #CAD7CF' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isBn ? 'সর্বশেষ নামজারি কেস:' : 'Last Mutation Case:'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {meta.last_mutation_case || 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)', background: '#F8FAF9' }}>
                  {isBn ? 'রেফারেন্স SHA-256 হ্যাশ:' : 'Reference SHA-256:'}
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--primary-accent)', wordBreak: 'break-all' }}>
                  {data.reference_sha256}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Privacy Shield Note */}
        <div style={{
          padding: '10px 14px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-std)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          <ShieldCheck size={16} color="#1D4ED8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.78rem', color: '#1E40AF' }}>
            {isBn 
              ? 'নাগরিক প্রাইভেসী সুরক্ষা: প্রকাশ্য কিউআর যাচাই পেজে এনআইডি, ফোন নম্বর বা সংবেদনশীল ব্যক্তিগত পরিচয় গোপন রাখা হয়েছে।' 
              : 'Citizen Privacy: NID, phone numbers, and sensitive personal identifiers are strictly redacted from public verification.'}
          </span>
        </div>

        {/* Interactive SHA-256 Byte Verification Section */}
        <div style={{
          background: 'var(--paper)',
          border: '1.5px solid #CAD7CF',
          borderRadius: 'var(--radius-std)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Hash size={18} color="var(--primary-accent)" />
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isBn ? 'দলিলের ডিজিটাল অবিকৃত অবস্থা (SHA-256) পরীক্ষা করুন' : 'Test File Bit Integrity (Compute SHA-256)'}
            </h4>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', margin: '0 0 14px' }}>
            {isBn 
              ? 'আপনার কাছে থাকা দলিল ফাইলটি নির্বাচন করুন। ব্রাউজার ও সিস্টেম এর বাইট হ্যাশ গণনা করে দেখবে এটি সংরক্ষিত রেকর্ডের সাথে নিখুঁতভাবে মেলে কি না।' 
              : 'Select your local document file to compute its SHA-256 checksum and verify bit-level match against stored record.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label
              htmlFor="verify-file-input"
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: 'var(--radius-std)',
                border: '1.5px solid var(--text-main)',
                background: '#FFFFFF',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.86rem',
                fontFamily: 'var(--font-heading)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Upload size={15} />
              <span>{isBn ? 'দলিল ফাইল নির্বাচন করুন' : 'Select Deed File'}</span>
            </label>
            <input
              id="verify-file-input"
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {isHashingFile && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--primary-accent)' }}>
                <RefreshCw size={14} className="spin" />
                <span>{isBn ? 'হ্যাশ গণনা হচ্ছে...' : 'Computing digest...'}</span>
              </span>
            )}
          </div>

          {fileError && (
            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-std)', color: '#991B1B', fontSize: '0.82rem' }}>
              {fileError}
            </div>
          )}

          {fileCheckResult && (
            <div style={{
              marginTop: '14px',
              padding: '12px',
              borderRadius: 'var(--radius-std)',
              background: fileCheckResult.is_intact ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${fileCheckResult.is_intact ? '#86EFAC' : '#FCA5A5'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {fileCheckResult.is_intact ? <CheckCircle2 size={16} color="#16A34A" /> : <XCircle size={16} color="#DC2626" />}
                <strong style={{ fontSize: '0.88rem', color: fileCheckResult.is_intact ? '#15803D' : '#991B1B' }}>
                  {fileCheckResult.is_intact 
                    ? (isBn ? 'ফাইল অপরিবর্তিত রয়েছে — প্রতিটি বিট নিখুঁত মিলেছে (Matched)' : 'File bytes match reference perfectly (Matched)')
                    : (isBn ? 'ফাইলের ভেতরের তথ্য পরিবর্তিত হয়েছে — হ্যাশ অমিল (Mismatch)' : 'File content changed — hash mismatch (Mismatch)')}
                </strong>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                {isBn ? 'গণনাকৃত হ্যাশ:' : 'Calculated SHA-256:'} {fileCheckResult.calculated_sha256}
              </div>
            </div>
          )}
        </div>

        {/* Deterministic Findings Breakdown (if any) */}
        {findings.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '0 0 10px' }}>
              {isBn ? 'সম্পর্ক নিরীক্ষা ফলাফল (Deterministic Findings)' : 'Relationship Graph Audit Findings'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {findings.map((finding) => (
                <div
                  key={finding.finding_id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-std)',
                    background: finding.status === 'Needs review' ? '#FEF4F0' : '#F0FDF4',
                    border: `1px solid ${finding.status === 'Needs review' ? '#F3BFB3' : '#BBF7D0'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      {finding.finding_type} ({finding.evidence_field})
                    </strong>
                    {renderStatusBadge(finding.status)}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                    {isBn ? finding.explanation_bn : finding.explanation_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Verification Timestamp & Canonical Reference */}
        <div style={{
          padding: '12px 16px',
          background: '#F1F5F0',
          border: '1px solid #CBD8D2',
          borderRadius: 'var(--radius-std)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted)' }}>
            <Clock size={14} />
            <span>
              {isBn ? 'সিস্টেম যাচাই সময়কাল (UTC):' : 'System Timestamp (UTC):'}{' '}
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                {data.verification_timestamp || 'N/A'}
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onViewPassport && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onViewPassport(recordId)}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <FileBadge size={13} />
                <span>{isBn ? 'প্লট পাসপোর্ট' : 'Passport'}</span>
              </button>
            )}

            {onViewGraph && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onViewGraph(recordId)}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Network size={13} />
                <span>{isBn ? 'সম্পর্ক গ্রাফ' : 'Graph'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
