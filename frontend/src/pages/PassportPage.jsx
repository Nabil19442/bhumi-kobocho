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
  RefreshCw,
  Compass,
  Info,
  Network
} from 'lucide-react';
import { fetchPlotPassport, fetchRecords } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';
import TimelineDetailModal from '../components/TimelineDetailModal';

export default function PassportPage({ t, lang = 'bn', selectedPlotId = 'rec-demo-001', comparisonResult, sharedExtractedData, onViewGraph }) {
  const isBn = lang === 'bn';
  const [plotId, setPlotId] = useState(selectedPlotId);
  const [passport, setPassport] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState(null);

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
            padding: '3px 8px',
            borderRadius: '14px',
            background: 'var(--status-matched-bg)',
            border: '1px solid var(--status-matched-border)',
            color: 'var(--status-matched-text)',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <CheckCircle2 size={12} aria-hidden="true" />
            <span>{isBn ? 'মিলেছে (Matched)' : 'Matched'}</span>
          </span>
        );
      case 'Mismatch':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '14px',
            background: 'var(--status-mismatch-bg)',
            border: '1px solid var(--status-mismatch-border)',
            color: 'var(--status-mismatch-text)',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <XCircle size={12} aria-hidden="true" />
            <span>{isBn ? 'অমিল (Mismatch)' : 'Mismatch'}</span>
          </span>
        );
      case 'Needs review':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '14px',
            background: 'var(--status-review-bg)',
            border: '1px solid var(--status-review-border)',
            color: 'var(--status-review-text)',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <AlertTriangle size={12} aria-hidden="true" />
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
            padding: '3px 8px',
            borderRadius: '14px',
            background: 'var(--status-notchecked-bg)',
            border: '1px solid var(--status-notchecked-border)',
            color: 'var(--status-notchecked-text)',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            <HelpCircle size={12} aria-hidden="true" />
            <span>{isBn ? 'যাচাই করা হয়নি (Not checked)' : 'Not checked'}</span>
          </span>
        );
    }
  };

  if (isLoading && !passport) {
    return (
      <div className="app-viewport" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 'var(--max-content-width)', margin: '0 auto' }}>
        <RefreshCw size={26} className="spin" style={{ color: 'var(--primary-accent)', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-main)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
          {isBn ? 'নাগরিক প্লট পাসপোর্ট লোড হচ্ছে...' : 'Loading Citizen Plot Passport...'}
        </p>
      </div>
    );
  }

  if (error && !passport) {
    return (
      <div className="app-viewport" style={{ padding: '40px 20px', maxWidth: 'var(--max-content-width)', margin: '0 auto' }}>
        <ApiErrorNotice error={error} onRetry={loadData} title={isBn ? 'প্লট পাসপোর্ট লোড করা সম্ভব হয়নি' : 'Unable to load Plot Passport'} />
      </div>
    );
  }

  if (!passport) {
    return null;
  }

  const rec = passport.record || {};
  const activeComparison = comparisonResult || passport.comparison_summary;

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-tint)',
              color: 'var(--primary-accent)',
              padding: '8px',
              borderRadius: 'var(--radius-std)',
              display: 'flex'
            }}>
              <FileBadge size={24} />
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
                {isBn ? 'নাগরিক প্লট পাসপোর্ট' : 'Citizen Plot Passport'}
              </h1>
              <p style={{
                fontSize: '0.96rem',
                color: 'var(--text-body)',
                fontFamily: 'var(--font-body)',
                margin: '4px 0 0'
              }}>
                {isBn 
                  ? 'আপনার জমির সকল ঐতিহাসিক পরচা, দলিল ও ক্রিপ্টোগ্রাফিক সুরক্ষার একক নাগরিক সারসংক্ষেপ।' 
                  : 'Unified overview of plot history, survey credentials, and cryptographic integrity.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {onViewGraph && (
              <button
                id="view-in-graph-btn"
                type="button"
                className="btn-primary"
                onClick={() => onViewGraph(plotId)}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  background: 'var(--primary-accent)',
                  color: '#FFFFFF',
                  border: '1.5px solid var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minHeight: '44px'
                }}
              >
                <Network size={16} />
                <span>{isBn ? 'সম্পর্ক গ্রাফে দেখুন' : 'View in Graph'}</span>
              </button>
            )}

            <button
              id="print-passport-btn"
              type="button"
              className="btn-secondary"
              onClick={handlePrint}
              style={{
                height: '42px',
                padding: '0 18px',
                fontSize: '0.9rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                border: '1.5px solid var(--text-main)',
                background: '#FFFFFF',
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              <Printer size={16} />
              <span>{isBn ? 'প্রিন্ট / পিডিএফ' : 'Print / Export PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <ApiErrorNotice error={error} onRetry={loadData} title={isBn ? 'প্লট পাসপোর্ট হালনাগাদ করা যায়নি' : 'Unable to refresh Plot Passport'} />

      {/* Record Picker Card */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid #CAD7CF',
        boxShadow: 'var(--shadow-hard-sm)',
        padding: '16px 20px',
        marginBottom: '24px'
      }}>
        <div className="form-field">
          <label htmlFor="passport-plot-picker" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.86rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-main)',
            marginBottom: '6px'
          }}>
            <span>{isBn ? 'প্লট রেকর্ড নির্বাচন করুন:' : 'Select Plot Record:'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-accent)' }}>
              {isBn ? 'ডেমো প্লট আইডি:' : 'Demo Plot ID:'} {plotId}
            </span>
          </label>
          <select
            id="passport-plot-picker"
            value={plotId}
            onChange={(e) => setPlotId(e.target.value)}
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
            <optgroup label={isBn ? "কৃত্রিম লেনদেন হিস্ট্রি পার্সেলসমূহ (২০,০০০+ রেকর্ড)" : "Synthetic Land History Parcels"}>
              <option value="PCL-DHK-GUL-015-0550">PCL-DHK-GUL-015-0550: গুলশান (দাগ: ৫৫০, খতিয়ান: ২২০) — দ্বৈত বিক্রয় টেস্ট</option>
              <option value="PCL-DHK-SAV-045-0784">PCL-DHK-SAV-045-0784: সাভার (দাগ: ৭৮৪, খতিয়ান: ১২৯) — এরিয়া ওভারল্যাপ টেস্ট</option>
              <option value="PCL-RAJ-PAB-041-1058">PCL-RAJ-PAB-041-1058: পাবনা (দাগ: ১০৫৮, খতিয়ান: ৪১২) — ধারাবাহিক পরিচ্ছন্ন চেইন</option>
              <option value="PCL-KHL-RPS-018-1540">PCL-KHL-RPS-018-1540: রূপসা (দাগ: ১৫৪০, খতিয়ান: ৭৩) — বহুবিধ লেনদেন</option>
              <option value="PCL-DHK-SHT-012-1234">PCL-DHK-SHT-012-1234: শান্তিপুর (দাগ: ১২৩৪, খতিয়ান: ৪৫৬) — ডেমো পিডিএফ দলিল</option>
            </optgroup>
            <optgroup label={isBn ? "আর্কাইভ নমুনা রেকর্ডসমূহ" : "Archive Demo Records"}>
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.owner_name_bn} — মৌজা: {r.mouza} (দাগ: {r.dag_no}, খতিয়ান: {r.khatian_no})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Passport Card (Tactile hard shadow) */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1.5px solid var(--text-main)',
        boxShadow: 'var(--shadow-hard)',
        overflow: 'hidden',
        marginBottom: '28px'
      }}>
        {/* Passport Top Banner */}
        <div style={{
          background: 'var(--dark-band)',
          color: 'var(--white)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--primary-accent)',
              padding: '6px',
              borderRadius: '6px',
              color: '#fff',
              display: 'flex'
            }}>
              <FileBadge size={20} />
            </div>
            <div>
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.8px',
                color: '#CAD7CF',
                textTransform: 'uppercase',
                display: 'block'
              }}>
                {isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ নমুনা রেকর্ড' : 'PEOPLE’S REPUBLIC OF BANGLADESH DEMO RECORD'}
              </span>
              <strong style={{
                fontSize: '1.24rem',
                fontFamily: 'var(--font-heading)',
                color: '#FFFFFF'
              }}>
                {isBn ? `নাগরিক প্লট পাসপোর্ট — দাগ ${rec.dag_no}` : `Citizen Plot Passport — Dag ${rec.dag_no}`}
              </strong>
            </div>
          </div>

          <div style={{
            background: '#9A2C14',
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '4px',
            letterSpacing: '0.5px'
          }}>
            {isBn ? 'ডেমো ডেটা • আইনি সিদ্ধান্ত নয়' : 'DEMO DATA • NOT LEGAL VERDICT'}
          </div>
        </div>

        {/* Passport Body */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid #CAD7CF'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--status-matched-bg)',
                  color: 'var(--status-matched-text)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}>
                  <ShieldCheck size={13} />
                  <span>{isBn ? 'প্লট পাসপোর্ট নমুনা' : 'PASSPORT SPECIMEN'}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 700 }}>
                  {passport.plot_id}
                </span>
              </div>

              <h2 style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                margin: '0 0 6px',
                letterSpacing: '-0.3px'
              }}>
                {isBn ? rec.owner_name_bn : rec.owner_name_en}
              </h2>

              <p style={{
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                margin: 0
              }}>
                <MapPin size={16} style={{ color: 'var(--primary-accent)' }} />
                <span>{rec.mouza}, উপজেলা: {rec.upazila}, জেলা: {rec.district}</span>
              </p>
            </div>

            {/* QR Code */}
            {passport.qr_code_base64 && (
              <div style={{
                textAlign: 'center',
                background: 'var(--paper)',
                padding: '10px',
                borderRadius: 'var(--radius-std)',
                border: '1px solid #CAD7CF',
                flexShrink: 0
              }}>
                <img
                  src={passport.qr_code_base64}
                  alt="Plot Passport QR Fingerprint"
                  style={{ width: '110px', height: '110px', display: 'block', margin: '0 auto' }}
                />
                <span style={{
                  color: 'var(--text-main)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'block',
                  marginTop: '4px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {isBn ? 'ডিজিটাল কিউআর কোড' : 'QR FINGERPRINT'}
                </span>
              </div>
            )}
          </div>

          {/* 6 Core Specimen Attributes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            margin: '22px 0',
            background: 'var(--paper)',
            padding: '18px',
            borderRadius: 'var(--radius-std)',
            border: '1px solid #CAD7CF'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>
                {isBn ? 'খতিয়ান নম্বর' : 'Khatian No'}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {rec.khatian_no}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>
                {isBn ? 'দাগ নম্বর' : 'Dag No'}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {rec.dag_no}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>
                {isBn ? 'রেকর্ডকৃত জমির পরিমাণ' : 'Recorded Area'}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {rec.area_decimal} {isBn ? 'শতক / শতাংশ' : 'Decimal'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>
                {isBn ? 'জমির শ্রেণি' : 'Land Classification'}
              </span>
              <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {rec.land_class}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>
                {isBn ? 'সর্বশেষ নামজারি কেস' : 'Latest Mutation'}
              </span>
              <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {rec.last_mutation_case}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>
                {isBn ? 'দলিল নং ও তারিখ' : 'Deed No & Date'}
              </span>
              <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {rec.deed_no} ({rec.document_date})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Verification & Comparison Audit Section */}
      {activeComparison && (
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-std)',
          border: '1px solid #CAD7CF',
          borderLeft: '4px solid var(--primary-accent)',
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
              <h3 style={{
                fontSize: '1.14rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                margin: '0 0 2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FileCheck2 size={18} color="var(--primary-accent)" />
                <span>{isBn ? 'সমন্বিত দলিল নিরীক্ষা ও ফলাফল' : 'Integrated Audit Results'}</span>
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', margin: 0 }}>
                {isBn 
                  ? 'নাগরিক প্রদত্ত দলিলের সাথে অফিসিয়াল রেফারেন্স রেকর্ডের তুলনামূলক ফলাফল' 
                  : 'Comparison results from citizen supplied document against official reference baseline'}
              </p>
            </div>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              background: 'var(--accent-tint)',
              color: 'var(--primary-accent)'
            }}>
              {isBn ? 'সামঞ্জস্য:' : 'Consistency:'} {activeComparison.record_consistency_indicator?.percentage}%
            </span>
          </div>

          <div className="table-responsive-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
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
                {activeComparison.results?.map((item, idx) => {
                  const isMismatch = item.status === 'Mismatch';
                  const isAlt = idx % 2 === 1;

                  return (
                    <tr
                      key={item.field}
                      style={{
                        background: isMismatch ? 'var(--status-mismatch-row)' : (isAlt ? '#FAFCF9' : '#FFFFFF'),
                        borderBottom: '1px solid #E3EAE6',
                        fontSize: '0.9rem'
                      }}
                    >
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                        {isBn ? item.field_label_bn : item.field_label_en}
                      </td>
                      <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>
                        {formatDisplayVal(item.extracted_value)}
                      </td>
                      <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>
                        {formatDisplayVal(item.reference_value)}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        {renderStatusBadge(item.status)}
                      </td>
                      <td style={{ padding: '12px 18px', fontSize: '0.84rem', color: 'var(--text-body)' }}>
                        {item.reason_code}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record History Timeline */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid #CAD7CF',
        boxShadow: 'var(--shadow-hard-sm)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Calendar size={18} color="var(--primary-accent)" />
          <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
            {isBn ? 'মালিকানা ও নামজারি টাইমলাইন' : 'Chronological Title & Mutation Timeline'}
          </h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: '0 0 20px' }}>
          {isBn 
            ? 'জরিপ পরচা, সাব-কবলা দলিল ও নামজারি কেসের ধারাবাহিক পরিক্রমা।' 
            : 'Chronological progression of survey, saf-kabala deed, and mutation events.'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {passport.timeline?.map((step, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTimelineEvent(step)}
              style={{
                background: 'var(--paper)',
                border: '1px solid #CAD7CF',
                borderRadius: 'var(--radius-std)',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-accent)';
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(39, 66, 160, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CAD7CF';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--primary-accent)',
                  marginBottom: '4px'
                }}>
                  {step.year} — {step.date}
                </div>
                <strong style={{
                  fontSize: '0.98rem',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {isBn ? step.title_bn : step.title_en}
                </strong>
                <p style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-body)',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {isBn ? step.detail_bn : step.detail_en}
                </p>
              </div>
              <div style={{
                marginTop: '12px',
                fontSize: '0.74rem',
                color: 'var(--primary-accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>{isBn ? 'বিস্তারিত নথি দেখুন' : 'Inspect record detail'}</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* What Was NOT Checked & Next Steps Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Box 1: What was NOT checked */}
        <div style={{
          background: '#FEF4F0',
          border: '1.5px solid #F3BFB3',
          borderRadius: 'var(--radius-std)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9A2C14', marginBottom: '8px' }}>
            <AlertOctagon size={18} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isBn ? 'কী যাচাই হয়নি (সিস্টেমের সীমাবদ্ধতা)' : 'What Was NOT Checked'}
            </h4>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#70220F', margin: '0 0 10px', lineHeight: 1.5 }}>
            {isBn 
              ? 'নাগরিক সুরক্ষা সতর্কতা: এই ডিজিটাল ব্যবস্থাটিতে নিচের আইনি বিষয়গুলো অন্তর্ভুক্ত বা যাচাই করা হয়নি:'
              : 'Important citizen protection: This automated system intentionally omits the following legal audits:'}
          </p>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.84rem', color: '#70220F', lineHeight: 1.65 }}>
            {passport.not_checked_items?.map((item, idx) => (
              <li key={idx}><strong>{item}</strong></li>
            ))}
          </ul>
        </div>

        {/* Box 2: Recommended Next Steps */}
        <div style={{
          background: '#EBF3FB',
          border: '1.5px solid #C4D6F5',
          borderRadius: 'var(--radius-std)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-accent)', marginBottom: '8px' }}>
            <Compass size={18} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isBn ? 'পরবর্তী সরকারি যাচাইকরণ পদক্ষেপ' : 'Recommended Next Steps'}
            </h4>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: '0 0 10px', lineHeight: 1.5 }}>
            {isBn 
              ? 'আইনি নিশ্চয়তা লাভের জন্য পরবর্তী সরকারি যাচাইকরণ পদক্ষেপসমূহ:'
              : 'Recommended official next steps for complete statutory confirmation:'}
          </p>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.65 }}>
            {passport.next_official_steps?.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <TimelineDetailModal
        isOpen={Boolean(selectedTimelineEvent)}
        event={selectedTimelineEvent}
        onClose={() => setSelectedTimelineEvent(null)}
        lang={lang}
      />
    </div>
  );
}
