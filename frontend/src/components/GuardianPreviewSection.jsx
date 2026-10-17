import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Info,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';

/**
 * GuardianPreviewSection
 * 
 * Land Guardian Section:
 * Explains Land Guardian with a concrete sample demo scenario:
 * - Previous owner: Abdul Karim
 * - Previous buyer: Sultana Jahan
 * - Dag No: 558
 * - Land Area: 10 decimals
 * 
 * Explains duplicate-sale detection when someone attempts to sell the same land again.
 * Clearly labeled as a demo scenario with explicit legal disclaimer.
 */
export default function GuardianPreviewSection({ lang = 'bn', onViewGuardian }) {
  const isBn = lang === 'bn';

  return (
    <section 
      id="guardian-preview" 
      className="landing-section" 
      style={{
        padding: '76px 0',
        background: 'var(--paper)',
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
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-std)',
            background: '#FDEEE9',
            border: '1px solid #F3BFB3',
            color: '#9A2C14',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: '12px'
          }}>
            <ShieldAlert size={14} color="#9A2C14" />
            <span>{isBn ? 'ল্যান্ড গার্ডিয়ান • দ্বৈত বিক্রয় শনাক্তকরণ' : 'LAND GUARDIAN • DUPLICATE SALE DETECTION'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '14px',
            letterSpacing: '-0.3px'
          }}>
            {isBn ? 'ল্যান্ড গার্ডিয়ান কীভাবে দ্বৈত বিক্রয় রোধ করে?' : 'How Land Guardian Detects Duplicate Sales'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            margin: 0
          }}>
            {isBn
              ? 'অতীতে বিক্রি হয়ে যাওয়া জমি পুনরায় অবৈধভাবে বিক্রির চেষ্টা করলে ল্যান্ড গার্ডিয়ান স্বয়ংক্রিয়ভাবে অডিট করে ক্রেতাকে সতর্ক করে।'
              : 'Automated chain-of-custody audit that alerts citizens and buyers if previously conveyed land is offered for resale.'}
          </p>
        </div>

        {/* Clear Mandatory Demo Disclaimer */}
        <div style={{
          maxWidth: '860px',
          margin: '0 auto 32px',
          background: '#FEF4F0',
          border: '1.5px solid #F3BFB3',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxSizing: 'border-box'
        }}>
          <Info size={18} style={{ color: '#9A2C14', flexShrink: 0 }} />
          <p style={{
            fontSize: '0.86rem',
            color: '#7E200C',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            margin: 0
          }}>
            <strong>{isBn ? 'ডেমো পরিস্থিতি সতর্কতা:' : 'DEMO SCENARIO NOTICE:'}</strong>{' '}
            {isBn
              ? 'নিচের উদাহরণটি সিস্টেমের অ্যালগরিদম প্রদর্শনের জন্য একটি পরীক্ষামূলক ডেমো পরিস্থিতি। এটি সকল সরকারি রেকর্ড অ্যাক্সেসের দাবি করে না এবং কোনো আইনি মালিকানার রায় প্রদান করে না।'
              : 'The scenario below is a demonstration model. The system does not claim to access all government registries or provide legal ownership title.'}
          </p>
        </div>

        {/* SAMPLE DEMO SCENARIO SHOWCASE: Abdul Karim -> Sultana Jahan (Dag 558, 10 Decimals) */}
        <div 
          className="guardian-scenario-container"
          style={{
            maxWidth: '920px',
            margin: '0 auto 40px',
            background: 'var(--white)',
            borderRadius: '16px',
            border: '1.5px solid var(--line)',
            boxShadow: '0 8px 28px rgba(16, 39, 42, 0.07)',
            overflow: 'hidden'
          }}
        >
          {/* Scenario Banner */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '16px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--primary-accent)" />
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {isBn ? 'নমুনা অডিট পরিস্থিতি: দাগ নং ৫৫৮ (১০ শতক)' : 'Audit Case: Dag No 558 (10 decimals)'}
              </span>
            </div>
            <span style={{
              background: '#10272A',
              color: '#FFFFFF',
              fontSize: '0.70rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              DEMO SCENARIO
            </span>
          </div>

          {/* 2-Step Comparison Columns: Past Sale vs Duplicate Attempt */}
          <div 
            className="guardian-scenario-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              divideX: '1px solid var(--line)'
            }}
          >
            {/* Step A: Legitimate Past Transfer */}
            <div 
              className="scenario-panel-past"
              style={{
                padding: '28px 24px',
                borderRight: '1px solid var(--line)',
                background: '#FAFCFA',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '4px',
                background: 'var(--status-matched-bg)',
                color: 'var(--status-matched-text)',
                fontSize: '0.76rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={13} />
                <span>{isBn ? 'ধাপ ১: সম্পন্নকৃত বৈধ মালিকানা হস্তান্তর' : 'Step 1: Prior Valid Conveyance'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'সাবেক বিক্রেতা (Seller):' : 'Previous Seller:'}</span>
                  <strong style={{ color: 'var(--text-main)' }}>আব্দুল করিম (Abdul Karim)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'বৈধ ক্রেতা (Buyer):' : 'Previous Buyer:'}</span>
                  <strong style={{ color: 'var(--primary-accent)' }}>সুলতানা জাহান (Sultana Jahan)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'দাগ নং (Dag No):' : 'Dag No:'}</span>
                  <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>৫৫৮ (558)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'হস্তান্তরিত জমি (Area):' : 'Transferred Area:'}</span>
                  <strong style={{ color: 'var(--text-main)' }}>১০ শতক (10 decimals)</strong>
                </div>
              </div>

              {/* Result Callout */}
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                fontSize: '0.84rem',
                color: 'var(--status-matched-text)',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
                  <UserCheck size={14} />
                  <span>{isBn ? 'বর্তমান বৈধ মালিক: সুলতানা জাহান' : 'Current Legal Owner: Sultana Jahan'}</span>
                </div>
                <p style={{ margin: 0 }}>
                  {isBn
                    ? 'আব্দুল করিম তাঁর মালিকানাধীন সম্পূর্ণ ১০ শতক জমি সুলতানা জাহানের কাছে হস্তান্তর করেছেন। তাঁর অবশিষ্ট ব্যালেন্স = ০ শতক।'
                    : 'Abdul Karim transferred all 10 decimals to Sultana Jahan. Remaining balance for seller = 0 decimals.'}
                </p>
              </div>
            </div>

            {/* Step B: Detected Duplicate Sale Attempt */}
            <div 
              className="scenario-panel-conflict"
              style={{
                padding: '28px 24px',
                background: '#FFFDFD',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '4px',
                background: '#FDEEE9',
                color: '#9A2C14',
                fontSize: '0.76rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                marginBottom: '16px'
              }}>
                <AlertTriangle size={13} color="#9A2C14" />
                <span>{isBn ? 'ধাপ ২: নতুন দ্বৈত বিক্রয়ের চেষ্টা শনাক্ত' : 'Step 2: Duplicate Sale Attempt'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'প্রস্তাবিত বিক্রেতা:' : 'Attempted Seller:'}</span>
                  <strong style={{ color: '#9A2C14' }}>আব্দুল করিম (পুনরায় বিক্রির চেষ্টা)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'নতুন ক্রেতা (New Buyer):' : 'Prospective Buyer:'}</span>
                  <strong style={{ color: 'var(--text-main)' }}>অন্য কোনো নাগরিক (Unaware Buyer)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'দাগ নং (Dag No):' : 'Dag No:'}</span>
                  <strong style={{ color: '#9A2C14', fontFamily: 'var(--font-mono)' }}>৫৫৮ (একই দাগ!)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.90rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'প্রস্তাবিত পরিমাণ:' : 'Attempted Acreage:'}</span>
                  <strong style={{ color: '#9A2C14' }}>১০ শতক (অতিরিক্ত বিক্রি)</strong>
                </div>
              </div>

              {/* Alert Callout */}
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#FDEEE9',
                border: '1px solid #F3BFB3',
                fontSize: '0.84rem',
                color: '#9A2C14',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '2px' }}>
                  <UserX size={14} color="#9A2C14" />
                  <span>{isBn ? 'ল্যান্ড গার্ডিয়ান সতর্কতা: দ্বৈত বিক্রয় ঝুঁকি!' : 'Land Guardian Alert: Duplicate Sale!'}</span>
                </div>
                <p style={{ margin: 0 }}>
                  {isBn
                    ? 'বিক্রেতা আব্দুল করিমের অবশিষ্ট ব্যালেন্স ০ শতক। সুলতানা জাহানের কাছে পূর্বেই বিক্রি হওয়ায় নতুন লেনদেনটি সরাসরি বিরোধপূর্ণ চিহ্নিত।'
                    : 'Karim has 0 decimals remaining. Because Sultana Jahan already holds title, this resale attempt is flagged immediately.'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Explanation Footer inside Scenario Card */}
          <div style={{
            padding: '18px 24px',
            background: 'var(--bg-paper)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--primary-accent)" />
              <span style={{ fontSize: '0.90rem', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
                {isBn 
                  ? 'লেনদেন সম্পন্ন করার আগেই নাগরিককে আর্থিক ক্ষতি ও প্রতারণা থেকে সুরক্ষা দেয়।'
                  : 'Protects prospective buyers from financial loss before money changes hands.'}
              </span>
            </div>

            <button
              type="button"
              id="guardian-demo-btn"
              onClick={onViewGuardian}
              className="btn-secondary"
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '0.86rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                background: 'var(--white)',
                color: 'var(--text-main)',
                border: '1.5px solid var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span>{isBn ? 'ল্যান্ড গার্ডিয়ান অডিট খুলুন' : 'Open Guardian Audit'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 Pillars Explaining the Mechanism */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          maxWidth: '920px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            padding: '18px 16px'
          }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              ১. পূর্ববর্তী হস্তান্তরের অডিট
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
              দাগ নম্বরের ঐতিহাসিক রেজিস্ট্রি পর্যালোচনা করে বিক্রেতার পূর্বের বিক্রয় তথ্য যাচাই করা হয়।
            </p>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            padding: '18px 16px'
          }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              ২. অবশিষ্ট জমির ব্যালেন্স ট্র্যাকিং
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
              বিক্রেতার মূল খতিয়ান হতে ইতিপূর্বে কতটুকু বিক্রি হয়েছে এবং কতটুকু বৈধ অবশিষ্ট রয়েছে তা স্বয়ংক্রিয়ভাবে হিসাব করা হয়।
            </p>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            padding: '18px 16px'
          }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              ৩. অখণ্ড প্রমাণ টাইমলাইন
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
              বিরোধ শনাক্ত হলে সুনির্দিষ্ট দলিল নম্বর ও তারিখ সম্বলিত ডিজিটাল প্রমাণ প্রতিবেদন প্রস্তুত হয়।
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .guardian-scenario-grid {
            grid-template-columns: 1fr !important;
          }
          .scenario-panel-past {
            border-right: none !important;
            border-bottom: 1px solid var(--line) !important;
          }
        }
      `}</style>
    </section>
  );
}
