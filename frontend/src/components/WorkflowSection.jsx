import React, { useState } from 'react';
import { 
  FileUp, 
  ScanText, 
  History, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Compass,
  Layers,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import bnTranslations from '../i18n/bn.json';
import enTranslations from '../i18n/en.json';

/**
 * WorkflowSection: Land Information Flow
 * 
 * 4 Steps:
 * 1 Upload the deed
 * 2 See deed details
 * 3 See owners, history and cases
 * 4 See the experimental price and next official steps
 */
export default function WorkflowSection({ lang = 'bn', onStartScanning }) {
  const t = (key) => {
    const dict = lang === 'bn' ? bnTranslations : enTranslations;
    return dict[key] || bnTranslations[key] || key;
  };
  const isBn = lang === 'bn';
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'upload',
      number: '০১',
      numberEn: '01',
      phase: 'DEED UPLOAD',
      title: t('workflow_step1_title'),
      subtitle: isBn ? 'ছবি বা স্ক্যান কপি গ্রহণ' : 'Image or PDF ingestion',
      desc: t('workflow_step1_desc'),
      icon: FileUp,
      sampleTag: 'PDF / JPEG',
      specimen: isBn ? 'দলিল স্ক্যান ফাইল গৃহীত' : 'Deed specimen loaded'
    },
    {
      id: 'details',
      number: '০২',
      numberEn: '02',
      phase: 'DEED DETAILS',
      title: t('workflow_step2_title'),
      subtitle: isBn ? 'দলিলের মূল তথ্য' : 'Deed parameters',
      desc: t('workflow_step2_desc'),
      icon: ScanText,
      sampleTag: 'DEED OCR',
      specimen: isBn ? 'দাগ: ৫৫৮ • খতিয়ান: ১২৮' : 'Dag: 558 • Khatian: 128'
    },
    {
      id: 'history',
      number: '০৩',
      numberEn: '03',
      phase: 'OWNERS & CASES',
      title: t('workflow_step3_title'),
      subtitle: isBn ? 'মালিকানা চেইন ও মামলার তথ্য' : 'Title chain & linked cases',
      desc: t('workflow_step3_desc'),
      icon: History,
      sampleTag: 'HISTORY & CASES',
      specimen: isBn ? 'ধারাবাহিকতা: ৪টি হস্তান্তর' : 'Custody: 4 recorded transfers'
    },
    {
      id: 'price-next',
      number: '০৪',
      numberEn: '04',
      phase: 'PRICE & NEXT STEPS',
      title: t('workflow_step4_title'),
      subtitle: isBn ? 'সম্ভাব্য দাম ও নির্দেশনা' : 'Price estimate & official steps',
      desc: t('workflow_step4_desc'),
      icon: Sparkles,
      sampleTag: 'ML · EXPERIMENTAL',
      specimen: isBn ? 'সম্ভাব্য দর ও নির্দেশিকা' : 'Price estimate & guidance'
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="verification-process-section" 
      style={{
        padding: 'clamp(36px, 4.5vw, 54px) 0',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--line)',
        position: 'relative'
      }}
    >
      <div 
        className="landing-container" 
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop)',
          boxSizing: 'border-box'
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-std)',
            background: 'var(--accent-tint)',
            border: '1px solid #C4D6F5',
            color: 'var(--primary-accent)',
            fontSize: '0.74rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            marginBottom: '10px',
            letterSpacing: '0.6px'
          }}>
            <Compass size={13} color="var(--primary-accent)" />
            <span>{isBn ? 'স্বচ্ছ প্রক্রিয়া' : 'LAND PROCESS PIPELINE'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.0vw, 2.4rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '10px',
            letterSpacing: '-0.3px'
          }}>
            {t('landing_workflow_heading')}
          </h2>

          <p style={{
            fontSize: '0.98rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.55,
            margin: 0
          }}>
            {t('landing_workflow_sub')}
          </p>
        </div>

        {/* =========================================================================
            DESKTOP HORIZONTAL "LIVING MAP PROCESS" VISUAL
           ========================================================================= */}
        <div className="process-desktop-track">
          {/* Continuous Connected Cadastral Line */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              marginBottom: '18px'
            }}
          >
            {/* Background Line */}
            <div 
              style={{
                position: 'absolute',
                top: '20px',
                left: '12.5%',
                right: '12.5%',
                height: '2px',
                background: 'var(--line)',
                zIndex: 1
              }} 
            />

            {/* 4 Connected Survey Marker Nodes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              position: 'relative',
              zIndex: 2
            }}>
              {steps.map((step, idx) => {
                const isSelected = activeStep === idx;
                return (
                  <div 
                    key={idx} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--primary-accent)' : 'var(--white)',
                      border: '2px solid var(--primary-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: isSelected ? '#FFFFFF' : 'var(--primary-accent)',
                      boxShadow: isSelected ? '0 4px 12px rgba(39, 66, 160, 0.35)' : '0 2px 6px rgba(16, 39, 42, 0.08)',
                      transition: 'all 0.2s ease'
                    }}>
                      {isBn ? step.number : step.numberEn}
                    </div>

                    <span style={{
                      marginTop: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: isSelected ? 'var(--primary-accent)' : 'var(--text-muted)',
                      letterSpacing: '0.5px'
                    }}>
                      {step.phase}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Connected Step Cards with Integrated Visual Specimen */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  className="process-step-card"
                  onClick={() => setActiveStep(idx)}
                  style={{
                    background: isSelected ? '#FFFFFF' : 'var(--paper)',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--primary-accent)' : '1.5px solid var(--line)',
                    padding: '18px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 8px 22px rgba(39, 66, 160, 0.12)' : '0 2px 6px rgba(16, 39, 42, 0.03)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={() => setActiveStep(idx)}
                >
                  <div>
                    {/* Top Row: Icon & Tag */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '6px',
                        background: isSelected ? 'var(--accent-tint)' : 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-accent)',
                        border: '1px solid #C4D6F5'
                      }}>
                        <Icon size={18} />
                      </div>

                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isSelected ? 'var(--primary-accent)' : 'var(--text-muted)',
                        background: isSelected ? 'var(--accent-tint)' : 'var(--bg-primary)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)'
                      }}>
                        {step.sampleTag}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 style={{
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-heading)',
                      marginBottom: '4px',
                      lineHeight: 1.25
                    }}>
                      {step.title}
                    </h3>

                    {/* Short Subtitle */}
                    <span style={{
                      display: 'block',
                      fontSize: '0.74rem',
                      color: 'var(--primary-accent)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      marginBottom: '8px'
                    }}>
                      {step.subtitle}
                    </span>

                    {/* Step Description */}
                    <p style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-body)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                      margin: '0 0 14px'
                    }}>
                      {step.desc}
                    </p>
                  </div>

                  {/* Micro Visual Specimen Tag */}
                  <div style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--accent-tint)' : 'var(--bg-primary)',
                    border: '1px solid var(--line)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={12} color="var(--primary-accent)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {step.specimen}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            MOBILE VERTICAL TIMELINE (< 768px)
           ========================================================================= */}
        <div className="process-mobile-track">
          <div style={{ position: 'relative', paddingLeft: '44px' }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              bottom: '40px',
              left: '18px',
              width: '2px',
              background: 'var(--line)'
            }} />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    position: 'relative', 
                    marginBottom: idx === steps.length - 1 ? '0' : '18px' 
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '-44px',
                    top: '0',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--white)',
                    border: '2px solid var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: 'var(--primary-accent)',
                    boxShadow: '0 2px 6px rgba(39, 66, 160, 0.15)',
                    zIndex: 2
                  }}>
                    {isBn ? step.number : step.numberEn}
                  </div>

                  <div style={{
                    background: 'var(--white)',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    padding: '14px',
                    boxShadow: '0 2px 6px rgba(16, 39, 42, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={16} color="var(--primary-accent)" />
                        <h3 style={{
                          fontSize: '0.98rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          fontFamily: 'var(--font-heading)',
                          margin: 0
                        }}>
                          {step.title}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-accent)', fontWeight: 700 }}>
                        {step.phase}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-body)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.45,
                      margin: '0 0 8px'
                    }}>
                      {step.desc}
                    </p>

                    <div style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>&bull;</span>
                      <span>{step.specimen}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Verification Trigger Button */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button
            type="button"
            id="process-start-verification-btn"
            onClick={onStartScanning}
            className="btn-primary"
            style={{
              height: '44px',
              padding: '0 24px',
              fontSize: '0.94rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              background: 'var(--primary-accent)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: '0 4px 12px rgba(39, 66, 160, 0.28)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background 0.15s ease, transform 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary-accent)';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <span>{isBn ? 'দলিল আপলোড করে যাচাই শুরু করুন' : 'Start Deed Verification'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        .process-desktop-track {
          display: block;
        }
        .process-mobile-track {
          display: none;
        }

        @media (max-width: 820px) {
          .process-desktop-track {
            display: none !important;
          }
          .process-mobile-track {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
