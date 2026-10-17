import React, { useState } from 'react';
import { 
  FileUp, 
  ScanText, 
  GitCompare, 
  FileCheck2, 
  ArrowRight, 
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

/**
 * WorkflowSection: Land Verification Process
 * 
 * Distinctive horizontal connected timeline:
 * Document Upload → AI Extraction → Ownership Cross-check → Risk Report
 * Visually connected to the cadastral living map aesthetic.
 */
export default function WorkflowSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'upload',
      number: '০১',
      numberEn: '01',
      phase: 'INGESTION',
      title: isBn ? 'দলিল আপলোড' : 'Document Upload',
      subtitle: isBn ? 'ছবি বা স্ক্যান কপি গ্রহণ' : 'Image or PDF ingestion',
      desc: isBn
        ? 'বিক্রেতা বা আবেদনকারীর দলিলের স্ক্যান কপি (ছবি বা PDF) আপলোড করুন অথবা ডেমো দলিল নির্বাচন করুন।'
        : 'Upload a scanned deed document (image or PDF) or choose a pre-loaded demonstration deed.',
      icon: FileUp,
      sampleTag: 'PDF / JPEG',
      specimen: isBn ? 'দলিল স্ক্যান ফাইল গৃহীত' : 'Deed specimen loaded'
    },
    {
      id: 'extract',
      number: '০২',
      numberEn: '02',
      phase: 'AI EXTRACTION',
      title: isBn ? 'এআই তথ্য শনাক্তকরণ' : 'AI Extraction',
      subtitle: isBn ? 'অপটিক্যাল এআই পার্সিং' : 'Optical entity parsing',
      desc: isBn
        ? 'অপটিক্যাল এআই স্বয়ংক্রিয়ভাবে বিক্রেতা, ক্রেতা, দাগ নং, খতিয়ান, মৌজা ও জমির পরিমাণ নির্ভুলভাবে এক্সট্রাক্ট করে।'
        : 'Optical AI accurately extracts seller, buyer, plot (dag), khatian, mouza, and acreages into structured fields.',
      icon: ScanText,
      sampleTag: 'OCR 99.4%',
      specimen: isBn ? 'দাগ: ৫৫৮ • খতিয়ান: ১২৮' : 'Dag: 558 • Khatian: 128'
    },
    {
      id: 'crosscheck',
      number: '০৩',
      numberEn: '03',
      phase: 'CADASTRAL AUDIT',
      title: isBn ? 'মালিকানা ক্রস-চেক' : 'Ownership Cross-check',
      subtitle: isBn ? 'রেকর্ড ও চেইন যাচাই' : 'Cadastre & chain audit',
      desc: isBn
        ? 'শনাক্তকৃত দাগ ও খতিয়ানের বিপরীতে সংরক্ষিত মৌজা ডেটাবেসে ধারাবাহিক মালিকানা চেইন ও বিক্রেতার ব্যালেন্স নিরীক্ষা।'
        : 'Cross-checks extracted plot and khatian numbers against historical registry records and seller remaining balance.',
      icon: GitCompare,
      sampleTag: '20,000+ RECORDS',
      specimen: isBn ? 'ধারাবাহিকতা: ৪টি হস্তান্তর' : 'Custody: 4 recorded transfers'
    },
    {
      id: 'report',
      number: '০৪',
      numberEn: '04',
      phase: 'VERDICT & PASSPORT',
      title: isBn ? 'ঝুঁকি অডিট প্রতিবেদন' : 'Risk Report & Passport',
      subtitle: isBn ? 'প্রমাণ সনদ প্রস্তুত' : 'Evidence report & certificate',
      desc: isBn
        ? 'দ্বৈত বিক্রয় ঝুঁকি বা স্বত্ব ফাঁক থাকলে তাত্ক্ষণিক সতর্কতা এবং নিরপেক্ষ ডিজিটাল প্লট পাসপোর্ট সনদ প্রস্তুত।'
        : 'Instantly generates an evidence-backed verification report highlighting duplicate sales and title integrity.',
      icon: FileCheck2,
      sampleTag: 'VERIFIED PASSPORT',
      specimen: isBn ? 'স্থিতি: নিরাপদ লেনদেন সনদ' : 'Status: Title Clear & Verified'
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
        {/* Section Header: Editorial & Connected to Map Concept */}
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
            <span>{isBn ? 'স্বচ্ছ যাচাই প্রক্রিয়া' : 'CADASTRAL VERIFICATION PIPELINE'}</span>
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
            {isBn ? 'দলিল থেকে ডিজিটাল সত্যতা: চার ধাপের যাচাই' : 'Land Verification Process'}
          </h2>

          <p style={{
            fontSize: '0.98rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.55,
            margin: 0
          }}>
            {isBn
              ? 'দলিল আপলোড থেকে শুরু করে এআই এক্সট্রাকশন এবং মৌজা রেকর্ডের সঙ্গে তুলনামূলক নিরীক্ষার স্বচ্ছ প্রবাহ।'
              : 'From raw deed document to optical extraction, historical cross-checks, and cryptographic verification report.'}
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
