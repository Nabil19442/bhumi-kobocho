import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  FileBadge, 
  Calendar, 
  User, 
  MapPin, 
  Hash, 
  Maximize2, 
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { searchLandHistory } from '../api';
import ProposedPurchaseModal from '../components/ProposedPurchaseModal';

const PRESET_PARCELS = [
  { id: 'PCL-DHK-GUL-015-0550', dag: '550', mouza: 'গুলশান', label: 'দাগ ৫৫০ (গুলশান) — দ্বৈত বিক্রয় টেস্ট' },
  { id: 'PCL-DHK-SAV-045-0784', dag: '784', mouza: 'সাভার', label: 'দাগ ৭৮৪ (সাভার) — এরিয়া ওভারল্যাপ টেস্ট' },
  { id: 'PCL-DHK-MIR-028-1058', dag: '1058', mouza: 'মিরপুর', label: 'দাগ ১০৫৮ (মিরপুর) — স্বাভাবিক ধারাবাহিক চেইন' },
  { id: 'PCL-CTG-KOT-088-3310', dag: '3310', mouza: 'আন্দরকিল্লা', label: 'দাগ ৩৩১০ (চট্টগ্রাম) — অসম্পূর্ণ ইতিহাস টেস্ট' },
  { id: 'PCL-SYL-SAD-032-1540', dag: '1540', mouza: 'আম্বরখানা', label: 'দাগ ১৫৪০ (সিলেট) — বহুবিধ লেনদেনের ইতিহাস' },
  { id: 'PCL-DHK-SHA-012-1234', dag: '1234', mouza: 'শান্তিপুর', label: 'দাগ ১২৩৪ (শান্তিপুর) — ডেমো পিডিএফ দলিল' }
];

export default function HistoryPage({ t, lang = 'bn', onViewPassport }) {
  const isBn = lang === 'bn';

  const [searchParams, setSearchParams] = useState({
    dag_no: '550',
    khatian_no: '',
    mouza: '',
    deed_no: '',
    parcel_id: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [historyResult, setHistoryResult] = useState(null);
  const [selectedParcelId, setSelectedParcelId] = useState('PCL-DHK-GUL-015-0550');
  const [activeSourceFilter, setActiveSourceFilter] = useState('ALL');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const fetchHistory = async (overrideParams = null) => {
    setIsLoading(true);
    try {
      const q = overrideParams || searchParams;
      const cleanQ = {};
      Object.keys(q).forEach(k => {
        if (q[k] && q[k].trim()) cleanQ[k] = q[k].trim();
      });

      const res = await searchLandHistory(cleanQ);
      setHistoryResult(res);
      if (res && res.records && res.records.length > 0) {
        setSelectedParcelId(res.records[0].parcel_id || cleanQ.parcel_id || 'PCL-PARCEL');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory({ dag_no: '550' });
  }, []);

  const handleSelectPreset = (preset) => {
    setSelectedParcelId(preset.id);
    setSearchParams(prev => ({ ...prev, dag_no: preset.dag, mouza: preset.mouza, parcel_id: '' }));
    fetchHistory({ dag_no: preset.dag, mouza: preset.mouza });
  };

  const records = historyResult?.records || [];
  const hasHistory = historyResult?.has_history && records.length > 0;

  // Filter records by source if selected
  const filteredRecords = records.filter(r => {
    if (activeSourceFilter === 'ALL') return true;
    return r.record_source === activeSourceFilter;
  });

  const currentParcel = records[0] || null;

  const renderSourceBadge = (source) => {
    if (source === 'Officially Verified Records') {
      return (
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#DCFCE7',
          color: '#166534',
          border: '1px solid #86EFAC'
        }}>
          {isBn ? 'অফিসিয়ালি ভেরিফাইড রেকর্ড' : 'Officially Verified Records'}
        </span>
      );
    }
    if (source === 'User-Submitted Records') {
      return (
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FDE68A'
        }}>
          {isBn ? 'ব্যবহারকারীর দাখিলকৃত রেকর্ড' : 'User-Submitted Records'}
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '0.74rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        padding: '2px 8px',
        borderRadius: '4px',
        background: '#DBEAFE',
        color: '#1E40AF',
        border: '1px solid #BFDBFE'
      }}>
        {isBn ? 'কৃত্রিম ডেমো রেকর্ড' : 'Synthetic Demo Records'}
      </span>
    );
  };

  return (
    <div className="history-page-root" style={{
      maxWidth: 'var(--max-content-width)',
      margin: '0 auto',
      padding: '32px var(--gutter-desktop)',
      boxSizing: 'border-box'
    }}>
      {/* Page Title & Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
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
          <History size={14} />
          <span>{isBn ? 'পার্সেল ভিত্তিক লেনদেনের ইতিহাস ও চেইন অব টাইটেল' : 'PARCEL TITLE REGISTRY & CHAIN OF CUSTODY'}</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          fontFamily: 'var(--font-heading)',
          margin: '0 0 8px 0'
        }}>
          {isBn ? 'জমির ঐতিহাসিক লেনদেন অনুসন্ধান' : 'Land Transaction History'}
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
            ? 'জমির দাগ, খতিয়ান বা পার্সেল আইডির অধীনে সংরক্ষিত ২০,০০০+ ঐতিহাসিক রেকর্ডের সম্পূর্ণ ধারাবাহিক হস্তান্তর ইতিহাস দেখুন। পূর্ববর্তী ক্রেতা-বিক্রেতা ও ক্ষেত্রফলের সামঞ্জস্য যাচাই করুন।'
            : 'Explore historical transfers, unbroken title chains, previous buyers/sellers, and acreage holding balances under stable Parcel IDs across 20,000+ synthetic records.'}
        </p>
      </div>

      {/* Quick Specimen Presets */}
      <div style={{
        background: 'var(--bg-paper)',
        borderRadius: 'var(--radius-std)',
        border: '1.5px solid var(--line)',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
          {isBn ? 'দ্রুত পরীক্ষামূলক পার্সেল নির্বাচন করুন:' : 'QUICK PARCEL PRESETS:'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_PARCELS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: selectedParcelId === p.id ? '2px solid var(--primary-accent)' : '1px solid var(--line)',
                background: selectedParcelId === p.id ? 'var(--accent-tint)' : 'var(--bg-card)',
                color: selectedParcelId === p.id ? 'var(--primary-accent)' : 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar Form */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-std)',
        border: '1.5px solid var(--line)',
        padding: '20px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchHistory(); }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {isBn ? 'দাগ নম্বর (Dag No)' : 'Dag Number'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'যেমন: ৫৫০ বা ১২৩৪' : 'e.g. 550 or 1234'}
                value={searchParams.dag_no}
                onChange={(e) => setSearchParams(prev => ({ ...prev, dag_no: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {isBn ? 'খতিয়ান নম্বর (Khatian)' : 'Khatian Number'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'যেমন: ২২০' : 'e.g. 220'}
                value={searchParams.khatian_no}
                onChange={(e) => setSearchParams(prev => ({ ...prev, khatian_no: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {isBn ? 'মৌজা (Mouza)' : 'Mouza'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'যেমন: গুলশান' : 'e.g. Gulshan'}
                value={searchParams.mouza}
                onChange={(e) => setSearchParams(prev => ({ ...prev, mouza: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {isBn ? 'দলিল নম্বর (Deed No)' : 'Deed Number'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'যেমন: 1102/2020' : 'e.g. 1102/2020'}
                value={searchParams.deed_no}
                onChange={(e) => setSearchParams(prev => ({ ...prev, deed_no: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '4px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Search size={15} />
                <span>{isLoading ? (isBn ? 'অনুসন্ধান হচ্ছে...' : 'Searching...') : (isBn ? 'অনুসন্ধান করুন' : 'Search History')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Results View */}
      {hasHistory && currentParcel ? (
        <div>
          {/* Parcel Header Card */}
          <div style={{
            background: 'var(--bg-paper)',
            borderRadius: 'var(--radius-md, 12px)',
            border: '2px solid var(--text-main)',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-hard-sm)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', borderBottom: '1px solid #CAD7CF', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    STABLE PARCEL ID:
                  </span>
                  <span style={{
                    fontSize: '0.94rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    background: 'var(--accent-tint)',
                    color: 'var(--primary-accent)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #C4D6F5'
                  }}>
                    {currentParcel.parcel_id || selectedParcelId}
                  </span>
                  {renderSourceBadge(currentParcel.record_source)}
                </div>

                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  মৌজা: {currentParcel.mouza} (JL: {currentParcel.jl_no}) &bull; দাগ নং: {currentParcel.dag_no} &bull; খতিয়ান: {currentParcel.khatian_no}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="btn-secondary"
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--text-main)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <PlusCircle size={15} />
                  <span>{isBn ? 'প্রস্তাবিত ক্রয় রেকর্ড করুন' : 'Record Proposed Purchase'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewPassport && onViewPassport(currentParcel.parcel_id || selectedParcelId)}
                  className="btn-primary"
                  style={{
                    height: '40px',
                    padding: '0 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '6px'
                  }}
                >
                  <FileBadge size={15} />
                  <span>{isBn ? 'প্লট পাসপোর্ট ও কিউআর দেখুন' : 'View Plot Passport & QR'}</span>
                </button>
              </div>
            </div>

            {/* Quick Parcel Specs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              fontSize: '0.86rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>মোট জমির ক্ষেত্রফল: </span>
                <strong>{currentParcel.total_parcel_area} শতক</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>সর্বশেষ নিবন্ধিত বিক্রেতা: </span>
                <strong>{currentParcel.seller_name_bn}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>সর্বশেষ নিবন্ধিত ক্রেতা: </span>
                <strong>{records[records.length - 1]?.buyer_name_bn || currentParcel.buyer_name_bn}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>হস্তান্তর সংখ্যা: </span>
                <strong style={{ color: 'var(--primary-accent)' }}>{records.length} টি নিবন্ধিত লেনদেন</strong>
              </div>
            </div>
          </div>

          {/* Filter Bar by Source */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isBn ? 'কালানুক্রমিক দলিলের ধারাবাহিক ইতিহাস (Chain of Custody)' : 'Chronological Chain of Custody'}
            </h3>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'Synthetic Demo Records', 'User-Submitted Records', 'Officially Verified Records'].map(filterKey => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setActiveSourceFilter(filterKey)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: activeSourceFilter === filterKey ? 'var(--text-main)' : 'var(--bg-card)',
                    color: activeSourceFilter === filterKey ? '#FFFFFF' : 'var(--text-main)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {filterKey === 'ALL' ? (isBn ? 'সকল রেকর্ড' : 'All') : filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction History Data Table */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-std)',
            border: '1.5px solid var(--line)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--dark-band)', color: '#EAF0E8', fontFamily: 'var(--font-heading)' }}>
                  <th style={{ padding: '12px 14px' }}>#</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'দলিল নম্বর ও তারিখ' : 'Deed No & Date'}</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'লেনদেনের ধরন' : 'Type'}</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'বিক্রেতা' : 'Seller'}</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'ক্রেতা' : 'Buyer'}</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'হস্তান্তরিত পরিমাণ' : 'Transferred'}</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'অবশিষ্ট জমি' : 'Remaining'}</th>
                  <th style={{ padding: '12px 14px' }}>{isBn ? 'রেকর্ড উৎস' : 'Source'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((tx, idx) => (
                  <tr
                    key={tx.id || idx}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: tx.seller_remaining_area < 0 ? '#FEF2F2' : (idx % 2 === 0 ? 'var(--bg-paper)' : 'var(--bg-card)')
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                        {tx.deed_no}
                      </strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {tx.transaction_date || 'তারিখ অপ্রাপ্য'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 600 }}>{tx.transaction_type || 'সাব-কবলা'}</span>
                      {tx.prior_deed_no && tx.prior_deed_no !== 'NONE' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          সূত্র: {tx.prior_deed_no}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {tx.seller_name_bn}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--primary-accent)', fontWeight: 700 }}>
                      {tx.buyer_name_bn}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {tx.transferred_area} শতক
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: tx.seller_remaining_area < 0 ? '#DC2626' : '#16A34A' }}>
                      {tx.seller_remaining_area} শতক
                      {tx.seller_remaining_area < 0 && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#DC2626' }}>
                          (ঘাটতি/ওভারল্যাপ)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {renderSourceBadge(tx.record_source)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty / Not Found State */
        <div style={{
          background: 'var(--bg-paper)',
          borderRadius: 'var(--radius-std)',
          border: '1.5px solid var(--line)',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FEF3C7',
            color: '#B45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            {isBn ? 'পূর্ববর্তী রেকর্ড পাওয়া যায়নি' : 'Previous Land Record Not Found'}
          </h3>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.55 }}>
            {isBn
              ? 'এই দাগ বা খতিয়ানের বিপরীতে সংরক্ষিত কৃত্রিম ডাটাবেজে কোনো নিবন্ধিত দলিল পাওয়া যায়নি। অনুগ্রহ করে উপরে প্রিসেট পার্সেলগুলো নির্বাচন করুন অথবা দাগ নম্বর পরিবর্তন করুন।'
              : 'No matching transaction records found for this Dag and Khatian in the synthetic repository. Please choose a preset parcel above or verify physical records.'}
          </p>

          <button
            type="button"
            onClick={() => handleSelectPreset(PRESET_PARCELS[0])}
            className="btn-primary"
            style={{
              height: '40px',
              padding: '0 20px',
              borderRadius: '6px',
              fontSize: '0.86rem',
              fontWeight: 700
            }}
          >
            {isBn ? 'নমুনা দাগ ৫৫০ লোড করুন' : 'Load Demo Plot #550'}
          </button>
        </div>
      )}

      {/* Proposed Purchase Modal */}
      <ProposedPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        parcelData={currentParcel}
        lang={lang}
        onPurchaseRecorded={() => {
          fetchHistory();
        }}
      />
    </div>
  );
}
