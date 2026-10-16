import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Clock,
  Layers
} from 'lucide-react';

export default function TimelineDetailModal({
  isOpen,
  onClose,
  event,
  lang = 'bn',
  triggerRef
}) {
  const isBn = lang === 'bn';
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !event) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(13, 43, 46, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-modal-title"
        style={{
          background: 'var(--white)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-std)',
          border: '1px solid var(--line)',
          boxShadow: '0 20px 25px -5px rgba(16, 39, 42, 0.12), 0 10px 10px -5px rgba(16, 39, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-tint)',
              color: 'var(--primary-accent)',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex'
            }}>
              <Calendar size={18} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="timeline-modal-title"
                style={{
                  margin: 0,
                  fontSize: '1.14rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {isBn ? event.title_bn : event.title_en}
              </h2>
              <span style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                display: 'block'
              }}>
                {event.status_code || 'RECORDED'} • {event.year}
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Date and Stage */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-std)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block' }}>
                {isBn ? 'রেকর্ডকৃত তারিখ:' : 'Recorded Date:'}
              </span>
              <strong style={{ fontSize: '0.94rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                {event.date}
              </strong>
            </div>

            <span style={{
              background: 'var(--status-matched-bg)',
              color: 'var(--status-matched-text)',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              {event.status_code || 'RECORDED'}
            </span>
          </div>

          {/* Details */}
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--muted)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '6px'
            }}>
              {isBn ? 'রেকর্ড বিবরণ ও মৌজা নথি:' : 'Record Description:'}
            </div>
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
              margin: 0
            }}>
              {isBn ? event.detail_bn : event.detail_en}
            </p>
          </div>

          {/* Synthetic Demo Disclaimer */}
          <div style={{
            background: 'var(--ground)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-std)',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: 'var(--muted)',
            lineHeight: 1.45
          }}>
            <strong>{isBn ? 'নোট:' : 'Note:'} </strong>
            {isBn 
              ? 'এটি ডেমো রেকর্ডের ভিত্তিতে তৈরি সিন্থেটিক টাইমলাইন ইভেন্ট। কোনো লাইভ আদালতের রায় বা আইনি প্রত্যয়নপত্র নয়।'
              : 'Synthetic timeline derived from demo parcel record attributes.'}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '14px 24px',
          borderTop: '1px solid var(--line)',
          background: 'var(--paper)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: '1px solid var(--line)',
              background: 'var(--white)',
              color: 'var(--ink)',
              cursor: 'pointer'
            }}
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
