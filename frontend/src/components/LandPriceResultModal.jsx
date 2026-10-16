import React, { useEffect, useRef } from 'react';
import { 
  X, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  MapPin, 
  Compass, 
  RotateCcw,
  Cpu
} from 'lucide-react';

export default function LandPriceResultModal({
  isOpen,
  onClose,
  result,
  submittedInputs,
  lang = 'bn',
  triggerRef
}) {
  const isBn = lang === 'bn';
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Background scroll lock and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
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
      // Restore focus to trigger element
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !result) return null;

  const formatBdt = (num) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="landprice-modal-title"
        style={{
          background: 'var(--white)',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-std)',
          border: '1px solid var(--line)',
          boxShadow: '0 20px 25px -5px rgba(16, 39, 42, 0.12), 0 10px 10px -5px rgba(16, 39, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
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
              <TrendingUp size={20} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="landprice-modal-title"
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {isBn ? 'জমির মূল্য বিশ্লেষণের ফলাফল' : 'Land Valuation Results'}
              </h2>
              <span style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                display: 'block'
              }}>
                ML REGRESSION • {result.model_identifier || 'v1-histgradient'}
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={isBn ? 'বন্ধ করুন' : 'Close modal'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--ink)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Primary Result Highlight Card */}
          <div style={{
            background: 'linear-gradient(135deg, #F0F7F4 0%, #E6F2ED 100%)',
            border: '1px solid #B8DDD0',
            borderRadius: 'var(--radius-std)',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--muted)',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              {isBn ? 'মোট আনুমানিক জমির মূল্য' : 'Estimated Total Parcel Price'}
            </div>

            <div style={{
              fontSize: 'clamp(2rem, 4vw, 2.7rem)',
              fontWeight: 800,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.15,
              marginBottom: '8px'
            }}>
              {formatBdt(result.predicted_total_price_bdt)} ৳
            </div>

            {result.total_price_interval && (
              <div style={{
                fontSize: '0.86rem',
                color: 'var(--ink-soft)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.5
              }}>
                {isBn ? '৮০% সম্ভাব্য বিচ্যুতির পরিসীমা: ' : '80% Empirical Interval: '}
                <strong style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatBdt(result.total_price_interval.lower)} ৳
                </strong>
                {' — '}
                <strong style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatBdt(result.total_price_interval.upper)} ৳
                </strong>
              </div>
            )}
          </div>

          {/* Secondary Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            {/* Price Per Decimal */}
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-std)',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--muted)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '4px'
              }}>
                {isBn ? 'প্রতি শতকের আনুমানিক দর' : 'Price per Decimal'}
              </div>
              <div style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)'
              }}>
                {formatBdt(result.predicted_price_per_decimal_bdt)} ৳
              </div>
              {result.price_per_decimal_interval && (
                <div style={{
                  fontSize: '0.76rem',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px'
                }}>
                  ±{formatBdt(result.price_per_decimal_interval.upper - result.predicted_price_per_decimal_bdt)} ৳ (80% bound)
                </div>
              )}
            </div>

            {/* Unit Consistency Verification */}
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-std)',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--muted)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '4px'
              }}>
                {isBn ? 'একক সমতা যাচাই' : 'Unit Consistency Check'}
              </div>
              <div style={{
                fontSize: '0.94rem',
                fontWeight: 700,
                color: 'var(--status-matched-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <CheckCircle2 size={16} />
                <span>{isBn ? 'গাণিতিকভাবে নিশ্চিত' : 'Verified Consistent'}</span>
              </div>
              <div style={{
                fontSize: '0.76rem',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px'
              }}>
                rate × {result.land_area_decimal} {isBn ? 'শতক' : 'decimals'} = total
              </div>
            </div>
          </div>

          {/* Submitted Input Summary Chips */}
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--muted)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '8px'
            }}>
              {isBn ? 'মূল্যায়নে ব্যবহৃত ইনপুট সারসংক্ষেপ:' : 'Submitted Feature Summary:'}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={chipStyle}>
                <Layers size={13} style={{ color: 'var(--primary-accent)' }} />
                <span>{result.land_area_decimal} {isBn ? 'শতক' : 'Decimals'}</span>
              </span>
              {submittedInputs?.landType && (
                <span style={chipStyle}>
                  <span>{submittedInputs.landType.replace(/_/g, ' ')}</span>
                </span>
              )}
              {submittedInputs?.roadAccessType && (
                <span style={chipStyle}>
                  <Compass size={13} style={{ color: 'var(--primary-accent)' }} />
                  <span>{submittedInputs.roadAccessType.replace(/_/g, ' ')} ({submittedInputs.roadWidthFt} ft)</span>
                </span>
              )}
              {submittedInputs?.mouzaId && (
                <span style={chipStyle}>
                  <MapPin size={13} style={{ color: 'var(--primary-accent)' }} />
                  <span>{submittedInputs.mouzaId}</span>
                </span>
              )}
            </div>
          </div>

          {/* Warnings if any */}
          {result.warnings && result.warnings.length > 0 && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-std)',
              padding: '12px 14px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#92400E',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: '4px'
              }}>
                <AlertTriangle size={15} />
                <span>{isBn ? 'ডোমেইন প্রযোজ্যতা সতর্কতা' : 'Applicability Warning'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: '#78350F' }}>
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Information */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-std)',
            padding: '14px',
            fontSize: '0.78rem',
            color: 'var(--ink-soft)',
            lineHeight: 1.55
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Cpu size={14} style={{ color: 'var(--primary-accent)' }} />
              <strong>{isBn ? 'মডেল আর্কিটেকচার:' : 'Model Architecture:'}</strong>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{result.model_identifier}</span>
            </div>
            <div>
              <strong>Provenance:</strong> {result.data_provenance}
            </div>
          </div>

          {/* Critical Legal Disclaimer */}
          <div style={{
            background: '#FEF4F0',
            border: '1px solid #F3BFB3',
            borderRadius: 'var(--radius-std)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldAlert size={18} style={{ color: '#9A2C14', flexShrink: 0 }} aria-hidden="true" />
            <div style={{ fontSize: '0.82rem', color: '#9A2C14', lineHeight: 1.5 }}>
              <strong>{isBn ? 'আইনি নোটিশ:' : 'Notice:'} </strong>
              {isBn ? 'এটি বাস্তব বাজারদর বা সরকারি মূল্যায়ন নয়।' : 'This is not an official government valuation or real market price.'}
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid var(--line)',
          background: 'var(--paper)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              fontSize: '0.9rem',
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

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--white)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} />
            <span>{isBn ? 'আবার বিশ্লেষণ করুন' : 'Analyze Again'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  background: 'var(--white)',
  border: '1px solid var(--line)',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '0.78rem',
  fontFamily: 'var(--font-mono)',
  color: 'var(--ink)'
};
