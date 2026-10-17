import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Info,
  ShieldCheck,
  UserCheck,
  UserX,
  FileSpreadsheet,
  FileSearch,
  Scale,
  Compass
} from 'lucide-react';

/**
 * GuardianPreviewSection: Ownership-Conflict Investigation Panel
 * 
 * DESIGN CONCEPT: Investigation Dashboard Preview
 * - One parcel: Dag 558 (Savar Mouza, 10.0 decimals)
 * - Two conflicting ownership claims:
 *   - Claim 1 (Valid): Prior registered sale to Sultana Jahan (Deed #8834)
 *   - Claim 2 (Conflict): Duplicate resale attempt by seller with 0 balance
 * - Visible warning indicator & conflict diagnostics
 * - Clear explanation of what needs further verification
 * - Prominent demo scenario notice
 */
export default function GuardianPreviewSection({ lang = 'bn', onViewGuardian }) {
  const isBn = lang === 'bn';
  const [selectedDocket, setSelectedDocket] = useState('comparison'); // 'comparison' | 'rule'

  return (
    <section 
      id="guardian-preview" 
      className="guardian-investigation-section" 
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
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-std)',
            background: '#FDEEE9',
            border: '1px solid #F3BFB3',
            color: '#9A2C14',
            fontSize: '0.74rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            marginBottom: '10px',
            letterSpacing: '0.6px'
          }}>
            <ShieldAlert size={13} color="#9A2C14" />
            <span>{isBn ? 'ল্যান্ড গার্ডিয়ান • বিরোধ তদন্ত প্যানেল' : 'LAND GUARDIAN • CONFLICT INVESTIGATION'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.0vw, 2.4rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '8px',
            letterSpacing: '-0.3px'
          }}>
            {isBn ? 'স্বয়ংক্রিয় মালিকানা বিরোধ তদন্ত ড্যাশবোর্ড' : 'Ownership-Conflict Investigation Panel'}
          </h2>

          <p style={{
            fontSize: '0.96rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.55,
            margin: 0
          }}>
            {isBn
              ? 'অতীতে বিক্রি হয়ে যাওয়া জমি পুনরায় বিক্রির অপচেষ্টা হলে ল্যান্ড গার্ডিয়ান সুনির্দিষ্ট প্রমাণ সহ বিরোধ শনাক্ত করে।'
              : 'Digital investigation console alerting citizens and legal officers before fraudulent duplicate conveyances occur.'}
          </p>
        </div>

        {/* Demo Specimen Mandatory Notice */}
        <div style={{
          maxWidth: '920px',
          margin: '0 auto 18px',
          background: '#FEF4F0',
          border: '1px solid #F3BFB3',
          borderRadius: '8px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxSizing: 'border-box'
        }}>
          <Info size={15} style={{ color: '#9A2C14', flexShrink: 0 }} />
          <p style={{
            fontSize: '0.78rem',
            color: '#7E200C',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.45,
            margin: 0
          }}>
            <strong>{isBn ? 'ডেমো তদন্ত কেস স্টাডি:' : 'DEMO INVESTIGATION CASE:'}</strong>{' '}
            {isBn
              ? 'নিচের উদাহরণটি সিস্টেমের বিরোধ শনাক্তকরণ অ্যালগরিদম প্রদর্শনের জন্য একটি পরীক্ষামূলক ডেমো দৃশ্যপট। এটি কোনো আদালতের আইনি রায় নয়।'
              : 'The case below is a demonstration specimen illustrating algorithmic conflict detection against historical ledgers. Not an official court ruling.'}
          </p>
        </div>

        {/* =========================================================================
            INVESTIGATION DASHBOARD PANEL CARD
           ========================================================================= */}
        <div 
          className="investigation-dashboard-card"
          style={{
            maxWidth: '960px',
            margin: '0 auto 24px',
            background: 'var(--white)',
            borderRadius: '14px',
            border: '1.5px solid var(--line)',
            boxShadow: '0 8px 24px rgba(16, 39, 42, 0.06)',
            overflow: 'hidden'
          }}
        >
          {/* Top Docket Meta Bar */}
          <div style={{
            background: 'var(--bg-paper)',
            padding: '12px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSearch size={16} color="var(--primary-accent)" />
              <strong style={{ color: 'var(--text-main)', letterSpacing: '0.3px' }}>
                CASE FILE #INV-2026-DAG558
              </strong>
              <span style={{ color: 'var(--line)' }}>•</span>
              <span style={{ color: 'var(--text-muted)' }}>সাভার মৌজা • দাগ ৫৫৮ (১০.০ শতক)</span>
            </div>

            {/* Warning Indicator Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '4px',
              background: '#FDEEE9',
              border: '1px solid #F3BFB3',
              color: '#9A2C14',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              <AlertTriangle size={13} color="#9A2C14" />
              <span>DUPLICATE CONVEYANCE FLAGGED</span>
            </div>
          </div>

          {/* Two-Column Conflicting Claims Docket */}
          <div 
            className="claims-docket-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#FFFFFF'
            }}
          >
            {/* CLAIM 1 (Recorded Prior Conveyance) */}
            <div 
              style={{
                padding: '20px',
                borderRight: '1px solid var(--line)',
                background: '#FAFCFA',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--status-matched-bg)',
                  border: '1px solid var(--status-matched-border)',
                  color: 'var(--status-matched-text)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)'
                }}>
                  <CheckCircle2 size={12} />
                  <span>CLAIM 01: RECORDED VALID TITLE</span>
                </span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  DEED #8834 / 2021
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>সাবেক বিক্রেতা (Grantor):</span>
                  <strong style={{ color: 'var(--text-main)' }}>আব্দুল করিম (Abdul Karim)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>বৈধ ক্রেতা (Grantee):</span>
                  <strong style={{ color: 'var(--primary-accent)' }}>সুলতানা জাহান (Sultana Jahan)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>হস্তান্তরিত জমি (Quantum):</span>
                  <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>১০.০ শতক (100% Sold)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>বিক্রেতার অবশিষ্ট ব্যালেন্স:</span>
                  <strong style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>০.০ শতক (Nil)</strong>
                </div>
              </div>

              {/* Status Outcome */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                fontSize: '0.78rem',
                color: 'var(--status-matched-text)',
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                  <UserCheck size={13} />
                  <span>বর্তমান আইনসঙ্গত মালিক: সুলতানা জাহান</span>
                </div>
                <p style={{ margin: 0 }}>
                  দলিল নং ৮৮৩৪ মূলে ১০ শতক জমি হস্তান্তর সম্পন্ন হওয়ায় আব্দুল করিমের আর কোনো স্বত্ব অবশিষ্ট নেই।
                </p>
              </div>
            </div>

            {/* CLAIM 2 (Flagged Duplicate Resale Attempt) */}
            <div 
              style={{
                padding: '20px',
                background: '#FFFDFD',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#FDEEE9',
                  border: '1px solid #F3BFB3',
                  color: '#9A2C14',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)'
                }}>
                  <AlertTriangle size={12} color="#9A2C14" />
                  <span>CLAIM 02: FLAGGED ATTEMPTED RESALE</span>
                </span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#9A2C14', fontWeight: 700 }}>
                  HIGH CONFLICT RISK
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>প্রস্তাবিত বিক্রেতা:</span>
                  <strong style={{ color: '#9A2C14' }}>আব্দুল করিম (পুনরায় বিক্রির চেষ্টা)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>প্রস্তাবিত ক্রেতা:</span>
                  <strong style={{ color: 'var(--text-main)' }}>অন্য কোনো নাগরিক (Unaware Buyer)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>দাগ নং (Target Dag):</span>
                  <strong style={{ color: '#9A2C14', fontFamily: 'var(--font-mono)' }}>৫৫৮ (একই দাগ!)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>প্রস্তাবিত জমি:</span>
                  <strong style={{ color: '#9A2C14', fontFamily: 'var(--font-mono)' }}>১০.০ শতক (অতিরিক্ত বিক্রি)</strong>
                </div>
              </div>

              {/* Status Outcome */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#FDEEE9',
                border: '1px solid #F3BFB3',
                fontSize: '0.78rem',
                color: '#9A2C14',
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                  <UserX size={13} color="#9A2C14" />
                  <span>সতর্কতা: বিক্রেতার ব্যালেন্স শূন্য</span>
                </div>
                <p style={{ margin: 0 }}>
                  পূর্বেই বিক্রি হয়ে যাওয়ায় এই দাগের নতুন যে কোনো লেনদেন সরাসরি দ্বৈত বিক্রয় ও প্রতারণা হিসেবে চিহ্নিত।
                </p>
              </div>
            </div>
          </div>

          {/* Investigation Findings & Further Verification Diagnosis */}
          <div style={{
            padding: '14px 20px',
            background: 'var(--bg-paper)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ maxWidth: '620px' }}>
              <span style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--primary-accent)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '2px'
              }}>
                AUDIT DIAGNOSIS & FURTHER VERIFICATION NEEDED:
              </span>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-body)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.45,
                margin: 0
              }}>
                বিক্রেতার আরএস খতিয়ান ও পূর্ববর্তী কবলা ৮৮৩৪ এর সত্যতা যাচাই সাপেক্ষে লেনদেনটি সরাসরি স্থগিত রাখার সুপারিশ করা হচ্ছে।
              </p>
            </div>

            <button
              type="button"
              id="open-guardian-console-btn"
              onClick={onViewGuardian}
              className="btn-secondary"
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                background: 'var(--white)',
                color: 'var(--text-main)',
                border: '1.5px solid var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <span>{isBn ? 'ল্যান্ড গার্ডিয়ান অডিট কনসোল খুলুন' : 'Open Guardian Console'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 Pillars Explaining the Investigation Engine */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          maxWidth: '960px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            padding: '12px 14px'
          }}>
            <h4 style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
              ১. বালাম বই ও হস্তান্তরের অডিট
            </h4>
            <p style={{ fontSize: '0.80rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.45 }}>
              দাগের ঐতিহাসিক রেকর্ড স্ক্যান করে অতীতে জমি বিক্রয় হয়ে থাকলে তা তাৎক্ষণিকভাবে চিহ্নিত করে।
            </p>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            padding: '12px 14px'
          }}>
            <h4 style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
              ২. অবশিষ্ট ব্যালেন্স ট্র্যাকিং
            </h4>
            <p style={{ fontSize: '0.80rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.45 }}>
              খতিয়ানের মোট পরিমাণ থেকে বিক্রিত পরিমাণ বিয়োগ করে বিক্রেতার প্রকৃত অবশিষ্ট হিসাব রাখে।
            </p>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            padding: '12px 14px'
          }}>
            <h4 style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
              ৩. অখণ্ড ডিজিটাল প্রমাণ
            </h4>
            <p style={{ fontSize: '0.80rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.45 }}>
              দলিল নম্বর ও তারিখ সহ নিরীক্ষা রিপোর্ট প্রস্তুত করে আর্থিক ক্ষতি ও মামলা মোকদ্দমা রোধ করে।
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .claims-docket-grid {
            grid-template-columns: 1fr !important;
          }
          .claims-docket-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--line) !important;
          }
        }
      `}</style>
    </section>
  );
}
