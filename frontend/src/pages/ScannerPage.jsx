import React, { useState, useEffect } from 'react';
import { 
  ScanText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  User, 
  Hash, 
  MapPin, 
  Maximize2, 
  Calendar, 
  FileText,
  FileCheck,
  FileUp,
  Info,
  ShieldCheck,
  ShieldAlert,
  FileBadge,
  GitCompare,
  PlusCircle,
  HelpCircle,
  Database
} from 'lucide-react';
import { scanDocument, compareRecordsApi, fetchRecords, fetchDevDeeds } from '../api';
import ProposedPurchaseModal from '../components/ProposedPurchaseModal';

const DEMO_SPECIMENS = [
  {
    id: 'sample-clean',
    title: 'নমুনা ১: পরিচ্ছন্ন ধারাবাহিক দলিল (দাগ ১২৩৪)',
    subtitle: 'Sample PDF Deed (Shantipur Plot #1234) — Clean Chain of Title',
    data: {
      seller_name: 'আব্দুল করিম',
      buyer_name: 'মোঃ সাকিব হাসান',
      owner_name: 'মোঃ সাকিব হাসান',
      mouza: 'শান্তিপুর',
      jl_no: '12',
      khatian_no: '৪৫৬',
      dag_no: '১২৩৪',
      area_decimal: '১০.০০',
      deed_no: '2026-0017',
      document_date: '2026-10-15'
    }
  },
  {
    id: 'sample-duplicate',
    title: 'নমুনা ২: দ্বৈত বিক্রয় বিরোধ দলিল (দাগ ৫৫০)',
    subtitle: 'Gulshan Plot #550 — Duplicate Sale Conflict Scenario',
    data: {
      seller_name: 'মোঃ মোর্শেদ আলম',
      buyer_name: 'তারেক রহমান',
      owner_name: 'তারেক রহমান',
      mouza: 'গুলশান',
      jl_no: '15',
      khatian_no: '220',
      dag_no: '550',
      area_decimal: '10.0',
      deed_no: '4520/2023',
      document_date: '2023-08-15'
    }
  },
  {
    id: 'sample-overlap',
    title: 'নমুনা ৩: ক্ষেত্রফল ওভারল্যাপ দলিল (দাগ ৭৮৪)',
    subtitle: 'Savar Plot #784 — Area Overlap Conflict Scenario',
    data: {
      seller_name: 'সুলতানা জাহান',
      buyer_name: 'নাসরিন আক্তার',
      owner_name: 'নাসরিন আক্তার',
      mouza: 'সাভার',
      jl_no: '45',
      khatian_no: '129',
      dag_no: '784',
      area_decimal: '7.0',
      deed_no: '5812/2022',
      document_date: '2022-11-20'
    }
  },
  {
    id: 'sample-unrecorded',
    title: 'নমুনা ৪: পূর্ববর্তী রেকর্ডহীন পার্সেল (দাগ ৯৯৯৯৯)',
    subtitle: 'Unrecorded Parcel — Previous Land Record Not Found',
    data: {
      seller_name: 'অচেনা বিক্রেতা',
      buyer_name: 'নতুন খরিদ্দার',
      owner_name: 'নতুন খরিদ্দার',
      mouza: 'কালীপুর',
      jl_no: '99',
      khatian_no: '8888',
      dag_no: '99999',
      area_decimal: '12.0',
      deed_no: '2026-UNKNOWN',
      document_date: '2026-01-10'
    }
  }
];

export default function ScannerPage({
  t,
  lang = 'bn',
  onProceedToCompare,
  setSharedExtractedData,
  onViewPassport
}) {
  const isBn = lang === 'bn';

  // Step state: 1 (Upload/Choose), 2 (Review & Edit), 3 (Comparing), 4 (Report)
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Editable Review Form with 9 required fields
  const [formData, setFormData] = useState({
    seller_name: 'আব্দুল করিম',
    buyer_name: 'মোঃ সাকিব হাসান',
    owner_name: 'মোঃ সাকিব হাসান',
    mouza: 'শান্তিপুর',
    jl_no: '12',
    khatian_no: '৪৫৬',
    dag_no: '১২৩৪',
    area_decimal: '১০.০০',
    deed_no: '2026-0017',
    document_date: '2026-10-15',
    parcel_id: ''
  });

  const [fieldStatus, setFieldStatus] = useState({});
  const [verificationReport, setVerificationReport] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [availableRecords, setAvailableRecords] = useState([]);
  const [devDeeds, setDevDeeds] = useState([]);
  const [selectedRefRecordId, setSelectedRefRecordId] = useState('');

  const cleanVal = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    if (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return '';
    return s;
  };

  // Helper: Auto-resolves the best matching reference record from loaded records based on Dag / Khatian / Deed
  // Strict matching only — avoids incorrect loose fallback to rec-demo-003
  const resolveReferenceRecord = (data, recordsList) => {
    if (!recordsList || !recordsList.length || !data) return '';
    const norm = (val) => {
      if (val === null || val === undefined) return '';
      return String(val).trim().replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
    };

    const dag = norm(data.dag_no);
    const khatian = norm(data.khatian_no);
    const deed = norm(data.deed_no);

    // 1. Exact Dag and Khatian match
    if (dag && khatian) {
      const match = recordsList.find(r => norm(r.dag_no) === dag && norm(r.khatian_no) === khatian);
      if (match) return match.id;
    }
    // 2. Deed number match
    if (deed) {
      const match = recordsList.find(r => norm(r.deed_no) === deed);
      if (match) return match.id;
    }
    // 3. Dag number match
    if (dag) {
      const match = recordsList.find(r => norm(r.dag_no) === dag);
      if (match) return match.id;
    }
    return '';
  };

  // Load available demo reference records and development test deeds on mount
  useEffect(() => {
    let active = true;
    Promise.all([
      fetchRecords().catch(() => ({ records: [] })),
      fetchDevDeeds().catch(() => ({ deeds: [] }))
    ]).then(([recordsRes, devRes]) => {
      if (!active) return;
      if (recordsRes && recordsRes.records) {
        setAvailableRecords(recordsRes.records);
        setSelectedRefRecordId(prev => {
          if (prev) return prev;
          return resolveReferenceRecord(formData, recordsRes.records);
        });
      }
      if (devRes && devRes.deeds) {
        setDevDeeds(devRes.deeds);
      }
    }).catch(err => {
      console.warn('Could not load reference or dev records:', err);
    });
    return () => { active = false; };
  }, []);

  // Handle manual selection from reference baseline dropdown
  const handleReferenceRecordChange = (newSelectedId) => {
    setSelectedRefRecordId(newSelectedId);

    if (!newSelectedId) {
      return;
    }

    // 1. Check if user selected one of the official baseline records
    const baseline = availableRecords.find(r => r.id === newSelectedId);
    if (baseline) {
      // If user hasn't uploaded their own custom document, update comparison inputs to match this baseline
      if (!uploadedFileName) {
        const jlMatch = baseline.mouza ? String(baseline.mouza).match(/JL-?(\d+)/i) : null;
        setFormData({
          seller_name: baseline.owner_name_bn,
          buyer_name: isBn ? 'তন্ময় আহমেদ' : 'Tanmoy Ahmed',
          owner_name: isBn ? 'তন্ময় আহমেদ' : 'Tanmoy Ahmed',
          mouza: baseline.mouza ? baseline.mouza.split(',')[0].trim() : '',
          jl_no: baseline.jl_no || (jlMatch ? jlMatch[1] : ''),
          khatian_no: String(baseline.khatian_no || ''),
          dag_no: String(baseline.dag_no || ''),
          area_decimal: String(baseline.area_decimal || ''),
          deed_no: baseline.deed_no || '',
          document_date: baseline.document_date || '',
          parcel_id: ''
        });
      }
      return;
    }

    // 2. Check if user selected one of the 20 development deed scenarios
    const devDeed = devDeeds.find(d => d.id === newSelectedId);
    if (devDeed) {
      setFormData({
        seller_name: devDeed.seller_name_bn || devDeed.seller_name_en || '',
        buyer_name: devDeed.buyer_name_bn || devDeed.buyer_name_en || '',
        owner_name: devDeed.buyer_name_bn || devDeed.owner_name_bn || devDeed.buyer_name_en || '',
        mouza: devDeed.mouza || '',
        jl_no: String(devDeed.jl_no || ''),
        khatian_no: String(devDeed.khatian_no || ''),
        dag_no: String(devDeed.dag_no || ''),
        area_decimal: String(devDeed.area_decimal || ''),
        deed_no: devDeed.deed_no || '',
        document_date: devDeed.document_date || '',
        parcel_id: ''
      });
      setUploadedFileName(isBn ? devDeed.scenario_name_bn : devDeed.scenario_name);
    }
  };

  // Step 1: Trigger OCR scan on upload or sample load
  const handleFileUpload = async (fileObj) => {
    if (!fileObj) return;
    setIsScanning(true);
    setStatusMessage(null);
    setUploadedFileName(fileObj.name);

    try {
      const data = new FormData();
      data.append('file', fileObj);

      const res = await scanDocument(data);
      if (res && res.extracted_fields) {
        const ef = res.extracted_fields;
        const newForm = {
          seller_name: cleanVal(ef.seller_name || formData.seller_name),
          buyer_name: cleanVal(ef.buyer_name || ef.owner_name || formData.buyer_name),
          owner_name: cleanVal(ef.owner_name || ef.buyer_name || formData.owner_name),
          mouza: cleanVal(ef.mouza || formData.mouza),
          jl_no: cleanVal(ef.jl_no || formData.jl_no),
          khatian_no: cleanVal(ef.khatian_no || formData.khatian_no),
          dag_no: cleanVal(ef.dag_no || formData.dag_no),
          area_decimal: cleanVal(ef.area_decimal || formData.area_decimal),
          deed_no: cleanVal(ef.deed_no || formData.deed_no),
          document_date: cleanVal(ef.document_date || formData.document_date),
          parcel_id: formData.parcel_id
        };
        setFormData(newForm);
        setFieldStatus(res.ocr_field_status || {});

        // Resolve reference record ID: prefer sample_id if known demo, else match by fields
        const matchedRefId = res.sample_id || resolveReferenceRecord(newForm, availableRecords);
        setSelectedRefRecordId(matchedRefId || '');

        setCurrentStep(2);
        setStatusMessage({
          type: 'success',
          text: isBn ? `সফলভাবে তথ্য শনাক্ত হয়েছে: ${fileObj.name}` : `Successfully extracted fields from ${fileObj.name}`
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || (isBn ? 'দলিল প্রসেস করতে ব্যর্থ হয়েছে।' : 'Failed to parse document.')
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSpecimen = (specimen) => {
    setUploadedFileName(specimen.title);
    setFormData(specimen.data);
    setFieldStatus({
      seller_name: 'Candidate extracted',
      buyer_name: 'Candidate extracted',
      mouza: 'Candidate extracted',
      jl_no: 'Candidate extracted',
      khatian_no: 'Candidate extracted',
      dag_no: 'Candidate extracted',
      area_decimal: 'Candidate extracted',
      deed_no: 'Candidate extracted',
      document_date: 'Candidate extracted'
    });
    // Auto-resolve reference record for specimen
    const matchedRefId = resolveReferenceRecord(specimen.data, availableRecords);
    setSelectedRefRecordId(matchedRefId || '');

    setCurrentStep(2);
    setStatusMessage({
      type: 'success',
      text: isBn ? `নমুনা দলিল লোড হয়েছে: ${specimen.title}` : `Loaded specimen: ${specimen.title}`
    });
  };

  // Step 3 & 4: Run Verification & Conflict Detection
  const handleRunVerification = async () => {
    setIsVerifying(true);
    setStatusMessage(null);
    try {
      const devDeed = devDeeds.find(d => d.id === selectedRefRecordId);
      const targetRefId = devDeed?.reference_record_id || selectedRefRecordId || null;

      const comparePayload = {
        reference_record_id: targetRefId,
        extracted_data: {
          owner_name: formData.buyer_name || formData.owner_name,
          seller_name: formData.seller_name,
          buyer_name: formData.buyer_name,
          mouza: formData.mouza,
          jl_no: formData.jl_no,
          khatian_no: formData.khatian_no,
          dag_no: formData.dag_no,
          area_decimal: formData.area_decimal,
          deed_no: formData.deed_no,
          document_date: formData.document_date,
          parcel_id: formData.parcel_id,
          is_partial_transfer: Boolean(devDeed?.is_partial_transfer || devDeed?.expected_status === 'PARTIAL_TRANSFER_VALID')
        },
        area_tolerance_decimal: 0.05,
        language: lang
      };

      const res = await compareRecordsApi(comparePayload);
      setVerificationReport(res);
      setCurrentStep(4);
      if (setSharedExtractedData) {
        setSharedExtractedData(formData);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || (isBn ? 'যাচাইকরণে ব্যর্থ হয়েছে।' : 'Verification analysis failed.')
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Determine Verification Report Status
  const getReportStatus = () => {
    if (!verificationReport) return null;
    const ca = verificationReport.conflict_analysis;
    const hasHist = verificationReport.has_history || ca?.has_history;

    if (!hasHist) {
      return {
        key: 'RECORD_NOT_FOUND',
        title: isBn ? 'পূর্ববর্তী রেকর্ড পাওয়া যায়নি' : 'Previous Land Record Not Found',
        badge: 'Previous Land Record Not Found',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
        icon: AlertTriangle,
        desc: isBn
          ? 'এই দাগ বা খতিয়ানের বিপরীতে সংরক্ষিত কৃত্রিম লেনদেন আর্কাইভে কোনো পূর্ববর্তী হস্তান্তরের ইতিহাস পাওয়া যায়নি।'
          : 'No historical registered transactions found for this Dag and Khatian in the repository.'
      };
    }

    if (ca?.status === 'DUPLICATE_SALE' || ca?.conflicts?.some(c => c.code === 'DUPLICATE_SALE_DETECTED')) {
      return {
        key: 'DUPLICATE_SALE',
        title: isBn ? 'সম্ভাব্য দ্বৈত বিক্রয় বিরোধ শনাক্ত' : 'Potential Conflict Found (Duplicate Sale)',
        badge: 'Potential Conflict Found',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        icon: AlertTriangle,
        desc: isBn
          ? 'বিক্রেতা পূর্বে এই দাগের জমি অন্য ক্রেতার নিকট সম্পূর্ণ বিক্রি করেছেন। বর্তমানে কোনো অতিরিক্ত স্বত্ব অবশিষ্ট নেই।'
          : 'Seller previously conveyed this parcel in an earlier registered transaction. 0.0 decimals remaining balance.'
      };
    }

    if (ca?.status === 'OVERLAPPING_SALE' || ca?.conflicts?.some(c => c.code === 'OVERLAPPING_AREA_DETECTED')) {
      return {
        key: 'OVERLAPPING_SALE',
        title: isBn ? 'জমির ক্ষেত্রফল ওভারল্যাপ বিরোধ' : 'Potential Conflict Found (Area Overlap)',
        badge: 'Potential Conflict Found',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        icon: AlertTriangle,
        desc: isBn
          ? 'বিক্রেতার পূর্ববর্তী বিক্রয়ের পর অবশিষ্ট জমির চেয়ে প্রস্তাবিত হস্তান্তরের পরিমাণ বেশি।'
          : "Transferred area exceeds seller's remaining unencumbered holding balance."
      };
    }

    if (ca?.status === 'INCOMPLETE_HISTORY' || ca?.conflicts?.some(c => c.code === 'CHAIN_GAP_DETECTED')) {
      return {
        key: 'INSUFFICIENT_INFO',
        title: isBn ? 'অসম্পূর্ণ তথ্য বা সূত্রের ঘাটতি' : 'Insufficient Information / Title Gap',
        badge: 'Insufficient Information',
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        icon: HelpCircle,
        desc: isBn
          ? 'মালিকানার ধারাবাহিকতায় ফাঁক রয়েছে। পূর্ববর্তী মূল দলিল বা খতিয়ানের লিঙ্কেজ খুঁজে পাওয়া যায়নি।'
          : 'A gap was identified in the chain of title. Prior deed or parent khatian linkage is missing.'
      };
    }

    return {
      key: 'CLEAN_CHAIN',
      title: isBn ? 'উপলব্ধ রেকর্ডে কোনো দ্বন্দ্ব পাওয়া যায়নি' : 'No Conflict Found in Available Records',
      badge: 'No Conflict Found in Available Records',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      icon: CheckCircle2,
      desc: isBn
        ? 'সংরক্ষিত লেনদেনের ইতিহাসের সাথে বিক্রেতার জমার হিসাব ও ধারাবাহিক মালিকানার সূত্র সম্পূর্ণ সঙ্গতিপূর্ণ।'
        : 'Continuous title chain verified against chronological synthetic transaction records.'
    };
  };

  const reportStatus = getReportStatus();
  const supportingRecords = verificationReport?.conflict_analysis?.supporting_records || [];
  const conflictsList = verificationReport?.conflict_analysis?.conflicts || [];

  return (
    <div className="scanner-page-root" style={{
      maxWidth: 'var(--max-content-width)',
      margin: '0 auto',
      padding: '32px var(--gutter-desktop)',
      boxSizing: 'border-box'
    }}>
      {/* Page Title */}
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
          <ScanText size={14} />
          <span>{isBn ? 'ভূমি ক্রয় যাচাইকরণ কার্যপ্রণালী' : 'DEED VERIFICATION WORKFLOW'}</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          fontFamily: 'var(--font-heading)',
          margin: '0 0 8px 0'
        }}>
          {isBn ? 'দলিল যাচাই ও বিরোধ শনাক্তকরণ' : 'Deed Verification & Conflict Detection'}
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
            ? 'বিক্রেতার দলিল আপলোড করুন, এআই কর্তৃক শনাক্তকৃত তথ্য পর্যালোচনা ও সংশোধন করুন এবং পূর্ববর্তী লেনদেনের সাথে মিলিয়ে বিরোধ শনাক্ত করুন।'
            : "Upload seller's deed, review and correct the 9 extracted land parameters, and run automated conflict detection against historical transaction records."}
        </p>
      </div>

      {/* 4-Step Visual Progress Bar */}
      <div style={{
        background: 'var(--bg-paper)',
        borderRadius: 'var(--radius-std)',
        border: '1.5px solid var(--line)',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {[
          { num: 1, label: isBn ? '১. দলিল আপলোড' : '1. Upload Deed' },
          { num: 2, label: isBn ? '২. তথ্য সম্পাদনা' : '2. Review & Edit' },
          { num: 3, label: isBn ? '৩. হিস্ট্রি তুলনা' : '3. History Search' },
          { num: 4, label: isBn ? '৪. যাচাই রিপোর্ট' : '4. Verification Report' }
        ].map(st => {
          const isActive = currentStep === st.num;
          const isDone = currentStep > st.num;
          return (
            <div
              key={st.num}
              onClick={() => {
                if (st.num <= 2 || (st.num === 4 && verificationReport)) {
                  setCurrentStep(st.num);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: st.num <= 2 || (st.num === 4 && verificationReport) ? 'pointer' : 'default',
                opacity: currentStep >= st.num ? 1 : 0.5
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isDone ? '#16A34A' : (isActive ? 'var(--primary-accent)' : 'var(--line)'),
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isDone ? <CheckCircle2 size={16} /> : st.num}
              </div>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)'
              }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-std)',
          background: statusMessage.type === 'error' ? '#FEE2E2' : '#DCFCE7',
          color: statusMessage.type === 'error' ? '#991B1B' : '#166534',
          border: statusMessage.type === 'error' ? '1px solid #F87171' : '1px solid #86EFAC',
          marginBottom: '20px',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {statusMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: UPLOAD DEED OR SELECT DEMO SPECIMEN */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* File Upload Box */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-std)',
            border: '1.5px solid var(--line)',
            padding: '24px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
              {isBn ? 'দলিল ফাইল আপলোড করুন' : "Upload Seller's Deed File"}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {isBn ? 'দলিলের পিডিএফ বা ছবি আপলোড করুন (PDF, PNG, JPG — সর্বোচ্চ ১০MB)।' : 'Upload deed scan (PDF, PNG, JPG up to 10MB) for OCR extraction.'}
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              style={{
                border: dragActive ? '2px dashed var(--primary-accent)' : '2px dashed #94A3B8',
                borderRadius: '8px',
                padding: '36px 20px',
                textAlign: 'center',
                background: dragActive ? 'var(--accent-tint)' : '#FAF8F5',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => document.getElementById('deed-file-input').click()}
            >
              <Upload size={36} style={{ color: 'var(--primary-accent)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {isBn ? 'ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করুন' : 'Drag & drop deed here, or click to browse'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PDF, JPG, PNG (Max 10 MB)
              </div>
              <input
                id="deed-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>

            {isScanning && (
              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.84rem', color: 'var(--primary-accent)', fontWeight: 700 }}>
                <RefreshCw size={16} className="spin" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {isBn ? 'এআই অপটিক্যাল স্ক্যান ও টেক্সট বিশ্লেষণ চলছে...' : 'AI OCR scanning & parsing in progress...'}
              </div>
            )}
          </div>

          {/* Synthetic Demo Specimens */}
          <div style={{
            background: 'var(--bg-paper)',
            borderRadius: 'var(--radius-std)',
            border: '1.5px solid var(--line)',
            padding: '24px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                {isBn ? 'অথবা কৃত্রিম টেস্ট নমুনা নির্বাচন করুন' : 'Or Select a Synthetic Test Specimen'}
              </h3>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px' }}>
                DEMO DATA
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {isBn ? 'তাত্ক্ষণিক পরীক্ষার জন্য তৈরি কৃত্রিম দলিল নমুনা:' : 'Pre-configured synthetic test specimens:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DEMO_SPECIMENS.map((spec) => (
                <div
                  key={spec.id}
                  onClick={() => handleSelectSpecimen(spec)}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      {spec.title}
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--primary-accent)' }} />
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {spec.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: EDITABLE REVIEW FORM (ALL 9 REQUIRED FIELDS) */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-std)',
          border: '1.5px solid var(--line)',
          padding: '28px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '0 0 4px 0' }}>
                {isBn ? 'ধাপ ২: শনাক্তকৃত তথ্যের পর্যালোচনা ও সংশোধন' : 'Step 2: Review & Edit Extracted Information'}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                {isBn
                  ? 'ওভারভিউ করার পর কোনো তথ্য ভুল থাকলে তা এখনই সংশোধন করুন। এই ৯টি তথ্যের ওপর ভিত্তি করেই লেনদেনের ইতিহাস যাচাই করা হবে।'
                  : 'Review extracted fields and correct any OCR mistakes before starting transaction history verification.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isBn ? 'অন্য দলিল আপলোড করুন' : 'Upload Different File'}
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRunVerification(); }}>
            {/* Reference Baseline Record Selector & Status Card */}
            <div style={{
              background: 'var(--paper)',
              borderRadius: 'var(--radius-std)',
              border: '1.5px solid #CAD7CF',
              padding: '18px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label htmlFor="step2-reference-record-select" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)'
                }}>
                  <Database size={16} style={{ color: 'var(--primary-accent)' }} />
                  <span>{isBn ? 'তুলনার জন্য রেফারেন্স রেকর্ড (Reference Baseline Record)' : 'Reference Baseline Land Record'}</span>
                </label>

                {selectedRefRecordId ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--status-matched-bg)',
                    border: '1px solid var(--status-matched-border)',
                    color: 'var(--status-matched-text)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    <CheckCircle2 size={13} />
                    <span>{isBn ? 'রেফারেন্স রেকর্ড সংযুক্ত' : 'Reference Record Linked'}</span>
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--status-needs-review-bg)',
                    border: '1px solid var(--status-needs-review-border)',
                    color: 'var(--status-needs-review-text)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    <AlertTriangle size={13} />
                    <span>{isBn ? 'রেফারেন্স রেকর্ড নির্বাচিত হয়নি' : 'Reference record not selected'}</span>
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                {isBn
                  ? 'দলিলের দাগ বা খতিয়ানের সাথে ডাটাবেজের পূর্ববর্তী রেকর্ড মিলিয়ে রেফারেন্স স্বয়ংক্রিয়ভাবে শনাক্ত হয়। আপনি চাইলে নিচের তালিকা থেকে অন্য রেফারেন্স রেকর্ডও নির্বাচন করতে পারেন।'
                  : 'The baseline reference record is automatically resolved by Dag & Khatian against the demo database. You can also manually choose any baseline record from the dropdown.'}
              </p>

              <select
                id="step2-reference-record-select"
                value={selectedRefRecordId}
                onChange={(e) => handleReferenceRecordChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--text-main)',
                  fontSize: '0.9rem',
                  background: '#FFFFFF',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">
                  {isBn ? '-- কোনো রেফারেন্স রেকর্ড ছাড়া / স্বয়ংক্রিয় অনুসন্ধান --' : '-- Auto-Search Synthetic Parcel History --'}
                </option>

                <optgroup label={isBn ? 'অফিসিয়াল নিবন্ধিত রেফারেন্স রেকর্ড (Official Baseline Records)' : 'Official Registered Baseline Records'}>
                  {availableRecords.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.id}] {isBn ? r.owner_name_bn : (r.owner_name_en || r.owner_name_bn)} — দাগ: {r.dag_no}, খতিয়ান: {r.khatian_no} ({r.mouza})
                    </option>
                  ))}
                </optgroup>

                {devDeeds.length > 0 && (
                  <optgroup label={isBn ? 'ডেভেলপমেন্ট টেস্ট দলিল দৃশ্যপট (Development Test Deeds - 20 Cases)' : 'Development Test Deed Scenarios (20 Cases)'}>
                    {devDeeds.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.id}] {isBn ? d.scenario_name_bn : d.scenario_name} — দাগ: {d.dag_no}, খতিয়ান: {d.khatian_no}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Selected Record Detail summary or Auto-Search Banner */}
              {selectedRefRecordId ? (
                (() => {
                  const rec = availableRecords.find(r => r.id === selectedRefRecordId);
                  const dev = devDeeds.find(d => d.id === selectedRefRecordId);
                  const item = rec || dev;
                  return item ? (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      border: '1px solid var(--line)',
                      fontSize: '0.82rem',
                      color: 'var(--text-body)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                          {item.id} {rec ? (isBn ? '• অফিসিয়াল নিবন্ধিত রেকর্ড' : '• Official Baseline Record') : (isBn ? '• ডেভেলপমেন্ট টেস্ট দলিল' : '• Development Test Deed')}
                        </span>
                        {dev && dev.expected_status && (
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: dev.expected_status.includes('CLEAN') ? '#DCFCE7' : '#FEE2E2',
                            color: dev.expected_status.includes('CLEAN') ? '#166534' : '#991B1B'
                          }}>
                            {dev.expected_status}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <div><strong>{isBn ? 'মালিক/বিক্রেতা:' : 'Owner/Seller:'}</strong> {item.owner_name_bn || item.seller_name_bn || item.owner_name_en}</div>
                        {dev && dev.buyer_name_bn && (
                          <div><strong>{isBn ? 'ক্রেতা:' : 'Buyer:'}</strong> {dev.buyer_name_bn}</div>
                        )}
                        <div><strong>{isBn ? 'দাগ নম্বর:' : 'Dag No:'}</strong> {item.dag_no}</div>
                        <div><strong>{isBn ? 'খতিয়ান:' : 'Khatian:'}</strong> {item.khatian_no}</div>
                        <div><strong>{isBn ? 'জমির পরিমাণ:' : 'Area:'}</strong> {item.area_decimal} {isBn ? 'শতক' : 'decimals'}</div>
                        <div><strong>{isBn ? 'দলিল নম্বর:' : 'Deed No:'}</strong> {item.deed_no || 'N/A'}</div>
                        <div><strong>{isBn ? 'মৌজা:' : 'Mouza:'}</strong> {item.mouza}</div>
                        {dev && (
                          <div><strong>{isBn ? 'লক্ষ্য রেফারেন্স আইডি:' : 'Target Reference ID:'}</strong> {dev.reference_record_id || 'rec-demo-001'}</div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()
              ) : (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  fontSize: '0.82rem',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Info size={15} style={{ flexShrink: 0 }} />
                  <span>
                    {isBn
                      ? 'স্বয়ংক্রিয় অনুসন্ধান সক্রিয়: দলিলের দাগ ও খতিয়ান দিয়ে সিন্থেটিক ট্রানজ্যাকশন ডাটাবেজে মিল অনুসন্ধান করা হবে।'
                      : 'Auto-search active: The system will search synthetic transactions matching the deed Dag & Khatian.'}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
              marginBottom: '24px'
            }}>
              {/* 1. Seller Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '১. বিক্রেতার নাম (Seller Name) *' : "1. Seller Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.seller_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, seller_name: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 2. Buyer Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '২. ক্রেতার নাম (Buyer Name) *' : "2. Buyer Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.buyer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyer_name: e.target.value, owner_name: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 3. Mouza */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৩. মৌজা (Mouza) *' : "3. Mouza *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.mouza}
                  onChange={(e) => setFormData(prev => ({ ...prev, mouza: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 4. JL Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৪. জেএল নম্বর (JL Number)' : "4. JL Number"}
                </label>
                <input
                  type="text"
                  value={formData.jl_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, jl_no: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 5. Khatian Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৫. খতিয়ান নম্বর (Khatian No) *' : "5. Khatian Number *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.khatian_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, khatian_no: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 6. Dag / Plot Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৬. দাগ নম্বর (Dag/Plot No) *' : "6. Dag / Plot Number *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.dag_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, dag_no: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 7. Land Area */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৭. জমির পরিমাণ শতকে (Land Area in Decimals) *' : "7. Land Area (Decimals) *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.area_decimal}
                  onChange={(e) => setFormData(prev => ({ ...prev, area_decimal: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 8. Deed Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৮. দলিল নম্বর (Deed Number) *' : "8. Deed Number *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.deed_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, deed_no: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              {/* 9. Deed Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {isBn ? '৯. দলিলের তারিখ (Deed Date) *' : "9. Deed Date *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.document_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_date: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1.5px solid var(--text-main)', fontSize: '0.9rem', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="submit"
                disabled={isVerifying}
                className="btn-primary"
                style={{
                  height: '46px',
                  padding: '0 28px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '6px'
                }}
              >
                <GitCompare size={16} />
                <span>{isVerifying ? (isBn ? 'লেনদেন ইতিহাস অনুসন্ধান হচ্ছে...' : 'Searching History...') : (isBn ? 'লেনদেনের ইতিহাসের সাথে যাচাই করুন' : 'Compare With Transaction History')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: VERIFICATION REPORT */}
      {/* ======================================================== */}
      {currentStep === 4 && reportStatus && (
        <div>
          {/* Main Status Header Card */}
          <div style={{
            background: reportStatus.bg,
            border: `2px solid ${reportStatus.border}`,
            borderRadius: 'var(--radius-md, 12px)',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-hard-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FFFFFF',
                color: reportStatus.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1.5px solid ${reportStatus.border}`
              }}>
                <reportStatus.icon size={26} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#FFFFFF',
                    color: reportStatus.color,
                    border: `1px solid ${reportStatus.border}`
                  }}>
                    {reportStatus.badge}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    দাগ: {formData.dag_no} &bull; খতিয়ান: {formData.khatian_no} &bull; দলিল: {formData.deed_no}
                  </span>
                </div>

                <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: reportStatus.color,
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 6px 0'
                }}>
                  {reportStatus.title}
                </h2>

                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.55,
                  margin: 0
                }}>
                  {reportStatus.desc}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', borderTop: `1px solid ${reportStatus.border}`, paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => onViewPassport && onViewPassport(verificationReport?.parcel_id || 'PCL-DHK-GUL-015-0550')}
                className="btn-primary"
                style={{
                  height: '40px',
                  padding: '0 18px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileBadge size={15} />
                <span>{isBn ? 'প্লট পাসপোর্ট ও কিউআর সনদ দেখুন' : 'View Plot Passport & QR'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(true)}
                className="btn-secondary"
                style={{
                  height: '40px',
                  padding: '0 16px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FFFFFF'
                }}
              >
                <PlusCircle size={15} />
                <span>{isBn ? 'প্রস্তাবিত জমি ক্রয় রেকর্ড করুন' : 'Record Proposed Purchase'}</span>
              </button>

              {onProceedToCompare && (
                <button
                  type="button"
                  onClick={() => {
                    if (setSharedExtractedData) {
                      setSharedExtractedData(formData);
                    }
                    onProceedToCompare(formData);
                  }}
                  className="btn-secondary"
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#FFFFFF'
                  }}
                >
                  <GitCompare size={15} />
                  <span>{isBn ? 'অন্যান্য রেকর্ডের সাথে তুলনা' : 'Cross-Compare Records'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  height: '40px',
                  padding: '0 14px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isBn ? 'তথ্য পরিবর্তন করে পুনরায় যাচাই' : 'Edit Info & Re-verify'}
              </button>
            </div>
          </div>

          {/* Active Conflicts Breakdown (if any found) */}
          {conflictsList.length > 0 && (
            <div style={{
              background: 'var(--bg-paper)',
              borderRadius: 'var(--radius-std)',
              border: '2px solid #FCA5A5',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#991B1B', fontFamily: 'var(--font-heading)', margin: '0 0 12px 0' }}>
                {isBn ? 'শনাক্তকৃত বিরোধের বিবরণ:' : 'Detected Conflict Findings:'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conflictsList.map((c, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', padding: '14px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: '3px' }}>
                        {c.code}
                      </span>
                      <strong style={{ fontSize: '0.94rem', color: '#991B1B' }}>
                        {isBn ? c.title_bn : c.title_en}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                      {isBn ? c.description_bn : c.description_en}
                    </div>
                    {c.conflicting_deed_no && (
                      <div style={{ marginTop: '6px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        <strong>দ্বন্দ্ব সৃষ্টিকারী পূর্ববর্তী দলিল:</strong> {c.conflicting_deed_no} {c.conflicting_date ? `(${c.conflicting_date})` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Previous Historical Deeds Table */}
          {supportingRecords.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-std)',
              border: '1.5px solid var(--line)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '0 0 12px 0' }}>
                {isBn ? 'এই দাগে সংরক্ষিত পূর্ববর্তী নিবন্ধিত দলিলসমূহ:' : 'Matching Historical Registered Deeds on this Plot:'}
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--dark-band)', color: '#EAF0E8' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>দলিল নম্বর</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>তারিখ</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>বিক্রেতা</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>ক্রেতা</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>পরিমাণ</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>অবশিষ্ট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportingRecords.map((stx, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)', background: idx % 2 === 0 ? 'var(--bg-paper)' : 'var(--bg-card)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{stx.deed_no}</td>
                        <td style={{ padding: '10px 12px' }}>{stx.transaction_date}</td>
                        <td style={{ padding: '10px 12px' }}>{stx.seller_name_bn}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--primary-accent)', fontWeight: 700 }}>{stx.buyer_name_bn}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800 }}>{stx.transferred_area} শতক</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: stx.seller_remaining_area < 0 ? '#DC2626' : '#16A34A' }}>
                          {stx.seller_remaining_area} শতক
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Non-Automatic Approval Warning */}
          <div style={{
            background: '#FAF7F0',
            border: '1px solid #CAD7CF',
            borderRadius: '6px',
            padding: '14px 16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55
          }}>
            <strong>সিস্টেম সীমানা ও আইনি দায়মুক্তি:</strong> ভূমি কবচ প্ল্যাটফর্ম কোনো ক্রয়কে স্বয়ংক্রিয়ভাবে 'আইনি অনুমোদন' বা 'মালিকানার নিশ্চয়তা' দেয় না। এই প্রতিবেদনটি সংরক্ষিত কৃত্রিম দলিলের গাণিতিক তুলনা মাত্র। যে কোনো জমি ক্রয়ের চূড়ান্ত সিদ্ধান্ত নেওয়ার পূর্বে সংশ্লিষ্ট সরকারি সাব-রেজিস্ট্রি অফিস, এসি ল্যান্ড ও তহসিল অফিসে মূল বালাম বহি ও খতিয়ান সরেজমিনে যাচাই করা বাধ্যতামূলক।
          </div>
        </div>
      )}

      {/* Proposed Purchase Recording Modal */}
      <ProposedPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        parcelData={{
          parcel_id: verificationReport?.parcel_id || 'PCL-DHK-GUL-015-0550',
          dag_no: formData.dag_no,
          khatian_no: formData.khatian_no,
          mouza: formData.mouza,
          jl_no: formData.jl_no,
          seller_name: formData.seller_name,
          buyer_name_bn: formData.buyer_name,
          area_decimal: formData.area_decimal
        }}
        lang={lang}
        onPurchaseRecorded={() => {
          setIsPurchaseModalOpen(false);
          if (onViewPassport) {
            onViewPassport(verificationReport?.parcel_id || 'PCL-DHK-GUL-015-0550');
          }
        }}
      />
    </div>
  );
}
