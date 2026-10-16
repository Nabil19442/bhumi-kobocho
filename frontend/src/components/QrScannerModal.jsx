import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  ShieldAlert, 
  Smartphone, 
  RefreshCw 
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess, lang = 'bn' }) {
  const isBn = lang === 'bn';
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [fileScanError, setFileScanError] = useState(null);
  const [externalPrompt, setExternalPrompt] = useState(null);
  const [unrecognizedPayload, setUnrecognizedPayload] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const regionId = 'bhumi-qr-reader-region';

  const stopScannerSafely = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error clearing scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleDecoded = async (decodedText) => {
    await stopScannerSafely();
    const raw = (decodedText || '').trim();

    // 1. Direct record ID match
    if (/^rec-demo-\d{3}$/.test(raw)) {
      onScanSuccess(raw);
      onClose();
      return;
    }

    // 2. URL parsing & validation
    try {
      const url = new URL(raw, window.location.origin);
      const isAppOrigin = url.origin === window.location.origin || 
                          url.hostname === 'localhost' || 
                          url.hostname === '127.0.0.1';
      
      const verifyMatch = url.pathname.match(/\/verify\/([a-zA-Z0-9_-]+)/);

      if (verifyMatch) {
        const recordId = verifyMatch[1];
        if (isAppOrigin) {
          // Safe trusted in-app verification link
          onScanSuccess(recordId);
          onClose();
        } else {
          // External host with verify path -> require explicit confirmation
          setExternalPrompt({
            url: raw,
            recordId: recordId,
            isVerify: true
          });
        }
      } else {
        // External link without verify path
        setExternalPrompt({
          url: raw,
          recordId: null,
          isVerify: false
        });
      }
    } catch {
      setUnrecognizedPayload(raw);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScannerSafely();
      return;
    }

    setIsInitializing(true);
    setCameraError(null);
    setFileScanError(null);
    setExternalPrompt(null);
    setUnrecognizedPayload(null);

    const timer = setTimeout(() => {
      const qrScanner = new Html5Qrcode(regionId);
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0
      };

      qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleDecoded(decodedText);
        },
        () => {
          // ignore continuous scanning attempts
        }
      )
      .then(() => {
        setIsInitializing(false);
      })
      .catch((err) => {
        console.warn('Camera start error:', err);
        setIsInitializing(false);
        const msg = String(err || '');
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setCameraError(
            isBn
              ? 'ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংসে ক্যামেরা পারমিশন চালু করুন অথবা নিচের বাটন দিয়ে কিউআর ছবির ফাইল আপলোড করুন।'
              : 'Camera access denied. Please allow camera permissions in browser settings, or upload a QR image below.'
          );
        } else if (msg.includes('NotFoundError') || msg.includes('no camera')) {
          setCameraError(
            isBn
              ? 'আপনার ডিভাইসে কোনো উপযুক্ত ক্যামেরা পাওয়া যায়নি। নিচে কিউআর ছবির ফাইল আপলোড করে স্ক্যান করতে পারেন।'
              : 'No camera found on this device. You can upload a QR image below.'
          );
        } else {
          setCameraError(
            isBn
              ? 'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে নিচের ফাইল আপলোড অপশন ব্যবহার করুন।'
              : 'Unable to start camera preview. Please use the image upload option below.'
          );
        }
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScannerSafely();
    };
  }, [isOpen]);

  const handleFileScan = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileScanError(null);
    try {
      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode(regionId);
        html5QrCodeRef.current = scanner;
      }
      const decodedText = await scanner.scanFile(file, true);
      handleDecoded(decodedText);
    } catch (err) {
      console.warn('File scan error:', err);
      setFileScanError(
        isBn
          ? 'এই ছবিতে কোনো স্পষ্ট কিউআর কোড পাওয়া যায়নি। অনুগ্রহ করে পরিষ্কার ছবি নির্বাচন করুন।'
          : 'Could not detect a valid QR code in this image. Please choose a clearer picture.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(16, 39, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-box"
        style={{
          background: 'var(--white)',
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius-std)',
          border: '2px solid var(--text-main)',
          boxShadow: 'var(--shadow-hard-md)',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #CAD7CF', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="var(--primary-accent)" />
            <h3 id="scanner-modal-title" style={{ margin: 0, fontSize: '1.14rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {isBn ? 'কিউআর কোড স্ক্যানার' : 'QR Code Scanner'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Disclaimer Warning Banner */}
        <div style={{
          background: '#FEF9C3',
          border: '1px solid #FDE047',
          color: '#854D0E',
          padding: '8px 12px',
          borderRadius: 'var(--radius-std)',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>{isBn ? 'ডেমো ডেটা — কিউআর স্ক্যান কোনো আইনি সনদ নয়।' : 'DEMO DATA — QR scanning does not convey legal title.'}</span>
        </div>

        {/* External URL Confirmation Modal State */}
        {externalPrompt && (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #F87171', borderRadius: 'var(--radius-std)', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', marginBottom: '8px' }}>
              <ShieldAlert size={20} />
              <strong style={{ fontSize: '0.94rem', fontFamily: 'var(--font-heading)' }}>
                {isBn ? 'বহিঃস্থ লিংক সতর্কতা (External Link Notice)' : 'External Link Warning'}
              </strong>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#7F1D1D', margin: '0 0 10px', lineHeight: 1.5 }}>
              {isBn 
                ? 'স্ক্যান করা কিউআর কোডটিতে এই অ্যাপ্লিকেশনের বাইরের একটি ঠিকানা রয়েছে। নিরাপত্তা সুরক্ষার্থে স্বয়ংক্রিয়ভাবে প্রবেশ বন্ধ রাখা হয়েছে:' 
                : 'The scanned QR code points to an external destination outside this application. Automatic redirection blocked for security:'}
            </p>
            <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #FCA5A5', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all', marginBottom: '12px', color: '#10272A' }}>
              {externalPrompt.url}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setExternalPrompt(null)}
                style={{ height: '36px', padding: '0 12px', fontSize: '0.84rem' }}
              >
                {isBn ? 'বাতিল করুন' : 'Cancel'}
              </button>
              {externalPrompt.recordId && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    onScanSuccess(externalPrompt.recordId);
                    onClose();
                  }}
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.84rem', background: 'var(--primary-accent)', color: '#FFF' }}
                >
                  {isBn ? 'এই রেকর্ডে প্রবেশ করুন' : 'Open Target Record'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Unrecognized payload state */}
        {unrecognizedPayload && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 'var(--radius-std)', padding: '14px', marginBottom: '16px' }}>
            <strong style={{ fontSize: '0.9rem', color: '#92400E', display: 'block', marginBottom: '4px' }}>
              {isBn ? 'অচেনা কিউআর ফরম্যাট' : 'Unrecognized QR Content'}
            </strong>
            <p style={{ fontSize: '0.82rem', color: '#78350F', margin: '0 0 8px' }}>
              {isBn ? 'স্ক্যান করা টেক্সটটি কোনো পরিচিত ভূমি রেকর্ড লিঙ্ক নয়:' : 'The scanned text does not correspond to a known land record reference:'}
            </p>
            <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #FDE68A', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', wordBreak: 'break-all', marginBottom: '10px' }}>
              {unrecognizedPayload}
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setUnrecognizedPayload(null)}
              style={{ height: '34px', padding: '0 12px', fontSize: '0.82rem' }}
            >
              {isBn ? 'আবার স্ক্যান করুন' : 'Scan Again'}
            </button>
          </div>
        )}

        {/* Video / Camera Viewport */}
        {!externalPrompt && !unrecognizedPayload && (
          <div>
            <div 
              style={{
                position: 'relative',
                background: '#10272A',
                borderRadius: 'var(--radius-std)',
                overflow: 'hidden',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--text-main)'
              }}
            >
              <div 
                id={regionId} 
                ref={scannerRef}
                style={{ width: '100%', minHeight: '260px' }} 
              />
              
              {isInitializing && !cameraError && (
                <div style={{ position: 'absolute', color: '#EAF0E8', textAlign: 'center', padding: '16px' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.84rem', margin: 0 }}>
                    {isBn ? 'ক্যামেরা চালু হচ্ছে...' : 'Initializing camera stream...'}
                  </p>
                </div>
              )}
            </div>

            {/* Error or Permission Notice */}
            {cameraError && (
              <div style={{ marginTop: '14px', padding: '12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-std)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#991B1B' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                    {cameraError}
                  </span>
                </div>
              </div>
            )}

            {/* File Scan Error */}
            {fileScanError && (
              <div style={{ marginTop: '10px', padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-std)', color: '#991B1B', fontSize: '0.82rem' }}>
                {fileScanError}
              </div>
            )}

            {/* Alternative: Image File Upload */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #CAD7CF' }}>
              <label 
                htmlFor="qr-file-upload-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-std)',
                  border: '1.5px solid var(--text-main)',
                  background: 'var(--paper)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer'
                }}
              >
                <Upload size={16} />
                <span>{isBn ? 'কিউআর ছবির ফাইল আপলোড করুন' : 'Upload QR Image File'}</span>
              </label>
              <input
                id="qr-file-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileScan}
                style={{ display: 'none' }}
              />
            </div>

            {/* Smartphone Camera Hint */}
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              background: '#F1F5F0',
              border: '1px solid #CBD8D2',
              borderRadius: 'var(--radius-std)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--muted)'
            }}>
              <Smartphone size={16} style={{ flexShrink: 0 }} />
              <span>
                {isBn 
                  ? 'টিপস: যেকোনো সাধারণ স্মার্টফোনের ক্যামেরা অ্যাপ দিয়েও এই কিউআর স্ক্যান করে সরাসরি যাচাই পেজ খোলা যাবে।' 
                  : 'Tip: You can also point your standard phone camera at the QR code to open the verification page.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
