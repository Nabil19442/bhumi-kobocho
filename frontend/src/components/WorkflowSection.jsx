import React from 'react';
import { FileUp, GitCompare, FileBadge, ArrowUpRight, HelpCircle, ShieldCheck } from 'lucide-react';

export default function WorkflowSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';

  const steps = [
    {
      stepNumber: isBn ? '১' : '1',
      title: isBn ? '১. দলিলের তথ্য দিন' : '1. Provide Document Details',
      desc: isBn
        ? 'দলিল আপলোড করুন বা সংরক্ষিত ডেমো নমুনা নির্বাচন করে প্রয়োজনীয় তথ্য সহজে সাজিয়ে নিন।'
        : 'Upload deed or pick a pre-loaded synthetic specimen to extract key land parameters.',
      icon: FileUp,
      badge: isBn ? 'ইনপুট' : 'Input'
    },
    {
      stepNumber: isBn ? '২' : '2',
      title: isBn ? '২. তথ্য মিলিয়ে দেখুন' : '2. Compare Records',
      desc: isBn
        ? 'মৌজা রেকর্ডের সাথে নাম, দাগ, খতিয়ান ও ক্ষেত্রফলের সামঞ্জস্য নিয়ম মেনে তুলনা করুন।'
        : 'Automatically cross-examine names, dag, khatian, and area tolerance against mouza records.',
      icon: GitCompare,
      badge: isBn ? 'নিয়ম নিরীক্ষা' : 'Audit'
    },
    {
      stepNumber: isBn ? '৩' : '3',
      title: isBn ? '৩. প্লট পাসপোর্ট বুঝুন' : '3. Review Plot Passport',
      desc: isBn
        ? 'জমির খতিয়ান ইতিহাস, ক্ষেত্রফলের বিবরণ ও ডিজিটাল অবিকৃত অবস্থার একক সারসংক্ষেপ কার্ড দেখুন।'
        : 'View a unified passport summary showing title history, verified acreage, and integrity.',
      icon: FileBadge,
      badge: isBn ? 'সারসংক্ষেপ' : 'Passport'
    },
    {
      stepNumber: isBn ? '৪' : '4',
      title: isBn ? '৪. প্রয়োজন হলে আরও যাচাই করুন' : '4. Verify Further If Needed',
      desc: isBn
        ? 'কোনো অসংগতি ধরা পড়লে সরকারি ভূমি অফিসে পরবর্তী যাচাইয়ের স্পষ্ট ও সুনির্দিষ্ট পরামর্শ পান।'
        : 'When discrepancies appear, receive clear official guidance for the AC Land or Sub-Registry office.',
      icon: HelpCircle,
      badge: isBn ? 'পরামর্শ' : 'Next Steps'
    }
  ];

  return (
    <section id="how-it-works" className="landing-section" style={{
      padding: '72px 0',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid #CAD7CF'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px' }}>
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
            <ShieldCheck size={14} />
            <span>{isBn ? 'সহজ প্রক্রিয়া' : 'SIMPLE WORKFLOW'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'মাত্র চারটি ধাপে বুঝুন' : 'Understand in Just Four Steps'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'দলিলের তথ্য সাজিয়ে মৌজা রেকর্ডের সঙ্গে মিল খোঁজা এবং জটিলতা থাকলে তা সহজে বোঝার ৪টি সহজ ধাপ।'
              : 'Four transparent steps to organize deed details, check mouza baseline records, and spot items requiring further verification.'}
          </p>
        </div>

        {/* 4-Step Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                  borderRadius: 'var(--radius-std)',
                  border: '1px solid #CAD7CF',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Top Row: Icon & Step Number */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: 'var(--accent-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-accent)'
                  }}>
                    <Icon size={22} />
                  </div>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--primary-accent)',
                    background: '#F1F5F0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #CBD8D2'
                  }}>
                    {step.stepNumber}
                  </span>
                </div>

                {/* Step Title */}
                <h3 style={{
                  fontSize: '1.18rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '10px',
                  lineHeight: 1.3
                }}>
                  {step.title}
                </h3>

                {/* Step Description */}
                <p style={{
                  fontSize: '0.94rem',
                  color: 'var(--text-body)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.55,
                  margin: 0,
                  flex: 1
                }}>
                  {step.desc}
                </p>

                {/* Step Bottom Badge */}
                <div style={{
                  marginTop: '18px',
                  paddingTop: '12px',
                  borderTop: '1px dashed #CBD8D2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    fontWeight: 600
                  }}>
                    {step.badge}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--primary-accent)',
                    fontWeight: 700
                  }}>
                    ধাপ {step.stepNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small Bottom Link */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            type="button"
            onClick={onStartScanning}
            className="btn-primary"
            style={{
              height: '46px',
              padding: '0 24px',
              fontSize: '0.96rem',
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
            <span>{isBn ? 'দলিলের তথ্য দিয়ে শুরু করুন →' : 'Start With Document Details →'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
