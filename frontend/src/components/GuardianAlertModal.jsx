import React, { useEffect, useRef } from 'react';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ArrowRightLeft, 
  Info,
  Radio
} from 'lucide-react';

export default function GuardianAlertModal({
  isOpen,
  onClose,
  alert,
  onMarkReviewed,
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

  if (!isOpen || !alert) return null;

  const isReviewed = alert.is_reviewed;

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
        aria-labelledby="guardian-modal-title"
        style={{
          background: 'var(--white)',
          width: '100%',
          maxWidth: '580px',
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
            <span style={{
              background: '#B45309',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              {isBn ? 'সিমুলেটেড ঘটনা' : 'SIMULATED'}
            </span>
            <h2
              id="guardian-modal-title"
              style={{
                margin: 0,
                fontSize: '1.18rem',
                fontWeight: 800,
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)'
              }}
            >
              {isBn ? alert.title_bn : alert.title_en}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={isBn ? 'বন্ধ করুন' : 'Close alert modal'}
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
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Metadata bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '0.8rem',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--line)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} />
              <span>{alert.timestamp || 'N/A'}</span>
            </div>
            <div>
              <span>{isBn ? 'প্লট আইডি:' : 'Plot ID:'} </span>
              <strong>{alert.record_id}</strong>
            </div>
            <div>
              <span>{isBn ? 'উৎস সিস্টেম:' : 'Source:'} </span>
              <span>{alert.source_system_mock || 'Land Registry Demo Feed'}</span>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            margin: 0
          }}>
            {isBn ? alert.description_bn : alert.description_en}
          </p>

          {/* Diff Report */}
          {alert.diff_report && alert.diff_report.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--muted)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '10px'
              }}>
                {isBn ? 'শনাক্তকৃত ক্ষেত্র পরিবর্তন:' : 'Detected Field Changes:'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alert.diff_report.map((diff, dIdx) => (
                  <div
                    key={dIdx}
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-std)',
                      padding: '14px'
                    }}
                  >
                    <div style={{
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      {isBn ? 'ক্ষেত্র:' : 'Field:'} {diff.field}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>
                          {isBn ? 'পূর্বের মান:' : 'Old Value:'}
                        </span>
                        <strong style={{ fontSize: '0.94rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                          {String(diff.old_value)}
                        </strong>
                      </div>

                      <ArrowRightLeft size={16} color="var(--primary-accent)" />

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: '#B45309', display: 'block' }}>
                          {isBn ? 'নতুন মান:' : 'New Value:'}
                        </span>
                        <strong style={{ fontSize: '0.94rem', color: '#B45309', fontFamily: 'var(--font-mono)' }}>
                          {String(diff.new_value)}
                        </strong>
                      </div>
                    </div>

                    {(diff.note_bn || diff.note_en) && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--ink-soft)',
                        marginTop: '8px',
                        paddingTop: '6px',
                        borderTop: '1px dashed var(--line)'
                      }}>
                        {isBn ? diff.note_bn : diff.note_en}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence & Risk Report Section (if available on alert) */}
          {alert.risk_report && (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: 'var(--radius-std)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#DC2626" />
                  <strong style={{ fontSize: '0.94rem', color: '#991B1B', fontFamily: 'var(--font-heading)' }}>
                    {isBn ? (alert.risk_report.risk_status_bn || 'সম্ভাব্য দ্বৈত বিক্রয়') : (alert.risk_report.risk_status || 'Potential Duplicate Sale')}
                  </strong>
                </div>
                <span style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '4px'
                }}>
                  SEVERITY: {alert.risk_report.severity || 'CRITICAL'}
                </span>
              </div>

              {/* Conflict Explanation Reason */}
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#7F1D1D', lineHeight: 1.55 }}>
                {isBn 
                  ? (alert.risk_report.conflict_explanation?.reason_bn || alert.risk_report.conflict_explanation?.why_conflicts_bn)
                  : (alert.risk_report.conflict_explanation?.reason_en || alert.risk_report.conflict_explanation?.why_conflicts_en)}
              </p>

              {/* Evidence Details Records */}
              {alert.risk_report.evidence_details && alert.risk_report.evidence_details.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991B1B', fontFamily: 'var(--font-heading)' }}>
                    {isBn ? 'সংশ্লিষ্ট প্রমাণ রেকর্ডসমূহ:' : 'Evidence Transaction Records:'}
                  </span>
                  {alert.risk_report.evidence_details.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #FECACA',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#991B1B' }}>{isBn ? rec.record_role_bn : rec.record_role_en}</strong>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.72rem' }}>ID: {rec.transaction_id}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink)' }}>
                        <span>বিক্রেতা: {rec.seller_name} ➔ ক্রেতা: {rec.buyer_name}</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{rec.land_area} শতক</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        উৎস: {rec.source} | তারিখ: {rec.transaction_date || 'অপ্রাপ্য'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Citizen Recommendation */}
          {(alert.action_recommendation_bn || alert.action_recommendation_en) && (
            <div style={{
              background: 'var(--accent-tint)',
              border: '1px solid #C4D6F5',
              borderRadius: 'var(--radius-std)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Info size={17} style={{ color: 'var(--primary-accent)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.86rem', color: 'var(--ink)', lineHeight: 1.55 }}>
                <strong>{isBn ? 'নাগরিকের করণীয়:' : 'Recommended Action:'} </strong>
                {isBn ? alert.action_recommendation_bn : alert.action_recommendation_en}
              </div>
            </div>
          )}

          {/* Simulation disclaimer */}
          <div style={{
            background: '#FEF4F0',
            border: '1px solid #F3BFB3',
            borderRadius: 'var(--radius-std)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#9A2C14'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{isBn ? 'সিমুলেশন নোটিশ: এটি সম্পূর্ণ কৃত্রিম ডেমো সতর্কতা, কোনো লাইভ সরকারি সিস্টেমের রায় নয়।' : 'Simulation Notice: Synthetic demo alert only.'}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid var(--line)',
          background: 'var(--paper)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              fontSize: '0.88rem',
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
            onClick={() => {
              onMarkReviewed(alert.alert_id);
              onClose();
            }}
            disabled={isReviewed}
            style={{
              padding: '9px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: isReviewed ? '1px solid var(--status-matched-border)' : 'none',
              background: isReviewed ? 'var(--status-matched-bg)' : 'var(--accent)',
              color: isReviewed ? 'var(--status-matched-text)' : 'var(--white)',
              cursor: isReviewed ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={15} />
            <span>
              {isReviewed
                ? (isBn ? '✓ পর্যালোচিত হয়েছে' : '✓ Reviewed')
                : (isBn ? 'পর্যালোচিত হিসেবে চিহ্নিত করুন' : 'Mark as Reviewed')}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
