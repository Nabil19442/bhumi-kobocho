import React from 'react';
import { 
  FileUp, 
  ScanText, 
  GitCompare, 
  FileCheck2, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

/**
 * WorkflowSection
 * 
 * 4-Step Land Verification Workflow:
 * 1. Upload a land deed
 * 2. Extract and review information
 * 3. Compare against available land records
 * 4. Generate a verification report
 * 
 * Horizontal timeline on desktop, vertical timeline on mobile.
 */
export default function WorkflowSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';

  const steps = [
    {
      number: '১',
      enNumber: '1',
      title: isBn ? 'দলিল আপলোড করুন' : 'Upload a Land Deed',
      desc: isBn
        ? 'বিক্রেতা বা আবেদনকারীর দলিলের স্ক্যান কপি (ছবি বা PDF) আপলোড করুন অথবা সংরক্ষিত ডেমো দলিল নির্বাচন করুন।'
        : 'Upload a scanned deed document (image or PDF) or choose a pre-loaded demonstration deed.',
      icon: FileUp,
      badge: isBn ? 'ধাপ ১' : 'Step 1'
    },
    {
      number: '২',
      enNumber: '2',
      title: isBn ? 'তথ্য শনাক্ত ও পর্যালোচনা' : 'Extract & Review Info',
      desc: isBn
        ? 'অপটিক্যাল এআই তাৎক্ষণিকভাবে বিক্রেতা, ক্রেতা, দাগ নং, খতিয়ান, মৌজা এবং জমির পরিমাণ স্বয়ংক্রিয়ভাবে শনাক্ত করে।'
        : 'Optical AI instantly extracts seller, buyer, plot (dag), khatian, mouza, and acreage into an editable review form.',
      icon: ScanText,
      badge: isBn ? 'ধাপ ২' : 'Step 2'
    },
    {
      number: '৩',
      enNumber: '3',
      title: isBn ? 'রেকর্ডের সঙ্গে তুলনা' : 'Compare Land Records',
      desc: isBn
        ? 'শনাক্তকৃত দাগ ও খতিয়ানের বিপরীতে সংরক্ষিত মৌজা ও পূর্ববর্তী লেনদেনের ডেটাবেসে ধারাবাহিক স্বত্ব ও মালিকানা যাচাই করা হয়।'
        : 'Cross-checks extracted plot and khatian numbers against available historical records in the cadastral registry.',
      icon: GitCompare,
      badge: isBn ? 'ধাপ ৩' : 'Step 3'
    },
    {
      number: '৪',
      enNumber: '4',
      title: isBn ? 'যাচাই প্রতিবেদন তৈরি' : 'Generate Verification Report',
      desc: isBn
        ? 'দ্বৈত বিক্রয় ঝুঁকি, সীমানা ওভারল্যাপ বা স্বত্ব ফাঁক থাকলে তাত্ক্ষণিক সতর্কতা এবং সার্বিক যাচাইকরণ অডিট প্রতিবেদন প্রস্তুত।'
        : 'Instantly generates an evidence-backed verification report highlighting duplicate sales, overlaps, and title integrity.',
      icon: FileCheck2,
      badge: isBn ? 'ধাপ ৪' : 'Step 4'
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="landing-section" 
      style={{
        padding: '72px 0',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--line)'
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
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 52px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-std)',
            background: 'var(--accent-tint)',
            border: '1px solid #C4D6F5',
            color: 'var(--primary-accent)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: '12px'
          }}>
            <CheckCircle2 size={14} />
            <span>{isBn ? 'সহজ চার ধাপের প্রক্রিয়া' : 'SIMPLE 4-STEP WORKFLOW'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'মাত্র চারটি ধাপে সম্পূর্ণ যাচাই' : 'How It Works in 4 Steps'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            margin: 0
          }}>
            {isBn
              ? 'দলিলের তথ্য স্ক্যান করে মৌজা রেকর্ডের সঙ্গে মেলানো এবং ঝুঁকি শনাক্ত করার স্বচ্ছ প্রক্রিয়া।'
              : 'A transparent workflow to scan deed details, verify against available records, and identify risks.'}
          </p>
        </div>

        {/* =========================================================================
            DESKTOP HORIZONTAL TIMELINE
           ========================================================================= */}
        <div className="workflow-desktop-timeline">
          {/* Horizontal Track Connector Line behind step circles */}
          <div 
            className="timeline-track-line"
            style={{
              position: 'relative',
              width: '100%',
              marginBottom: '28px'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '20px',
                left: '12.5%',
                right: '12.5%',
                height: '2.5px',
                background: 'var(--line)',
                zIndex: 1
              }} 
            />

            {/* 4 Step Indicator Nodes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              position: 'relative',
              zIndex: 2
            }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--white)',
                    border: '2.5px solid var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--primary-accent)',
                    boxShadow: '0 3px 8px rgba(39, 66, 160, 0.18)'
                  }}>
                    {isBn ? step.number : step.enNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Step Detail Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="workflow-step-card"
                  style={{
                    background: 'var(--white)',
                    borderRadius: '12px',
                    border: '1.5px solid var(--line)',
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(16, 39, 42, 0.04)',
                    transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--primary-accent)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(39, 66, 160, 0.09)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 39, 42, 0.04)';
                  }}
                >
                  <div>
                    {/* Top Row: Icon & Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px'
                    }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'var(--accent-tint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-accent)'
                      }}>
                        <Icon size={20} />
                      </div>

                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--primary-accent)',
                        background: 'var(--accent-tint)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {step.badge}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 style={{
                      fontSize: '1.08rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-heading)',
                      marginBottom: '8px',
                      lineHeight: 1.3
                    }}>
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p style={{
                      fontSize: '0.90rem',
                      color: 'var(--text-body)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.55,
                      margin: 0
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            MOBILE VERTICAL TIMELINE (< 768px)
           ========================================================================= */}
        <div className="workflow-mobile-timeline">
          <div style={{ position: 'relative', paddingLeft: '48px' }}>
            {/* Vertical Connector Line running down */}
            <div style={{
              position: 'absolute',
              top: '20px',
              bottom: '40px',
              left: '19px',
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
                    marginBottom: idx === steps.length - 1 ? '0' : '24px' 
                  }}
                >
                  {/* Step Number Circle positioned on vertical line */}
                  <div style={{
                    position: 'absolute',
                    left: '-48px',
                    top: '0',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--white)',
                    border: '2.5px solid var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--primary-accent)',
                    boxShadow: '0 2px 6px rgba(39, 66, 160, 0.15)',
                    zIndex: 2
                  }}>
                    {isBn ? step.number : step.enNumber}
                  </div>

                  {/* Step Card Content */}
                  <div style={{
                    background: 'var(--white)',
                    borderRadius: '12px',
                    border: '1.5px solid var(--line)',
                    padding: '18px',
                    boxShadow: '0 2px 6px rgba(16, 39, 42, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Icon size={18} color="var(--primary-accent)" />
                      <h3 style={{
                        fontSize: '1.04rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-heading)',
                        margin: 0
                      }}>
                        {step.title}
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-body)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                      margin: 0
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            type="button"
            id="how-it-works-start-btn"
            onClick={onStartScanning}
            className="btn-primary"
            style={{
              height: '48px',
              padding: '0 26px',
              fontSize: '0.98rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              background: 'var(--primary-accent)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: '0 3px 12px rgba(39, 66, 160, 0.28)',
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
            <span>{isBn ? 'দলিল যাচাই শুরু করুন' : 'Start Deed Verification'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .workflow-desktop-timeline {
          display: block;
        }
        .workflow-mobile-timeline {
          display: none;
        }

        @media (max-width: 768px) {
          .workflow-desktop-timeline {
            display: none !important;
          }
          .workflow-mobile-timeline {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
