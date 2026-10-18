import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  FileText, 
  FileCheck, 
  User, 
  Calendar, 
  MapPin, 
  Hash, 
  Layers, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  HelpCircle, 
  CheckCircle2, 
  RefreshCw, 
  Scale, 
  Landmark, 
  FileBadge, 
  GitCompare,
  Edit2,
  Check,
  X,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { checkLandApi, fetchHealth, predictLandPriceApi } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

const DEMO_SPECIMENS = [
  {
    id: 'sample-clean',
    title: 'নমুনা ১: শান্তিপুর দাগ ১২৩৪ (PDF দলিল)',
    subtitle: 'Sample PDF Deed — Shantipur Plot #1234 (Clean Chain)',
    type: 'pdf'
  },
  {
    id: 'sample-001',
    title: 'নমুনা ২: মিরপুর দাগ ১০৫৮ (PNG দলিল)',
    subtitle: 'Deed 1482/2021 — Mirpur Plot #1058',
    type: 'png'
  },
  {
    id: 'sample-002',
    title: 'নমুনা ৩: বাড্ডা দাগ ২৪৯০ (PNG দলিল)',
    subtitle: 'Deed 8901/2019 — Badda Plot #2490 (Acquisition Inquiry)',
    type: 'png'
  },
  {
    id: 'sample-003',
    title: 'নমুনা ৪: সাভার দাগ ৭৮৪ (PNG দলিল)',
    subtitle: 'Deed 2311/2018 — Savar Plot #784 (Active Mortgage)',
    type: 'png'
  },
  {
    id: 'sample-duplicate',
    title: 'নমুনা ৫: গুলশান দাগ ৫৫০ (PNG দলিল)',
    subtitle: 'Deed 4520/2023 — Gulshan Plot #550 (Pending Court Case)',
    type: 'png'
  }
];

export default function CheckLandPage({
  t,
  lang = 'bn',
  onViewPassport,
  onProceedToCompare,
  onViewLandPrice
}) {
  const isBn = lang === 'bn';

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);

  // Editable fields state for correcting low-confidence OCR reads
  const [editingKey, setEditingKey] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Synthetic land price estimation state for found parcel
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [isPriceEstimating, setIsPriceEstimating] = useState(false);
  const [priceError, setPriceError] = useState(null);

  const formatBdt = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '০';
    const formatted = Math.round(Number(num)).toLocaleString('en-IN');
    if (!isBn) return formatted;
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return formatted.replace(/[0-9]/g, d => bnDigits[Number(d)]);
  };

  // Prefill and estimate synthetic land price when a parcel is found
  useEffect(() => {
    if (!result || result.status !== 'found' || !result.parcel) {
      setPriceEstimate(null);
      setPriceError(null);
      setIsPriceEstimating(false);
      return;
    }

    let isMounted = true;
    async function runPriceEstimation() {
      setIsPriceEstimating(true);
      setPriceError(null);
      try {
        const area = parseFloat(result.parcel.total_area || 10.0) || 10.0;
        const clampedArea = Math.min(Math.max(area, 0.5), 500.0);

        // Resolve synthetic locations based on parcel or fallback
        let districtId = 'dist_north_rangpur';
        let upazilaId = 'upz_pirgacha';
        let mouzaId = 'mouza_chhatra_01';

        const pid = result.parcel.parcel_id || '';
        const mouzaStr = result.parcel.mouza || '';

        if (pid.includes('SYL') || mouzaStr.includes('সিলেট') || mouzaStr.includes('আম্বরখানা')) {
          districtId = 'dist_northeast_sylhet';
          upazilaId = 'upz_golapganj';
          mouzaId = 'mouza_fulbari_01';
        } else if (pid.includes('RAJ') || mouzaStr.includes('রাজশাহী')) {
          districtId = 'dist_west_rajshahi';
          upazilaId = 'upz_godagari';
          mouzaId = 'mouza_matikata_01';
        } else if (pid.includes('KHL') || mouzaStr.includes('খুলনা')) {
          districtId = 'dist_south_khulna';
          upazilaId = 'upz_dumuria';
          mouzaId = 'mouza_shahpur_01';
        } else if (pid.includes('MYM') || mouzaStr.includes('ময়মনসিংহ')) {
          districtId = 'dist_central_mymensingh';
          upazilaId = 'upz_fulbaria';
          mouzaId = 'mouza_radhakanai_01';
        }

        // Resolve land type
        const lClass = (result.parcel.land_class || '').toLowerCase();
        let landType = 'agricultural_nal';
        if (lClass.includes('ভিটি') || lClass.includes('homestead') || lClass.includes('বাড়ি')) {
          landType = 'homestead_viti';
        } else if (lClass.includes('বাগান') || lClass.includes('orchard')) {
          landType = 'orchard_bagan';
        } else if (lClass.includes('পুকুর') || lClass.includes('pond') || lClass.includes('ডোবা')) {
          landType = 'pond_doba';
        } else if (lClass.includes('বাণিজ্যিক') || lClass.includes('দোকান') || lClass.includes('shop')) {
          landType = 'commercial_shop';
        }

        const payload = {
          land_area_decimal: clampedArea,
          district_id: districtId,
          upazila_id: upazilaId,
          mouza_id: mouzaId,
          land_type: landType,
          road_access_type: 'paved_pucca_road',
          road_width_ft: 12.0,
          distance_to_paved_road_m: 100.0,
          distance_to_local_market_km: 1.5,
          distance_to_upazila_center_km: 5.0,
          flood_risk_level: 'none',
          drainage_quality: 'moderate_sloped',
          access_road_available: true,
          electricity_available: true,
          water_access_available: true
        };

        const priceRes = await predictLandPriceApi(payload);
        if (isMounted) {
          setPriceEstimate(priceRes);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Synthetic land price prediction failed:', err);
          setPriceError(err);
          setPriceEstimate(null);
        }
      } finally {
        if (isMounted) {
          setIsPriceEstimating(false);
        }
      }
    }

    runPriceEstimation();
    return () => { isMounted = false; };
  }, [result]);

  // Loading step timer simulation for smooth progressive feedback
  useEffect(() => {
    let timer1, timer2;
    if (isLoading) {
      setLoadingStep(1);
      timer1 = setTimeout(() => setLoadingStep(2), 700);
      timer2 = setTimeout(() => setLoadingStep(3), 1500);
    } else {
      setLoadingStep(1);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoading]);

  // Handle file selection from drag-and-drop or browse
  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setApiError(null);
  };

  // Run the check with either the uploaded file or an explicit demo sample
  const handleRunCheck = async (sampleIdOverride = null) => {
    setIsLoading(true);
    setApiError(null);
    setResult(null);

    try {
      let res;
      if (sampleIdOverride) {
        const formData = new FormData();
        formData.append('sample_id', sampleIdOverride);
        formData.append('lang', lang);
        res = await checkLandApi(formData);
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('lang', lang);
        res = await checkLandApi(formData);
      } else {
        // Fallback to sample-clean if nothing selected
        const formData = new FormData();
        formData.append('sample_id', 'sample-clean');
        formData.append('lang', lang);
        res = await checkLandApi(formData);
      }

      setResult(res);

      // Initialize edit values from read deed_info
      if (res && res.deed_info) {
        const initEdits = {};
        res.deed_info.forEach(item => {
          initEdits[item.key] = item.value || '';
        });
        setEditValues(initEdits);
      }
    } catch (err) {
      console.error('Check land failed:', err);
      setApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run lookup with manually updated/corrected fields
  const handleUpdateAndRerun = async () => {
    if (!result) return;
    setIsLoading(true);
    setApiError(null);

    try {
      const payload = {
        extracted_data: editValues,
        lang: lang
      };
      const res = await checkLandApi(payload);
      setResult(res);
      setEditingKey(null);
    } catch (err) {
      console.error('Update re-check failed:', err);
      setApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge styling for legal/administrative cases
  const getCaseStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
          border: '#FDE68A',
          label: isBn ? 'বিচারাধীন (Pending)' : 'Pending'
        };
      case 'active':
        return {
          bg: '#FEE2E2',
          color: '#991B1B',
          border: '#FCA5A5',
          label: isBn ? 'সক্রিয় বহাল (Active)' : 'Active'
        };
      case 'under_review':
        return {
          bg: '#EFF6FF',
          color: '#1E40AF',
          border: '#BFDBFE',
          label: isBn ? 'পর্যালোচনাধীন (Under Review)' : 'Under Review'
        };
      case 'disposed':
      case 'released':
        return {
          bg: '#DCFCE7',
          color: '#166534',
          border: '#86EFAC',
          label: isBn ? 'নিস্পত্তিকৃত / অবমুক্ত (Disposed)' : 'Disposed / Released'
        };
      default:
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          border: '#E5E7EB',
          label: status
        };
    }
  };

  return (
    <div className="check-land-page-root" style={{
      maxWidth: 'var(--max-content-width, 1180px)',
      margin: '0 auto',
      padding: '32px 20px',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-body, system-ui, sans-serif)'
    }}>
      {/* 1. Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono, monospace)',
          fontWeight: 700,
          color: '#D97706',
          background: '#FEF3C7',
          padding: '4px 10px',
          borderRadius: '4px',
          border: '1px solid #FDE68A',
          marginBottom: '10px'
        }}>
          <span>DEMO DATA — NOT A LEGAL VERDICT / ডেমো তথ্য</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
          fontWeight: 800,
          color: 'var(--text-main, #0F172A)',
          fontFamily: 'var(--font-heading, inherit)',
          margin: '0 0 8px 0',
          letterSpacing: '-0.3px'
        }}>
          {isBn ? (t.check_page_title || 'জমি কেনার আগে যাচাই') : (t.check_page_title || 'Check Before You Buy')}
        </h1>

        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-body, #334155)',
          margin: 0,
          maxWidth: '820px',
          lineHeight: 1.6
        }}>
          {isBn 
            ? (t.check_page_subtitle || 'বিক্রেতার দলিল আপলোড করুন। ডেমো রেজিস্ট্রি থেকে দলিলের বিবরণ, পূর্ববর্তী মালিকানা, লেনদেনের ইতিহাস এবং সংশ্লিষ্ট মামলা সরাসরি দেখুন।')
            : (t.check_page_subtitle || "Upload seller's deed to inspect extracted details, previous owners, transaction history, and linked legal/administrative cases in the demo registry.")}
        </p>
      </div>

      {/* 2. Upload & Sample Specimen Selection Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px 0', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} style={{ color: 'var(--primary-accent, #2563EB)' }} />
          <span>{isBn ? (t.check_upload_title || 'দলিল আপলোড বা নমুনা নির্বাচন করুন') : (t.check_upload_title || 'Upload Deed or Select Specimen')}</span>
        </h2>

        {/* Drag and drop upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => document.getElementById('check-file-input').click()}
          style={{
            border: dragActive ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            background: dragActive ? '#EFF6FF' : '#F8FAFC',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '18px'
          }}
        >
          <input
            id="check-file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <FileText size={36} style={{ color: '#2563EB', margin: '0 auto 10px' }} />
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
            {selectedFile ? selectedFile.name : (isBn ? 'দলিল ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করুন' : 'Drag & drop deed here, or click to browse')}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            PDF, PNG, JPG (Max 10 MB)
          </div>
        </div>

        {/* Demo Specimen Quick-Pick Buttons */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isBn ? 'অথবা তাৎক্ষণিক ডেমো নমুনা নির্বাচন করুন:' : 'Or test immediately with a synthetic specimen:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
            {DEMO_SPECIMENS.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  handleRunCheck(spec.id);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  minHeight: '44px',
                  transition: 'border-color 0.15s ease, background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#F0F7FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {spec.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {spec.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Big Primary Action Button */}
        <button
          type="button"
          onClick={() => handleRunCheck()}
          disabled={isLoading}
          style={{
            width: '100%',
            minHeight: '48px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--primary-accent, #2563EB)',
            color: '#FFFFFF',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            transition: 'opacity 0.2s ease'
          }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spin" />
              <span>
                {loadingStep === 1 && (isBn ? 'দলিল পড়া হচ্ছে...' : 'Reading deed...')}
                {loadingStep === 2 && (isBn ? 'জমির রেকর্ড খোঁজা হচ্ছে...' : 'Finding land record...')}
                {loadingStep >= 3 && (isBn ? 'ইতিহাস ও সংশ্লিষ্ট মামলা লোড হচ্ছে...' : 'Loading history and cases...')}
              </span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>{isBn ? (t.check_read_deed_btn || 'দলিল দেখুন') : (t.check_read_deed_btn || 'Read this deed')}</span>
            </>
          )}
        </button>

        {/* Api Error or Server Cold-Start notice */}
        {apiError && (
          <div style={{ marginTop: '16px' }}>
            <ApiErrorNotice error={apiError} onRetry={() => handleRunCheck()} />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. RESULTS DISPLAY (PURELY INFORMATIVE, NO JUDGMENT) */}
      {/* ======================================================== */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* CARD 1: DEED INFORMATION (Everything read from the deed) */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {isBn ? (t.check_deed_info_title || 'দলিলের তথ্য') : (t.check_deed_info_title || 'Deed Information')}
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '2px' }}>
                  {isBn ? (t.check_deed_info_subtitle || 'আপলোডকৃত দলিল থেকে শনাক্তকৃত তথ্যাবলি:') : (t.check_deed_info_subtitle || 'Information extracted from the uploaded document:')}
                </div>
              </div>
              <span style={{ fontSize: '0.74rem', background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {result.disclaimer}
              </span>
            </div>

            {/* Field Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              {result.deed_info && result.deed_info.map((item) => {
                const isEditing = editingKey === item.key;
                const currentValue = editValues[item.key] !== undefined ? editValues[item.key] : item.value;

                return (
                  <div
                    key={item.key}
                    style={{
                      background: item.needs_check ? '#FFFBEB' : '#F8FAFC',
                      border: item.needs_check ? '1.5px solid #FCD34D' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                        {isBn ? item.label_bn : item.label_en}
                      </span>
                      {item.needs_check && !isEditing && (
                        <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertCircle size={12} />
                          <span>{isBn ? 'সন্দেহজনক - মিলিয়ে নিন' : 'please check'}</span>
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => setEditValues({ ...editValues, [item.key]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #2563EB',
                            fontSize: '0.9rem',
                            minHeight: '36px'
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-word' }}>
                          {currentValue || (isBn ? 'অপ্রাপ্য' : 'Not recorded')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingKey(item.key)}
                          aria-label={`Edit ${item.label_en}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            padding: '4px',
                            minHeight: '28px',
                            minWidth: '28px'
                          }}
                          title={isBn ? 'সম্পাদনা করুন' : 'Edit field'}
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Re-lookup trigger if user modified any field */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleUpdateAndRerun}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#1E293B',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                <span>{isBn ? (t.check_update_btn || 'সংশোধন করুন ও পুনঃঅনুসন্ধান চালান') : (t.check_update_btn || 'Update & Re-lookup')}</span>
              </button>
            </div>
          </div>

          {/* NOT-FOUND STATE (IF PARCEL NOT IN REGISTRY) */}
          {result.status === 'not_found' && (
            <div style={{
              background: '#FFFBEB',
              borderRadius: '16px',
              border: '1.5px solid #FCD34D',
              padding: '24px',
              color: '#92400E'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <AlertCircle size={24} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0', color: '#78350F' }}>
                    {isBn ? (t.check_not_found_title || 'ডেমো রেজিস্ট্রিতে এই জমি পাওয়া যায়নি') : (t.check_not_found_title || 'Land Not Found in Demo Registry')}
                  </h3>
                  <p style={{ fontSize: '0.92rem', margin: 0, lineHeight: 1.6 }}>
                    {isBn
                      ? 'দলিল থেকে তথ্য পড়া হয়েছে, কিন্তু প্রদত্ত দাগ বা খতিয়ানের বিপরীতে আমাদের ডেমো ডাটাবেজে কোনো রেকর্ড পাওয়া যায়নি। লাইভ সাব-রেজিস্ট্রি বা ভূমি অফিসে সরাসরি অনুসন্ধান প্রয়োজন।'
                      : 'Deed information was read, but no historical record matching this Dag or Khatian exists in our synthetic registry. Please perform a manual search at the local land office.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FOUND STATE: PARCEL METADATA & OWNERSHIP */}
          {result.status === 'found' && result.parcel && (
            <>
              {/* CARD 2: PREVIOUS OWNERS (Ownership History, Newest First) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                      {isBn ? (t.check_ownership_title || 'এই জমির আগের মালিক') : (t.check_ownership_title || 'Previous Owners')}
                    </h2>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '2px' }}>
                      {isBn ? (t.check_ownership_subtitle || 'ডেমো রেজিস্ট্রি অনুযায়ী মালিকানার ধারাবাহিক ইতিহাস (সর্বশেষ মালিক প্রথমে):') : (t.check_ownership_subtitle || 'Recorded chain of ownership in demo registry (newest first):')}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#2563EB', background: '#EFF6FF', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Parcel ID: {result.parcel.parcel_id}
                  </span>
                </div>

                {/* Vertical Timeline */}
                <div style={{ position: 'relative', paddingLeft: '28px' }}>
                  {/* Vertical Line */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    bottom: '12px',
                    left: '11px',
                    width: '2px',
                    background: '#CBD5E1'
                  }} />

                  {result.ownership_history && result.ownership_history.map((node, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        marginBottom: idx === result.ownership_history.length - 1 ? 0 : '20px'
                      }}
                    >
                      {/* Timeline Node Dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-28px',
                        top: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: node.is_current ? '#2563EB' : '#94A3B8',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {node.order}
                      </div>

                      {/* Content Card */}
                      <div style={{
                        background: node.is_current ? '#F0FDF4' : '#F8FAFC',
                        border: node.is_current ? '1.5px solid #86EFAC' : '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '14px 16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                            {isBn ? node.owner_name_bn : node.owner_name_en}
                          </span>
                          {node.is_current && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#DCFCE7',
                              color: '#166534',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #86EFAC'
                            }}>
                              {isBn ? 'বর্তমান রেকর্ডীয় মালিক' : 'Current Recorded Owner'}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: '#475569' }}>
                          <div>
                            <span style={{ color: '#64748B' }}>{isBn ? 'হস্তান্তর ধরন: ' : 'Method: '}</span>
                            <span style={{ fontWeight: 600 }}>{node.how}</span>
                          </div>
                          <div>
                            <span style={{ color: '#64748B' }}>{isBn ? 'দলিল নং: ' : 'Deed: '}</span>
                            <span style={{ fontWeight: 600 }}>{node.deed_no}</span>
                          </div>
                          <div>
                            <span style={{ color: '#64748B' }}>{isBn ? 'তারিখ: ' : 'Date: '}</span>
                            <span style={{ fontWeight: 600 }}>{node.acquired_date}</span>
                          </div>
                          <div>
                            <span style={{ color: '#64748B' }}>{isBn ? 'জমির পরিমাণ: ' : 'Area: '}</span>
                            <span style={{ fontWeight: 600 }}>{node.area} শতক</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 3: TRANSACTION HISTORY TABLE */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
              }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                  {isBn ? (t.check_transactions_title || 'লেনদেনের ইতিহাস') : (t.check_transactions_title || 'Transaction History')}
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '18px' }}>
                  {isBn ? (t.check_transactions_subtitle || 'এই জমিতে ইতিপূর্বে সম্পাদিত হস্তান্তরের বিবরণ:') : (t.check_transactions_subtitle || 'Past conveyances and transfers recorded on this land:')}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>{isBn ? 'তারিখ' : 'Date'}</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>{isBn ? 'বিক্রেতা (হতে)' : 'From (Seller)'}</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>{isBn ? 'ক্রেতা (অনুকূলে)' : 'To (Buyer)'}</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>{isBn ? 'দলিল নম্বর' : 'Deed No'}</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>{isBn ? 'পরিমাণ' : 'Area'}</th>
                        <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>{isBn ? 'দলিল শ্রেণি' : 'Type'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.transactions && result.transactions.map((tx, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>{tx.date}</td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>{isBn ? tx.from_bn : tx.from_en}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{isBn ? tx.to_bn : tx.to_en}</td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontFamily: 'var(--font-mono, monospace)' }}>{tx.deed_no}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{tx.area} শতক</td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>{tx.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD 4: CASES AND LAND STATUS */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
              }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                  {isBn ? (t.check_cases_title || 'মামলা ও অন্যান্য অবস্থা') : (t.check_cases_title || 'Cases and Land Status')}
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '18px' }}>
                  {isBn ? (t.check_cases_subtitle || 'এই জমির সাথে সংশ্লিষ্ট দেওয়ানি মামলা, নামজারি, ব্যাংক বন্ধক ও অধিগ্রহণ অনুসন্ধান:') : (t.check_cases_subtitle || 'Court disputes, mutation records, bank mortgages, and acquisition inquiries linked to this parcel:')}
                </div>

                {result.cases && result.cases.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {result.cases.map((c) => {
                      const badge = getCaseStatusBadge(c.status);
                      return (
                        <div
                          key={c.case_id}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {c.type === 'court_case' && <Scale size={18} style={{ color: '#D97706' }} />}
                              {c.type === 'mortgage' && <Landmark size={18} style={{ color: '#DC2626' }} />}
                              {c.type === 'mutation_case' && <FileCheck size={18} style={{ color: '#16A34A' }} />}
                              {c.type === 'khas_acquisition' && <AlertCircle size={18} style={{ color: '#2563EB' }} />}
                              <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>
                                {isBn ? c.title_bn : c.title_en}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {badge.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '6px' }}>
                            <span>{c.authority}</span> &bull; <span>{isBn ? 'দায়ের/শুরুর তারিখ: ' : 'Filed: '}{c.filed_date}</span> &bull; <span>ID: {c.case_id}</span>
                          </div>

                          <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                            {isBn ? c.summary_bn : c.summary_en}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '20px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    color: '#64748B',
                    textAlign: 'center',
                    fontSize: '0.92rem'
                  }}>
                    {isBn ? (t.check_cases_empty || 'এই ডেমো রেজিস্ট্রিতে কোনো মামলা পাওয়া যায়নি। (লাইভ সরকারি রেকর্ড যাচাই করা হয়নি)') : (t.check_cases_empty || 'No case found in this demo registry. Live records were NOT checked.')}
                  </div>
                )}
              </div>

              {/* CARD 5: ESTIMATED LAND PRICE (EXPERIMENTAL ML) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={22} style={{ color: '#059669' }} />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                      {isBn ? 'সম্ভাব্য মূল্য (পরীক্ষামূলক)' : 'Estimated Price (Experimental)'}
                    </h2>
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={12} />
                    <span>ML DEMO</span>
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '16px' }}>
                  {isBn
                    ? 'কৃত্রিম মেশিন লার্নিং মডেল ভিত্তিক আনুমানিক মূল্য সীমা (ঐচ্ছিক সহায়ক তথ্য):'
                    : 'Machine learning estimated price range based on synthetic spatial factors:'}
                </div>

                {/* Mandatory Disclaimer Badge */}
                <div style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertCircle size={16} style={{ color: '#D97706', marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.5 }}>
                    <strong>{isBn ? 'সতর্কবার্তা: ' : 'Disclaimer: '}</strong>
                    {isBn
                      ? 'Synthetic training data. Not a market valuation. Do not use to value real land. (কৃত্রিম ডেটায় প্রশিক্ষিত মডেল — এটি কোনো বাস্তব বাজারমূল্য বা আইনি মূল্যায়ন নয়। প্রকৃত জমি মূল্যায়নে এটি ব্যবহার করবেন না।)'
                      : 'Synthetic training data. Not a market valuation. Do not use to value real land.'}
                  </div>
                </div>

                {isPriceEstimating ? (
                  <div style={{
                    padding: '28px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    color: '#64748B',
                    fontSize: '0.9rem'
                  }}>
                    <RefreshCw size={18} className="spin" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                    <span>{isBn ? 'সম্ভাব্য মূল্য প্রাক্কলন করা হচ্ছে...' : 'Estimating synthetic land value...'}</span>
                  </div>
                ) : priceEstimate && priceEstimate.predicted_total_price_bdt ? (
                  <div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '14px',
                      marginBottom: '18px'
                    }}>
                      {/* Total Range */}
                      <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: '10px',
                        padding: '16px'
                      }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {isBn ? 'মোট সম্ভাব্য মূল্য সীমা (৮০%)' : 'Total Price Range (80% CI)'}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#14532D', fontFamily: 'var(--font-heading)' }}>
                          ৳{formatBdt(priceEstimate.total_price_interval?.lower)} – ৳{formatBdt(priceEstimate.total_price_interval?.upper)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '4px' }}>
                          {isBn ? `গড় পূর্বাভাস: ৳${formatBdt(priceEstimate.predicted_total_price_bdt)}` : `Point estimate: ৳${formatBdt(priceEstimate.predicted_total_price_bdt)}`}
                        </div>
                      </div>

                      {/* Per Decimal Range */}
                      <div style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '16px'
                      }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {isBn ? 'প্রতি শতক সম্ভাব্য মূল্য সীমা' : 'Price Range Per Decimal'}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                          ৳{formatBdt(priceEstimate.price_per_decimal_interval?.lower)} – ৳{formatBdt(priceEstimate.price_per_decimal_interval?.upper)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                          {isBn ? `গড়: ৳${formatBdt(priceEstimate.predicted_price_per_decimal_bdt)} / শতক` : `Avg: ৳${formatBdt(priceEstimate.predicted_price_per_decimal_bdt)} / decimal`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {isBn ? 'মডেল: HistGradientBoostingRegressor · ২০,০০০ কৃত্রিম প্রশিক্ষণ রেকর্ড' : 'Algorithm: HistGradientBoostingRegressor · 20k Synthetic Samples'}
                      </span>
                      {onViewLandPrice && (
                        <button
                          type="button"
                          onClick={onViewLandPrice}
                          style={{
                            background: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <span>{isBn ? 'সম্পূর্ণ মূল্য টুল দেখুন' : 'Open Full Valuation Tool'}</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    color: '#64748B',
                    fontSize: '0.86rem',
                    textAlign: 'center'
                  }}>
                    {isBn ? 'এই পার্সেলের জন্য কৃত্রিম মূল্য বিশ্লেষণ উপলব্ধ নয়।' : 'Synthetic land price estimation unavailable for this parcel.'}
                  </div>
                )}
              </div>
            </>
          )}

          {/* CARD 6: WHAT WAS NOT CHECKED & NEXT STEPS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {/* What Was Not Checked */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              padding: '22px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', color: '#78350F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ color: '#D97706' }} />
                <span>{isBn ? (t.check_not_checked_title || 'যা যাচাই হয়নি') : (t.check_not_checked_title || 'What Was NOT Checked')}</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                {result.not_checked && result.not_checked.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Next Official Steps */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              padding: '22px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                <span>{isBn ? (t.check_next_steps_title || 'পরবর্তী সরকারি ও প্রশাসনিক পদক্ষেপ') : (t.check_next_steps_title || 'Recommended Next Official Steps')}</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                {result.next_official_steps && result.next_official_steps.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. Footer Navigation Links to Existing Deep-Dive Views */}
          {result.status === 'found' && result.parcel && (
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.86rem', color: '#475569', fontWeight: 600 }}>
                {isBn ? 'এই জমির গভীর বিশ্লেষণ ও বিস্তারিত পাসপোর্ট দেখতে চান?' : 'Need a comprehensive parcel passport or field comparison?'}
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {onViewPassport && (
                  <button
                    type="button"
                    onClick={() => onViewPassport(result.parcel.parcel_id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      minHeight: '44px'
                    }}
                  >
                    <FileBadge size={15} style={{ color: '#2563EB' }} />
                    <span>{isBn ? 'সম্পূর্ণ প্লট পাসপোর্ট দেখুন' : 'Open full Plot Passport'}</span>
                  </button>
                )}
                {onProceedToCompare && (
                  <button
                    type="button"
                    onClick={() => {
                      const ex = {};
                      if (result.deed_info) {
                        result.deed_info.forEach(d => { ex[d.key] = d.value; });
                      }
                      onProceedToCompare(ex);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      minHeight: '44px'
                    }}
                  >
                    <GitCompare size={15} style={{ color: '#D97706' }} />
                    <span>{isBn ? 'ফিল্ড তুলনা (উন্নত সংস্করণ)' : 'Compare field by field (advanced)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
