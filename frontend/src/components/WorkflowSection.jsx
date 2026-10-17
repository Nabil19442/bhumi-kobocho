import React from 'react';
import { FileUp, GitCompare, FileBadge, ArrowUpRight, HelpCircle, ShieldCheck } from 'lucide-react';

export default function WorkflowSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';

  const steps = [
    {
      stepNumber: isBn ? '১' : '1',
      title: isBn ? '১. বিক্রেতার দলিল আপলোড করুন' : "1. Upload Seller's Land Deed",
      desc: isBn
        ? 'বিক্রেতার দেওয়া দলিলের স্ক্যান কপি (PDF বা ছবি) আপলোড করুন অথবা সংরক্ষিত ডেমো নমুনা নির্বাচন করুন।'
        : "Upload a PDF or image of the seller's land deed, or select a realistic synthetic specimen.",
      icon: FileUp,
      badge: isBn ? 'আপলোড' : 'Step 1'
    },
    {
      stepNumber: isBn ? '২' : '2',
      title: isBn ? '২. তথ্য শনাক্ত ও পর্যালোচনা' : '2. AI Extracts Key Information',
      desc: isBn
        ? 'এআই অপটিক্যাল স্ক্যানার স্বয়ংক্রিয়ভাবে বিক্রেতা, ক্রেতা, দাগ, খতিয়ান, মৌজা ও জমির পরিমাণ শনাক্ত করে এবং সম্পাদনার সুযোগ দেয়।'
        : 'AI extracts seller, buyer, dag, khatian, mouza, deed number, and land area into an editable review form.',
      icon: HelpCircle,
      badge: isBn ? 'এআই এক্সট্র্যাক্ট' : 'Step 2'
    },
    {
      stepNumber: isBn ? '৩' : '3',
      title: isBn ? '৩. লেনদেনের ইতিহাস যাচাই' : '3. Compare With Transaction History',
      desc: isBn
        ? 'শনাক্তকৃত দাগ ও খতিয়ানের বিপরীতে সংরক্ষিত ২০,০০০+ লেনদেন রেকর্ডে পূর্ববর্তী সকল হস্তান্তরের তথ্য অনুসন্ধান করা হয়।'
        : 'Cross-checks the extracted plot and deed numbers against available historical transactions in the synthetic registry.',
      icon: GitCompare,
      badge: isBn ? 'হিস্ট্রি তুলনা' : 'Step 3'
    },
    {
      stepNumber: isBn ? '৪' : '4',
      title: isBn ? '৪. বিরোধ ও ফলাফল পর্যালোচনা' : '4. Review Conflicts & Results',
      desc: isBn
        ? 'দ্বৈত বিক্রয়, অবশিষ্ট জমির সীমার অতিরিক্ত বিক্রি বা দলিলের ফাঁক থাকলে তাৎক্ষণিক সতর্কতা ও প্লট পাসপোর্ট দেখুন।'
        : 'Inspect duplicate sales, overlapping conveyed areas, missing chain links, and dynamic Plot Passport with QR.',
      icon: FileBadge,
      badge: isBn ? 'যাচাই রিপোর্ট' : 'Step 4'
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
