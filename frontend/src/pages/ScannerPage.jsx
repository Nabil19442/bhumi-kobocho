import React, { useState } from 'react';
import { 
  FileText, 
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
  ScanText
} from 'lucide-react';
import { scanDocument } from '../api';

export default function ScannerPage({ t, onProceedToCompare, setSharedExtractedData }) {
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
          area_decimal: res.extracted_fields.area_decimal || '',
          document_date: res.extracted_fields.document_date || '',
          deed_no: res.extracted_fields.deed_no || '',
        });
        setConfidence(res.confidence_scores || {});
        setFieldStatus(res.ocr_field_status || {});
        setStatusMessage({
          type: 'success',
          text: fileObj 
            ? `Successfully extracted fields from ${fileObj.name}` 
            : `Loaded demo specimen: ${sampleVal === '001' ? 'Plot #1058 (Mirpur)' : sampleVal === '002' ? 'Plot #2490 (Badda)' : 'Low-confidence test'}`
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.isOffline
          ? 'Backend offline: Please ensure the backend server is running on http://127.0.0.1:8000.'
          : (err.message || 'Error extracting fields from document.'),
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

  return (
    <div className="app-viewport">
      {/* Page Heading */}
      <div className="page-header-block">
        <h2 className="page-title">
          <ScanText size={28} style={{ color: 'var(--emerald-primary)' }} />
          {t.scan_heading}
        </h2>
        <p className="page-subtitle">{t.scan_subheading}</p>
      </div>

      {/* Step 5: Dual Upload Cards (Option A & Option B) */}
      <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
        {/* Option A: Try Demo Document */}
        <div className="upload-option-card">
          <div className="upload-option-top">
            <span className="upload-option-badge demo">
              <FileCheck size={13} />
              {t.option_a_label}
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              {t.option_a_title}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {t.option_a_desc}
            </p>
          </div>

          <div>
            <div className="form-field" style={{ marginBottom: '16px' }}>
              <select
                id="sample-document-select"
                className="field-select"
                value={selectedSample}
                onChange={(e) => setSelectedSample(e.target.value)}
                aria-label="Select Demo Document Specimen"
              >
                <option value="001">Specimen 01: Md. Rafiqul Islam — Dag 1058, Khatian 412 (15.5 dec)</option>
                <option value="002">Specimen 02: Sultana Jahan — Dag 2490, Khatian 835 (8.25 dec)</option>
                <option value="custom">Specimen 03: Degraded Text / Binary Specimen (Simulate OCR failure)</option>
              </select>
            </div>

            <button
              id="load-demo-btn"
              type="button"
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={handleLoadDemo}
              disabled={isScanning}
            >
              <RefreshCw size={15} className={isScanning ? 'spin' : ''} />
              <span>{t.option_a_btn}</span>
            </button>
          </div>
        </div>

        {/* Option B: Upload Your Document */}
        <div className="upload-option-card">
          <div className="upload-option-top">
            <span className="upload-option-badge custom">
              <Upload size={13} />
              CUSTOM DEED
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              {t.option_b_title}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {t.option_b_desc}
            </p>
          </div>

          <div>
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
              aria-label="Upload document dropzone"
            >
              <input
                id="deed-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Upload className="drag-drop-icon" />
              <div className="drag-drop-text">
                {uploadedFile ? (
                  <strong style={{ color: 'var(--cyan-secondary)' }}>{uploadedFile.name}</strong>
                ) : (
                  <span>{t.dropzone_prompt} <span style={{ color: 'var(--cyan-secondary)', textDecoration: 'underline' }}>{t.browse_files}</span></span>
                )}
              </div>
              <div className="drag-drop-formats">{t.supported_formats}</div>
            </div>

            {uploadedFile && (
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.file_selected}: {uploadedFile.name}</span>
                <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Scanning Feedback */}
      {isScanning && (
        <div className="saas-card" style={{ textAlign: 'center', padding: '24px', borderColor: 'var(--cyan-border)' }}>
          <RefreshCw size={24} className="spin" style={{ color: 'var(--cyan-secondary)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{t.scanning_progress}</p>
        </div>
      )}

      {statusMessage && !isScanning && (
        <div style={{
          marginBottom: '20px',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: 500,
          background: statusMessage.type === 'success' ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
          color: statusMessage.type === 'success' ? 'var(--emerald-light)' : '#FB7185',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
          {statusMessage.type === 'error' && statusMessage.canRetry && (
            <button
              type="button"
              onClick={() => triggerScan(statusMessage.retryParams?.sampleVal, statusMessage.retryParams?.fileObj)}
              className="btn-secondary"
              style={{
                height: '30px',
                padding: '0 10px',
                fontSize: '0.78rem',
                borderColor: 'var(--line)',
                color: 'var(--crimson-text, #C0392B)',
                background: '#FEF4F0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Step 6: Extracted Field Review Grid */}
      <div className="saas-card">
        <div className="saas-card-header">
          <div>
            <h3 className="saas-card-title">
              <Sparkles size={18} style={{ color: 'var(--emerald-primary)' }} />
              {t.review_heading}
            </h3>
            <p className="saas-card-desc">{t.review_subheading}</p>
          </div>
          <span className="status-pill not-checked">OCR CONFIDENCE ENGINE</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
            {/* 1. Owner Name */}
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="field-owner-name">{t.field_owner}</label>
                {confidence.owner_name !== undefined && (
                  <span className={`status-pill ${confidence.owner_name < 0.75 ? 'needs-review' : 'matched'}`}>
                    {confidence.owner_name < 0.75 ? t.status_needs_review : `${Math.round(confidence.owner_name * 100)}% Conf`}
                  </span>
                )}
              </div>
              <div className="field-input-box">
                <User size={16} className="field-input-icon" />
                <input
                  id="field-owner-name"
                  type="text"
                  className="field-input"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder="e.g. Md. Rafiqul Islam"
                  required
                />
              </div>
            </div>

            {/* 2. Khatian Number */}
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="field-khatian-no">{t.field_khatian}</label>
                {confidence.khatian_no !== undefined && (
                  <span className={`status-pill ${confidence.khatian_no < 0.75 ? 'needs-review' : 'matched'}`}>
                    {confidence.khatian_no < 0.75 ? t.status_needs_review : `${Math.round(confidence.khatian_no * 100)}% Conf`}
                  </span>
                )}
              </div>
              <div className="field-input-box">
                <Hash size={16} className="field-input-icon" />
                <input
                  id="field-khatian-no"
                  type="text"
                  className="field-input"
                  value={formData.khatian_no}
                  onChange={(e) => handleInputChange('khatian_no', e.target.value)}
                  placeholder="e.g. 412"
                  required
                />
              </div>
            </div>

            {/* 3. Dag Number */}
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="field-dag-no">{t.field_dag}</label>
                {confidence.dag_no !== undefined && (
                  <span className={`status-pill ${confidence.dag_no < 0.75 ? 'needs-review' : 'matched'}`}>
                    {confidence.dag_no < 0.75 ? t.status_needs_review : `${Math.round(confidence.dag_no * 100)}% Conf`}
                  </span>
                )}
              </div>
              <div className="field-input-box">
                <MapPin size={16} className="field-input-icon" />
                <input
                  id="field-dag-no"
                  type="text"
                  className="field-input"
                  value={formData.dag_no}
                  onChange={(e) => handleInputChange('dag_no', e.target.value)}
                  placeholder="e.g. 1058"
                  required
                />
              </div>
            </div>

            {/* 4. Land Area */}
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="field-area-decimal">{t.field_area}</label>
                {confidence.area_decimal !== undefined && (
                  <span className={`status-pill ${confidence.area_decimal < 0.75 ? 'needs-review' : 'matched'}`}>
                    {confidence.area_decimal < 0.75 ? t.status_needs_review : `${Math.round(confidence.area_decimal * 100)}% Conf`}
                  </span>
                )}
              </div>
              <div className="field-input-box">
                <Maximize2 size={16} className="field-input-icon" />
                <input
                  id="field-area-decimal"
                  type="text"
                  className="field-input"
                  value={formData.area_decimal}
                  onChange={(e) => handleInputChange('area_decimal', e.target.value)}
                  placeholder="e.g. 15.5"
                  required
                />
              </div>
            </div>

            {/* 5. Document Date */}
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="field-document-date">{t.field_date}</label>
                {confidence.document_date !== undefined && (
                  <span className={`status-pill ${confidence.document_date < 0.75 ? 'needs-review' : 'matched'}`}>
                    {confidence.document_date < 0.75 ? t.status_needs_review : `${Math.round(confidence.document_date * 100)}% Conf`}
                  </span>
                )}
              </div>
              <div className="field-input-box">
                <Calendar size={16} className="field-input-icon" />
                <input
                  id="field-document-date"
                  type="text"
                  className="field-input"
                  value={formData.document_date}
                  onChange={(e) => handleInputChange('document_date', e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* 6. Deed Number */}
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="field-deed-no">{t.field_deed_no}</label>
                {confidence.deed_no !== undefined && (
                  <span className={`status-pill ${confidence.deed_no < 0.75 ? 'needs-review' : 'matched'}`}>
                    {confidence.deed_no < 0.75 ? t.status_needs_review : `${Math.round(confidence.deed_no * 100)}% Conf`}
                  </span>
                )}
              </div>
              <div className="field-input-box">
                <FileCode2 size={16} className="field-input-icon" />
                <input
                  id="field-deed-no"
                  type="text"
                  className="field-input"
                  value={formData.deed_no}
                  onChange={(e) => handleInputChange('deed_no', e.target.value)}
                  placeholder="e.g. 1482/2021"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              id="proceed-to-compare-btn"
              type="submit"
              className="btn-primary"
            >
              <span>{t.btn_confirm_compare}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
