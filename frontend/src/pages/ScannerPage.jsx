import React, { useState } from 'react';
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
  FileCode2,
  Sparkles,
  FileCheck,
  FileUp,
  Info,
  ShieldCheck
} from 'lucide-react';
import { scanDocument } from '../api';

export default function ScannerPage({ t, lang = 'bn', onProceedToCompare, setSharedExtractedData }) {
  const isBn = lang === 'bn';
  const [selectedSample, setSelectedSample] = useState('001');
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Extracted fields
  const [formData, setFormData] = useState({
    owner_name: 'মোঃ রফিকুল ইসলাম',
    khatian_no: '412',
    dag_no: '1058',
    area_decimal: '15.5',
    document_date: '2021-04-12',
    deed_no: '1482/2021',
  });

  // Confidence data
  const [confidence, setConfidence] = useState({
    owner_name: 0.94,
    khatian_no: 0.96,
    dag_no: 0.95,
    area_decimal: 0.92,
    document_date: 0.91,
    deed_no: 0.97,
  });

  const [fieldStatus, setFieldStatus] = useState({
    owner_name: 'Candidate extracted',
    khatian_no: 'Candidate extracted',
    dag_no: 'Candidate extracted',
    area_decimal: 'Candidate extracted',
    document_date: 'Candidate extracted',
    deed_no: 'Candidate extracted',
  });

  const triggerScan = async (sampleVal, fileObj = null) => {
    setIsScanning(true);
    setStatusMessage(null);
    try {
      const data = new FormData();
      if (fileObj) {
        data.append('file', fileObj);
      } else if (sampleVal === 'custom') {
        data.append('file', new Blob(['unintelligible noisy sample bytes'], { type: 'text/plain' }), 'broken_specimen.bin');
      } else {
        data.append('sample_id', sampleVal);
      }

      const res = await scanDocument(data);
      if (res && res.extracted_fields) {
        setFormData({
          owner_name: res.extracted_fields.owner_name || '',
          khatian_no: res.extracted_fields.khatian_no || '',
          dag_no: res.extracted_fields.dag_no || '',
          area_decimal: res.extracted_fields.area_decimal !== undefined ? String(res.extracted_fields.area_decimal) : '',
          document_date: res.extracted_fields.document_date || '',
          deed_no: res.extracted_fields.deed_no || '',
        });
        setConfidence(res.confidence_scores || {});
        setFieldStatus(res.ocr_field_status || {});
        setStatusMessage({
          type: 'success',
          text: fileObj 
            ? (isBn ? `সফলভাবে তথ্য শনাক্ত হয়েছে: ${fileObj.name}` : `Successfully extracted fields from ${fileObj.name}`)
            : (isBn 
                ? `নমুনা দলিল লোড হয়েছে: ${sampleVal === '001' ? 'দাগ ১০৫৮ (মিরপুর)' : sampleVal === '002' ? 'দাগ ২৪৯০ (বাড্ডা)' : 'কম কনফিডেন্স পরীক্ষা'}`
                : `Loaded demo specimen: ${sampleVal === '001' ? 'Plot #1058 (Mirpur)' : sampleVal === '002' ? 'Plot #2490 (Badda)' : 'Low-confidence test'}`)
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.isOffline
          ? (isBn ? 'ব্যাকএন্ড অফলাইন: অনুগ্রহ করে ব্যাকএন্ড সার্ভার চালু আছে কি না পরীক্ষা করুন।' : 'Backend offline: Please ensure the backend server is running on http://127.0.0.1:8000.')
          : (err.message || (isBn ? 'দলিলের তথ্য প্রক্রিয়াকরণে সমস্যা হয়েছে।' : 'Error extracting fields from document.')),
        canRetry: true,
        retryParams: { sampleVal, fileObj }
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadDemo = () => {
    setUploadedFile(null);
    triggerScan(selectedSample);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      triggerScan(null, file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      triggerScan(null, file);
    }
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setConfidence(prev => ({ ...prev, [field]: 1.0 }));
    setFieldStatus(prev => ({ ...prev, [field]: 'User verified' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSharedExtractedData(formData);
    onProceedToCompare(formData);
  };

  // Helper to render field review status tags
  const renderFieldBadge = (fieldKey, val) => {
    const conf = confidence[fieldKey];
    const isMissing = !val || String(val).trim() === '';

    if (isMissing) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          background: 'var(--status-mismatch-bg)',
          color: 'var(--status-mismatch-text)',
          border: '1px solid var(--status-mismatch-border)',
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          <AlertTriangle size={12} />
          <span>{isBn ? 'তথ্য পাওয়া যায়নি' : 'Missing'}</span>
        </span>
      );
    }

    if (conf !== undefined && conf < 0.75) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          background: 'var(--status-review-bg)',
          color: 'var(--status-review-text)',
          border: '1px solid var(--status-review-border)',
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          <AlertTriangle size={12} />
          <span>{isBn ? 'যাচাই দরকার' : 'Needs review'}</span>
        </span>
      );
    }

    if (conf !== undefined) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          background: 'var(--status-matched-bg)',
          color: 'var(--status-matched-text)',
          border: '1px solid var(--status-matched-border)',
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          <CheckCircle2 size={12} />
          <span>{Math.round(conf * 100)}% {isBn ? 'কনফিডেন্স' : 'Conf'}</span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="app-viewport" style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', padding: '32px var(--gutter-desktop)' }}>
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            padding: '8px',
            borderRadius: 'var(--radius-std)',
            display: 'flex'
          }}>
            <ScanText size={24} />
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
              {isBn ? 'দলিল স্ক্যানার ও তথ্য পর্যালোচনা' : 'Deed Scanner & Information Review'}
            </h1>
            <p style={{
              fontSize: '0.98rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              margin: '4px 0 0'
            }}>
              {isBn 
                ? 'দলিল আপলোড করুন বা সংরক্ষিত ডেমো নমুনা নির্বাচন করে তথ্য পর্যালোচনা ও সংশোধন করুন।' 
                : 'Upload your deed document or pick a synthetic specimen to extract, review, and edit field values.'}
            </p>
          </div>
        </div>
      </div>

      {/* Dual Upload Options Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Option A: Try Demo Document */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-std)',
                background: 'var(--accent-tint)',
                color: 'var(--primary-accent)',
                fontSize: '0.76rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                <FileCheck size={13} />
                <span>{isBn ? 'বিকল্প ১: ডেমো নমুনা' : 'OPTION 1: DEMO SPECIMEN'}</span>
              </span>
            </div>

            <h3 style={{
              fontSize: '1.14rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '6px'
            }}>
              {isBn ? 'ডেমো নমুনা দলিল ব্যবহার করুন' : 'Try Demo Specimen'}
            </h3>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              {isBn 
                ? 'সিস্টেমের কার্যকারিতা যাচাই করতে প্রস্তুতকৃত কৃত্রিম নমুনা নির্বাচন করুন।'
                : 'Select pre-loaded synthetic specimen records to inspect the extraction and audit workflow.'}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="sample-document-select" style={{
                display: 'block',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                marginBottom: '6px',
                fontWeight: 600
              }}>
                {isBn ? 'নমুনা দলিল নির্বাচন:' : 'Select Specimen:'}
              </label>
              <select
                id="sample-document-select"
                value={selectedSample}
                onChange={(e) => setSelectedSample(e.target.value)}
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
                <option value="001">নমুনা ০১: মোঃ রফিকুল ইসলাম — দাগ ১০৫৮, খতিয়ান ৪১২ (১৫.৫ শতক)</option>
                <option value="002">নমুনা ০২: সুলতানা জাহান — দাগ ২৪৯০, খতিয়ান ৮৩৫ (৮.২৫ শতক)</option>
                <option value="custom">নমুনা ০৩: ঝাপসা বা কম স্পষ্ট দলিল (লো-কনফিডেন্স টেস্ট)</option>
              </select>
            </div>
          </div>

          <button
            id="load-demo-btn"
            type="button"
            onClick={handleLoadDemo}
            disabled={isScanning}
            className="btn-secondary"
            style={{
              width: '100%',
              height: '46px',
              fontSize: '0.94rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: '1.5px solid var(--text-main)',
              background: '#FFFFFF',
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            <RefreshCw size={16} className={isScanning ? 'spin' : ''} />
            <span>{isBn ? 'নমুনা দলিল লোড করুন' : 'Load Demo Document'}</span>
          </button>
        </div>

        {/* Option B: Upload Your Document */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-std)',
                background: '#F1F5F0',
                color: 'var(--text-main)',
                fontSize: '0.76rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                <Upload size={13} />
                <span>{isBn ? 'বিকল্প ২: নিজের দলিল' : 'OPTION 2: UPLOAD'}</span>
              </span>
            </div>

            <h3 style={{
              fontSize: '1.14rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '6px'
            }}>
              {isBn ? 'দলিল ফাইল আপলোড করুন' : 'Upload Land Document'}
            </h3>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              {isBn 
                ? 'কম্পিউটার বা ফোন থেকে পরচা, সাফ-কবলা দলিল বা সার্ভে নকশার ফাইল আপলোড করুন।'
                : 'Upload digital deed, porcha, or survey image/PDF to extract fields with optical confidence scores.'}
            </p>

            {/* Drag & Drop Dropzone */}
            <div
              className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('deed-file-input').click()}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && document.getElementById('deed-file-input').click()}
              style={{
                border: dragActive ? '2px dashed var(--primary-accent)' : '1.5px dashed #9AAFAA',
                borderRadius: 'var(--radius-std)',
                padding: '20px 16px',
                textAlign: 'center',
                background: dragActive ? 'var(--accent-tint)' : '#F8FAF8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                id="deed-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <FileUp size={28} style={{ color: 'var(--primary-accent)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                {uploadedFile ? (
                  <strong style={{ color: 'var(--primary-accent)' }}>{uploadedFile.name}</strong>
                ) : (
                  <span>
                    {isBn ? 'ফাইলটি এখানে টেনে আনুন, অথবা ' : 'Drag and drop file here, or '}
                    <span style={{ color: 'var(--primary-accent)', textDecoration: 'underline' }}>
                      {isBn ? 'ফাইল খুঁজুন' : 'browse'}
                    </span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {isBn ? 'PNG, JPG, PDF বা TXT সমর্থিত (সর্বোচ্চ ১০ মেগাবাইট)' : 'PNG, JPG, PDF, or TXT (Max 10MB)'}
              </div>
            </div>

            {uploadedFile && (
              <div style={{
                marginTop: '10px',
                padding: '6px 12px',
                background: 'var(--accent-tint)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: 'var(--primary-accent)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{uploadedFile.name}</span>
                <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Feedback Notice */}
      {isScanning && (
        <div style={{
          background: 'var(--white)',
          border: '1px solid #CAD7CF',
          borderRadius: 'var(--radius-std)',
          padding: '20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-hard-sm)',
          marginBottom: '24px'
        }}>
          <RefreshCw size={24} className="spin" style={{ color: 'var(--primary-accent)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: 0 }}>
            {isBn ? 'দলিলের তথ্য বিশ্লেষণ ও কনফিডেন্স মূল্যায়ন চলছে...' : 'Extracting candidate entities & computing optical confidence...'}
          </p>
        </div>
      )}

      {statusMessage && !isScanning && (
        <div style={{
          marginBottom: '24px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-std)',
          fontSize: '0.88rem',
          fontWeight: 600,
          background: statusMessage.type === 'success' ? 'var(--status-matched-bg)' : 'var(--status-mismatch-bg)',
          color: statusMessage.type === 'success' ? 'var(--status-matched-text)' : 'var(--status-mismatch-text)',
          border: `1.5px solid ${statusMessage.type === 'success' ? 'var(--status-matched-border)' : 'var(--status-mismatch-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{statusMessage.text}</span>
          </div>

          {statusMessage.type === 'error' && statusMessage.canRetry && (
            <button
              type="button"
              onClick={() => triggerScan(statusMessage.retryParams?.sampleVal, statusMessage.retryParams?.fileObj)}
              style={{
                height: '32px',
                padding: '0 12px',
                fontSize: '0.8rem',
                border: '1px solid #9A2C14',
                color: '#9A2C14',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-std)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} />
              <span>{isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry'}</span>
            </button>
          )}
        </div>
      )}

      {/* Field Review Card (Hard Shadow) */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1.5px solid var(--text-main)',
        boxShadow: 'var(--shadow-hard)',
        overflow: 'hidden'
      }}>
        {/* Card Header */}
        <div style={{
          padding: '18px 24px',
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
              fontSize: '1.24rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={18} color="var(--primary-accent)" />
              <span>{isBn ? 'শনাক্তকৃত তথ্যের নির্ভুলতা পর্যালোচনা ও সম্পাদনা' : 'Extracted Field Review & Verification'}</span>
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', fontFamily: 'var(--font-body)', margin: 0 }}>
              {isBn 
                ? 'দলিল থেকে পঠিত তথ্যগুলো মিলিয়ে দেখুন। কোনো তথ্যে ভুল বা অমিল থাকলে নিজেই এডিট করুন।'
                : 'Review detected entity fields. Inaccurate or low-confidence values can be manually corrected.'}
            </p>
          </div>

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
            {isBn ? 'মানবসংশোধন প্রস্তুত' : 'EDITABLE FIELDS'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '28px'
          }}>
            {/* 1. Owner Name */}
            <div className="form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="field-owner-name" style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'মালিকের নাম (Owner Name)' : 'Owner Name'}
                </label>
                {renderFieldBadge('owner_name', formData.owner_name)}
              </div>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
                <input
                  id="field-owner-name"
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder={isBn ? 'যেমন: মোঃ রফিকুল ইসলাম' : 'e.g. Md. Rafiqul Islam'}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px 0 38px',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid #CAD7CF',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-body)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 2. Khatian Number */}
            <div className="form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="field-khatian-no" style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'খতিয়ান নম্বর (Khatian No)' : 'Khatian Number'}
                </label>
                {renderFieldBadge('khatian_no', formData.khatian_no)}
              </div>
              <div style={{ position: 'relative' }}>
                <Hash size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
                <input
                  id="field-khatian-no"
                  type="text"
                  value={formData.khatian_no}
                  onChange={(e) => handleInputChange('khatian_no', e.target.value)}
                  placeholder={isBn ? 'যেমন: ৪১২' : 'e.g. 412'}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px 0 38px',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid #CAD7CF',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 3. Dag Number */}
            <div className="form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="field-dag-no" style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'দাগ নম্বর (Dag No)' : 'Dag Number'}
                </label>
                {renderFieldBadge('dag_no', formData.dag_no)}
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
                <input
                  id="field-dag-no"
                  type="text"
                  value={formData.dag_no}
                  onChange={(e) => handleInputChange('dag_no', e.target.value)}
                  placeholder={isBn ? 'যেমন: ১০৫৮' : 'e.g. 1058'}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px 0 38px',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid #CAD7CF',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 4. Land Area (Decimal) */}
            <div className="form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="field-area-decimal" style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'জমির পরিমাণ (শতক/শতাংশ)' : 'Land Area (Decimal)'}
                </label>
                {renderFieldBadge('area_decimal', formData.area_decimal)}
              </div>
              <div style={{ position: 'relative' }}>
                <Maximize2 size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
                <input
                  id="field-area-decimal"
                  type="text"
                  value={formData.area_decimal}
                  onChange={(e) => handleInputChange('area_decimal', e.target.value)}
                  placeholder={isBn ? 'যেমন: ১৫.৫০' : 'e.g. 15.50'}
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px 0 38px',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid #CAD7CF',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 5. Document Date */}
            <div className="form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="field-document-date" style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'দলিলের তারিখ (Document Date)' : 'Document Date'}
                </label>
                {renderFieldBadge('document_date', formData.document_date)}
              </div>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
                <input
                  id="field-document-date"
                  type="text"
                  value={formData.document_date}
                  onChange={(e) => handleInputChange('document_date', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px 0 38px',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid #CAD7CF',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 6. Deed Number */}
            <div className="form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="field-deed-no" style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {isBn ? 'দলিল নম্বর (Deed No)' : 'Deed Number'}
                </label>
                {renderFieldBadge('deed_no', formData.deed_no)}
              </div>
              <div style={{ position: 'relative' }}>
                <FileCode2 size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} />
                <input
                  id="field-deed-no"
                  type="text"
                  value={formData.deed_no}
                  onChange={(e) => handleInputChange('deed_no', e.target.value)}
                  placeholder={isBn ? 'যেমন: ১৪৮২/২০২১' : 'e.g. 1482/2021'}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px 0 38px',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid #CAD7CF',
                    background: '#FFFFFF',
                    color: 'var(--text-main)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Action Row: "তথ্য মিলিয়ে দেখুন" */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #CAD7CF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--muted)' }}>
              <Info size={16} />
              <span>{isBn ? 'আপনার সম্পাদিত মান পরবর্তী তুলনা ধাপে কার্যকর হবে।' : 'Manual edits will be used in subsequent comparison.'}</span>
            </div>

            <button
              id="proceed-to-compare-btn"
              type="submit"
              className="btn-primary"
              style={{
                height: '48px',
                padding: '0 28px',
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                boxShadow: 'var(--shadow-hard-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '44px'
              }}
            >
              <span>{isBn ? 'তথ্য মিলিয়ে দেখুন →' : 'Compare Records →'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
