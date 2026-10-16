import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ScopeSection({ lang = 'bn', onStartScanning }) {
  const isBn = lang === 'bn';

  const doesCheckList = [
    {
      title: isBn ? 'তথ্য তুলনা ও সামঞ্জস্য পরীক্ষা' : 'Record Cross-Comparison',
      desc: isBn
        ? 'ব্যবহারকারীর প্রদত্ত দলিলের তথ্যের সাথে সংরক্ষিত রেফারেন্স রেকর্ডের সুনির্দিষ্ট তুলনা।'
        : 'Comparing supplied deed parameters against recorded baseline datasets.'
    },
    {
      title: isBn ? 'অসংগতি ও ক্ষেত্রফল পার্থক্য চিহ্নিতকরণ' : 'Area Tolerance & Difference Flags',
      desc: isBn
        ? 'গাণিতিক ক্ষেত্রফলের পার্থক্য (সহনশীলতার অতিরিক্ত) ও নামের বানানের অমিল চিহ্নিত করা।'
        : 'Detecting acreage deviations exceeding mathematical tolerance and spelling variants.'
    },
    {
      title: isBn ? 'শনাক্তকৃত দলিলের ফিল্ড পর্যালোচনা' : 'Extracted Field Review',
      desc: isBn
        ? 'অপটিক্যাল শনাক্তকরণের কনফিডেন্স স্কোর অনুযায়ী ফিল্ডগুলো সম্পাদনা ও পর্যালোচনার সুযোগ।'
        : 'Allowing citizens to review and correct candidate fields with optical confidence tags.'
    },
    {
      title: isBn ? 'ক্রিপ্টোগ্রাফিক ফাইল সত্যতা (SHA-256)' : 'Cryptographic Byte Integrity',
      desc: isBn
        ? 'ডিজিটাল দলিলের প্রতিটি বাইট অপরিবর্তিত রয়েছে কি না তা হ্যাশের মাধ্যমে যাচাই।'
        : 'Verifying whether the digital file has remained byte-level intact or altered.'
    }
  ];

  const doesNotCheckList = [
    {
      title: isBn ? 'চূড়ান্ত আইনি মালিকানা' : 'Statutory Legal Ownership',
      desc: isBn
        ? 'এই সিস্টেম কোনো আদালত নয় এবং এটি কোনো মালিকানার আইনি সনদ বা রায় প্রদান করে না।'
        : 'The software does not certify title, legal ownership, or judicial confirmation.'
    },
    {
      title: isBn ? 'সরকারি নথির মূল ভৌত সত্যতা' : 'Physical Deed Authenticity',
      desc: isBn
        ? 'কাগজের স্ট্যাম্প, সিল বা স্বাক্ষরের ফিজিক্যাল সত্যতা সরকারি সাব-রেজিস্ট্রার কর্তৃক যাচাইযোগ্য।'
        : 'Physical stamp authenticity and wet ink signatures must be verified at the Sub-Registry.'
    },
    {
      title: isBn ? 'আদালতের মামলা বা ব্যাংকের বন্ধক' : 'Court Litigation & Mortgages',
      desc: isBn
        ? 'দেওয়ানি আদালতের স্থগিতাদেশ বা কোনো ব্যাংক ঋণের দায়বদ্ধতা এই ডেমোতে যাচাই হয় না।'
        : 'Civil court stays, title suits, or bank mortgages/liens are not tracked.'
    },
    {
      title: isBn ? 'সরকারি ডাটাবেজের লাইভ সংযোগ' : 'Live Government Database Sync',
      desc: isBn
        ? 'কোনো সরকারি ওয়েবসাইটে লাইভ স্ক্র্যাপিং বা অননুমোদিত সংযোগ করা হয় না; সকল ডেটা ডেমো।'
        : 'No live government databases are polled; all records are synthetic hackathon test cases.'
    }
  ];

  return (
    <section id="audit-scope" className="landing-section" style={{
      padding: '72px 0',
      background: 'var(--paper)',
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
            <span>{isBn ? 'সিস্টেমের পরিধি' : 'SCOPE & BOUNDARIES'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'কী যাচাই হয়, কী হয় না' : 'What the App Does and Does Not Check'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'নাগরিক সুরক্ষার স্বার্থে ভূমি কবচ ব্যবস্থার প্রকৃত সক্ষমতা ও আইনি সীমাবদ্ধতার স্পষ্ট ও স্বচ্ছ বিবরণ।'
              : 'A transparent statement of system capabilities and deliberate boundaries to protect citizens.'}
          </p>
        </div>

        {/* 2 Accessible Columns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Column A: What It Checks */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1.5px solid #B7DFCA',
            boxShadow: 'var(--shadow-hard-sm)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '18px',
              borderBottom: '1px solid #B7DFCA',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'var(--status-matched-bg)',
                color: 'var(--status-matched-text)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <CheckCircle2 size={20} />
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--status-matched-text)',
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                {isBn ? 'যা এই ডেমো সিস্টেম যাচাই করতে পারে' : 'What This Demo System Demonstrates'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
              {doesCheckList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} style={{ color: '#1B5E20', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '2px' }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.5, display: 'block' }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column B: What It Does NOT Check */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1.5px solid #F3BFB3',
            boxShadow: 'var(--shadow-hard-sm)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '18px',
              borderBottom: '1px solid #F3BFB3',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'var(--status-mismatch-bg)',
                color: 'var(--status-mismatch-text)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <XCircle size={20} />
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--status-mismatch-text)',
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                {isBn ? 'যা এই সিস্টেম যাচাই করে না (আইনি সীমাবদ্ধতা)' : 'What This System Does NOT Check'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
              {doesNotCheckList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <XCircle size={18} style={{ color: '#9A2C14', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '2px' }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.5, display: 'block' }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
