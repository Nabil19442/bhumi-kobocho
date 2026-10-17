import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, User, Calendar, MapPin, Hash, Maximize2, ShieldAlert, ArrowRight } from 'lucide-react';
import { recordProposedPurchaseApi } from '../api';

export default function ProposedPurchaseModal({
  isOpen,
  onClose,
  parcelData,
  lang = 'bn',
  onPurchaseRecorded
}) {
  if (!isOpen) return null;

  const isBn = lang === 'bn';

  const [buyerName, setBuyerName] = useState('');
  const [areaDecimal, setAreaDecimal] = useState(parcelData?.area_decimal || '10.0');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে প্রস্তাবিত ক্রেতার নাম লিখুন' : 'Please enter the proposed buyer name');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        parcel_id: parcelData?.parcel_id || parcelData?.id,
        dag_no: String(parcelData?.dag_no || ''),
        khatian_no: String(parcelData?.khatian_no || ''),
        mouza: parcelData?.mouza || '',
        jl_no: String(parcelData?.jl_no || ''),
        seller_name: parcelData?.owner_name_bn || parcelData?.seller_name || parcelData?.buyer_name_bn || 'বর্তমান দখলদার',
        buyer_name: buyerName.trim(),
        area_decimal: parseFloat(areaDecimal) || 10.0,
        transaction_date: purchaseDate,
        land_class: parcelData?.land_class || 'নাল (Nal / Agricultural)'
      };

      const res = await recordProposedPurchaseApi(payload);
      setResult(res);
      if (onPurchaseRecorded) {
        onPurchaseRecorded(res);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to record proposed transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16, 39, 42, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(3px)'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-card"
        style={{
          background: 'var(--bg-paper)',
          borderRadius: 'var(--radius-md, 12px)',
          border: '2px solid var(--text-main)',
          boxShadow: 'var(--shadow-hard)',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: 'var(--dark-band)',
          color: '#EAF0E8',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--text-main)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#FDE68A' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isBn ? 'প্রস্তাবিত জমি ক্রয় রেকর্ড করুন' : 'Record Proposed Land Purchase'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#BACEC7',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px' }}>
          {/* Strict Non-Legal Ownership Warning */}
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            fontSize: '0.82rem',
            color: '#92400E',
            lineHeight: 1.5
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{isBn ? 'আইনি সতর্কতা:' : 'LEGAL DISCLAIMER:'}</strong>{' '}
              {isBn
                ? 'এই কার্যক্রমটি হ্যাকাথন ডেমোর উদ্দেশ্যে কৃত্রিম হিস্ট্রিতে রেকর্ড করা হচ্ছে। এটি সরকারি সাব-রেজিস্ট্রি রেজিস্ট্রেশন সম্পন্ন করে না এবং কোনো আইনি মালিকানা স্থানান্তর প্রমাণ করে না।'
                : 'This action records a simulated purchase in the demo dataset for testing. It does NOT legally transfer ownership or complete official government deed registration.'}
            </div>
          </div>

          {result ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {isBn ? 'প্রস্তাবিত ক্রয় সফলভাবে অন্তর্ভুক্ত হয়েছে' : 'Proposed Purchase Recorded'}
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', marginBottom: '20px' }}>
                {isBn
                  ? `পার্সেল ${result.parcel_id}-এর লেনদেনের ইতিহাসে নতুন প্রস্তাবিত ক্রয় রেকর্ড যুক্ত করা হয়েছে। সংশ্লিষ্ট প্লট পাসপোর্ট ও টাইমলাইনে এখন এটি দেখা যাবে।`
                  : `Successfully added to the transaction history for parcel ${result.parcel_id}. The Plot Passport and chain of custody are updated.`}
              </p>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                textAlign: 'left',
                marginBottom: '20px'
              }}>
                <div><strong>দলিল নং:</strong> {result.record?.deed_no}</div>
                <div><strong>ক্রেতা:</strong> {result.record?.buyer_name_bn}</div>
                <div><strong>পরিমাণ:</strong> {result.record?.transferred_area} শতক</div>
                <div><strong>উৎস:</strong> {result.record?.record_source}</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{
                  height: '42px',
                  padding: '0 24px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}
              >
                {isBn ? 'সম্পন্ন করুন ও পাসপোর্ট দেখুন' : 'Done & View Passport'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {isBn ? 'পার্সেল / দাগ নং' : 'Parcel / Dag No'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={parcelData?.parcel_id ? `${parcelData.parcel_id} (দাগ: ${parcelData.dag_no || ''})` : `দাগ নং: ${parcelData?.dag_no || 'N/A'}`}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {isBn ? 'বর্তমান বিক্রেতা' : 'Current Seller'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={parcelData?.owner_name_bn || parcelData?.seller_name || parcelData?.buyer_name_bn || 'রেকর্ডভুক্ত বিক্রেতা'}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? 'প্রস্তাবিত ক্রেতার নাম *' : 'Proposed Buyer Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'উদা: মোঃ নাজমুল হুদা' : 'e.g., Md. Nazmul Huda'}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid var(--text-main)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    background: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {isBn ? 'প্রস্তাবিত ক্রয়কৃত পরিমাণ (শতক)' : 'Proposed Area (Decimals)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={areaDecimal}
                    onChange={(e) => setAreaDecimal(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1.5px solid var(--text-main)',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {isBn ? 'প্রস্তাবের তারিখ' : 'Proposal Date'}
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1.5px solid var(--text-main)',
                      borderRadius: '4px',
                      fontSize: '0.88rem',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  background: '#FEE2E2',
                  color: '#991B1B',
                  fontSize: '0.82rem',
                  marginBottom: '14px'
                }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg-card)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '4px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Recording...') : (isBn ? 'প্রস্তাবিত ক্রয় সংরক্ষণ করুন' : 'Record Purchase')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
