import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  FileBadge, 
  Calendar, 
  User, 
  MapPin, 
  Hash, 
  Maximize2,
  Info,
  ShieldAlert,
  Download,
  FileUp
} from 'lucide-react';

const RECENT_REPORTS = [
  {
    id: 'REP-2026-0811',
    date: '2026-10-17 11:24 AM',
    deed_no: '4520/2023',
    seller: 'মোঃ মোর্শেদ আলম',
    buyer: 'তারেক রহমান',
    dag_no: '550',
    khatian_no: '220',
    mouza: 'গুলশান (JL 15)',
    area_decimal: '10.00',
    status: 'POTENTIAL_CONFLICT',
    status_label_bn: 'সম্ভাব্য দ্বৈত বিক্রয় বিরোধ শনাক্ত',
    status_label_en: 'Potential Conflict Found (Duplicate Sale)',
    findings: 'বিক্রেতা পূর্বে দলিল ১১০২/২০২০ এর মাধ্যমে সম্পূর্ণ ১০ শতক হস্তান্তর করেছেন। অবশিষ্ট জমি ০.০০ শতক।'
  },
  {
    id: 'REP-2026-0810',
    date: '2026-10-17 10:45 AM',
    deed_no: '5812/2022',
    seller: 'সুলতানা জাহান',
    buyer: 'নাসরিন আক্তার',
    dag_no: '784',
    khatian_no: '129',
    mouza: 'সাভার (JL 45)',
    area_decimal: '7.00',
    status: 'POTENTIAL_CONFLICT',
    status_label_bn: 'হস্তান্তরিত অংশে জমির পরিমাণের ওভারল্যাপ',
    status_label_en: 'Potential Conflict Found (Area Overlap)',
    findings: 'বিক্রেতার পূর্ববর্তী বিক্রয়ের পর অবশিষ্ট জমির চেয়ে প্রস্তাবিত হস্তান্তরের পরিমাণ ৩.০০ শতক বেশি।'
  },
  {
    id: 'REP-2026-0809',
    date: '2026-10-16 04:30 PM',
    deed_no: '1482/2021',
    seller: 'মোঃ রফিকুল ইসলাম',
    buyer: 'আব্দুল করিম',
    dag_no: '1058',
    khatian_no: '412',
    mouza: 'পাবনা (JL 41)',
    area_decimal: '5.00',
    status: 'CLEAN_CHAIN',
    status_label_bn: 'উপলব্ধ রেকর্ডে কোনো দ্বন্দ্ব পাওয়া যায়নি',
    status_label_en: 'No Conflict Found in Available Records',
    findings: 'পূর্ববর্তী দলিল ৯২০/২০০৫ এর ১৫.৫ শতক হোল্ডিং ব্যালেন্সের সাথে সম্পূর্ণ সঙ্গতিপূর্ণ।'
  },
  {
    id: 'REP-2026-0808',
    date: '2026-10-16 02:15 PM',
    deed_no: '1099/2024',
    seller: 'সেলিম রেজা',
    buyer: 'পারভীন সুলতানা',
    dag_no: '3310',
    khatian_no: '88',
    mouza: 'সিলেট (JL 30)',
    area_decimal: '8.00',
    status: 'INSUFFICIENT_INFO',
    status_label_bn: 'মালিকানার ধারাবাহিকতায় ফাঁক বা অসম্পূর্ণ ইতিহাস',
    status_label_en: 'Insufficient Information / History Gap',
    findings: 'পূর্ববর্তী খতিয়ান বা দলিলের স্পষ্ট লিঙ্কেজ পাওয়া যায়নি। ভৌত সাব-রেজিস্ট্রি আর্কাইভ যাচাই প্রয়োজন।'
  }
];

export default function ReportsPage({ 
  t, 
  lang = 'bn', 
  onViewPassport, 
  onStartScanning, 
  onNavigate 
}) {
  const isBn = lang === 'bn';
  const [selectedReport, setSelectedReport] = useState(RECENT_REPORTS[0]);

  const handleGoToScanner = () => {
    if (onStartScanning) {
      onStartScanning();
    } else if (onNavigate) {
      onNavigate('scanner');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderBadge = (status) => {
    if (status === 'CLEAN_CHAIN') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: '4px',
          background: '#DCFCE7',
          color: '#166534',
          fontSize: '0.76rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          <CheckCircle2 size={13} />
          <span>{isBn ? 'কোনো দ্বন্দ্ব নেই' : 'No Conflict Found'}</span>
        </span>
      );
    }
    if (status === 'POTENTIAL_CONFLICT') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: '4px',
          background: '#FEE2E2',
          color: '#991B1B',
          fontSize: '0.76rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          <AlertTriangle size={13} />
          <span>{isBn ? 'সম্ভাব্য বিরোধ' : 'Potential Conflict'}</span>
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '4px',
        background: '#FEF3C7',
        color: '#92400E',
        fontSize: '0.76rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)'
      }}>
        <Info size={13} />
        <span>{isBn ? 'তথ্যের ঘাটতি' : 'Insufficient Info'}</span>
      </span>
    );
  };

  return (
    <div className="reports-page-root" style={{
      maxWidth: 'var(--max-content-width)',
      margin: '0 auto',
      padding: '32px var(--gutter-desktop)',
      boxSizing: 'border-box'
    }}>
      {/* Page Title & Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--primary-accent)',
            background: 'var(--accent-tint)',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #C4D6F5',
            marginBottom: '8px'
          }}>
            <ClipboardCheck size={14} />
            <span>{isBn ? 'নিরীক্ষা ও যাচাইকরণ প্রত্যয়নপত্র' : 'AUDIT LOGS & VERIFICATION CERTIFICATES'}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            margin: '0 0 8px 0'
          }}>
            {isBn ? 'দলিল যাচাইকরণ প্রতিবেদন' : 'Verification Reports'}
          </h1>

          <p style={{
            fontSize: '0.98rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            margin: 0,
            maxWidth: '820px',
            lineHeight: 1.55
          }}>
            {isBn
              ? 'সম্পন্নকৃত সকল দলিল যাচাইয়ের বিস্তারিত অডিট প্রতিবেদন, বিরোধ বিশ্লেষণ ও প্রাতিষ্ঠানিক সনদপত্র। এই সনদপত্রটি মুদ্রণ বা পিডিএফ হিসেবে সংরক্ষণ করা যাবে।'
              : 'Inspect historical audit certificates, discrepancy analysis, and verification verdicts generated against the synthetic transaction registry.'}
          </p>
        </div>

        {/* Upload New Deed Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
          <button
            type="button"
            id="btn-upload-new-deed"
            onClick={handleGoToScanner}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: 'var(--radius-std)',
              background: 'var(--primary-accent)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-hard, 0 3px 10px rgba(0,0,0,0.18))',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FileUp size={18} />
            <span>{isBn ? 'নতুন দলিল আপলোড করুন' : 'Upload New Deed'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left List + Right Certificate Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Recent Audit List */}
        <div>
          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>
            {isBn ? 'সাম্প্রতিক যাচাইকৃত দলিল তালিকা' : 'Recently Verified Deeds'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {RECENT_REPORTS.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                style={{
                  background: selectedReport?.id === rep.id ? 'var(--accent-tint)' : 'var(--bg-card)',
                  borderRadius: 'var(--radius-std)',
                  border: selectedReport?.id === rep.id ? '2px solid var(--primary-accent)' : '1px solid var(--line)',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {rep.id}
                  </span>
                  {renderBadge(rep.status)}
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                  দলিল নং {rep.deed_no} (দাগ {rep.dag_no})
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginBottom: '6px' }}>
                  <strong>{isBn ? 'বিক্রেতা:' : 'Seller:'}</strong> {rep.seller} &bull; <strong>{isBn ? 'ক্রেতা:' : 'Buyer:'}</strong> {rep.buyer}
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {rep.mouza} &bull; {rep.area_decimal} শতক &bull; {rep.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Printable Verification Certificate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isBn ? 'অফিসিয়াল যাচাই প্রত্যয়নপত্র (প্রিভিউ)' : 'Verification Certificate Preview'}
            </h3>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary"
              style={{
                height: '36px',
                padding: '0 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '6px'
              }}
            >
              <Printer size={14} />
              <span>{isBn ? 'মুদ্রণ / সংরক্ষণ' : 'Print / Save PDF'}</span>
            </button>
          </div>

          {selectedReport && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-std)',
              border: '2px solid var(--text-main)',
              padding: '28px',
              boxShadow: 'var(--shadow-hard)',
              position: 'relative'
            }}>
              {/* Certificate Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '18px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-accent)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  BHUMI KOBOCHO &bull; PRELIMINARY PURCHASE VERIFICATION REPORT
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '6px 0' }}>
                  ভূমি ক্রয় সংক্রান্ত রেকর্ড যাচাই প্রত্যয়নপত্র
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  সনদ নম্বর: {selectedReport.id} &bull; তারিখ: {selectedReport.date}
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                background: selectedReport.status === 'CLEAN_CHAIN' ? '#F0FDF4' : (selectedReport.status === 'POTENTIAL_CONFLICT' ? '#FEF2F2' : '#FFFBEB'),
                border: selectedReport.status === 'CLEAN_CHAIN' ? '1.5px solid #BBF7D0' : (selectedReport.status === 'POTENTIAL_CONFLICT' ? '1.5px solid #FECACA' : '1.5px solid #FDE68A'),
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: selectedReport.status === 'CLEAN_CHAIN' ? '#166534' : (selectedReport.status === 'POTENTIAL_CONFLICT' ? '#991B1B' : '#92400E')
                  }}>
                    {isBn ? selectedReport.status_label_bn : selectedReport.status_label_en}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', marginTop: '2px' }}>
                    {selectedReport.findings}
                  </div>
                </div>
                {renderBadge(selectedReport.status)}
              </div>

              {/* Verified Land Specifications Table */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
                  {isBn ? 'দলিল ও পার্সেল পরিচিতি:' : 'Deed & Parcel Specifications:'}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>দলিল নম্বর:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedReport.deed_no}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>দাগ নম্বর:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--primary-accent)' }}>{selectedReport.dag_no}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>বিক্রেতার নাম:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{selectedReport.seller}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>খতিয়ান নম্বর:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{selectedReport.khatian_no}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>ক্রেতার নাম:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{selectedReport.buyer}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>মৌজা:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{selectedReport.mouza}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>জমির পরিমাণ:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 800 }}>{selectedReport.area_decimal} শতক</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>যাচাই ইঞ্জিন:</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Deterministic Rules</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Statutory Non-Legal Ownership Boundary */}
              <div style={{
                background: '#FAF7F0',
                border: '1px solid #CAD7CF',
                borderRadius: '6px',
                padding: '12px 14px',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                marginBottom: '20px'
              }}>
                <strong>আইনি ঘোষণা ও সীমাবদ্ধতা:</strong> এই প্রতিবেদনটি সংরক্ষিত কৃত্রিম লেনদেন রেকর্ডের সাথে গাণিতিক ও নিয়ম-ভিত্তিক তুলনামূলক ফলাফল প্রকাশ করে। এটি কোনো আইনি সনদ, স্বত্বের নিশ্চয়তা বা আদালতের রায় নয়। চূড়ান্ত ক্রয়ের পূর্বে অবশ্যই সংশ্লিষ্ট সরকারি সাব-রেজিস্ট্রি অফিস ও এসি ল্যান্ড অফিসে মূল বালাম বহি ও নথি যাচাই করুন।
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onViewPassport && onViewPassport('PCL-DHK-GUL-015-0550')}
                  className="btn-primary"
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileBadge size={14} />
                  <span>{isBn ? 'সংশ্লিষ্ট প্লট পাসপোর্ট দেখুন' : 'View Plot Passport'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
