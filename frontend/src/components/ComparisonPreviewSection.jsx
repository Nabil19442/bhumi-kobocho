import React from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Info, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ComparisonPreviewSection({ lang = 'bn', onStartCompare }) {
  const isBn = lang === 'bn';

  const rows = [
    {
      field: isBn ? 'দাগ নম্বর (Dag No)' : 'Dag Number',
      deedVal: '৪২৭',
      refVal: '৪২৭',
      status: 'matched',
      statusText: isBn ? 'মিলেছে (Matched)' : 'Matched',
      icon: CheckCircle2,
      note: isBn ? 'মৌজা নকশার দাগের সাথে পুরোপুরি মিলেছে।' : 'Exact match with mouza survey sheet.'
    },
    {
      field: isBn ? 'খতিয়ান নম্বর (Khatian No)' : 'Khatian Number',
      deedVal: '১২৮',
      refVal: '১২৮',
      status: 'matched',
      statusText: isBn ? 'মিলেছে (Matched)' : 'Matched',
      icon: CheckCircle2,
      note: isBn ? 'রেকর্ডকৃত খতিয়ান নম্বরে কোনো পার্থক্য নেই।' : 'Exact match with baseline record.'
    },
    {
      field: isBn ? 'জমির পরিমাণ (Land Area)' : 'Land Area',
      deedVal: isBn ? '৩৩.০০ শতাংশ' : '33.00 Decimal',
      refVal: isBn ? '৩১.০০ শতাংশ' : '31.00 Decimal',
      status: 'mismatch',
      statusText: isBn ? 'অমিল (Mismatch)' : 'Mismatch',
      icon: XCircle,
      note: isBn ? 'পার্থক্য ২.০০ শতাংশ (সহনশীলতার বাইরে)। এলাকা যাচাই প্রয়োজন।' : 'Difference of 2.00 decimal exceeds 0.5 decimal tolerance.'
    },
    {
      field: isBn ? 'মালিকের নাম (Owner Name)' : 'Owner Name',
      deedVal: isBn ? 'মোঃ রফিকুল ইসলাম' : 'Md. Rafiqul Islam',
      refVal: isBn ? 'মোহাম্মদ রফিকুল ইসলাম' : 'Mohammad Rafiqul Islam',
      status: 'needs_review',
      statusText: isBn ? 'আরও যাচাই দরকার (Needs review)' : 'Needs review',
      icon: AlertTriangle,
      note: isBn ? 'নামের সংক্ষিপ্তরূপ বনাম পূর্ণরূপের পার্থক্য। এনআইডি যাচাই করুন।' : 'Abbreviation vs full spelling variance detected.'
    },
    {
      field: isBn ? 'আদালতের স্থিতি (Court Order)' : 'Court Status',
      deedVal: isBn ? 'দলিলে উল্লেখ নেই' : 'Not stated in deed',
      refVal: isBn ? 'রেকর্ডে অন্তর্ভুক্ত নয়' : 'Not in scope',
      status: 'not_checked',
      statusText: isBn ? 'যাচাই করা হয়নি (Not checked)' : 'Not checked',
      icon: HelpCircle,
      note: isBn ? 'দেওয়ানি মামলার তথ্য এই সিস্টেমের আওতাভুক্ত নয়।' : 'Civil court records not connected or audited.'
    }
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case 'matched':
        return {
          bg: 'var(--status-matched-bg)',
          text: 'var(--status-matched-text)',
          border: 'var(--status-matched-border)'
        };
      case 'mismatch':
        return {
          bg: 'var(--status-mismatch-bg)',
          text: 'var(--status-mismatch-text)',
          border: 'var(--status-mismatch-border)'
        };
      case 'needs_review':
        return {
          bg: 'var(--status-review-bg)',
          text: 'var(--status-review-text)',
          border: 'var(--status-review-border)'
        };
      case 'not_checked':
      default:
        return {
          bg: 'var(--status-notchecked-bg)',
          text: 'var(--status-notchecked-text)',
          border: 'var(--status-notchecked-border)'
        };
    }
  };

  return (
    <section id="record-comparison" className="landing-section" style={{
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
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px' }}>
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
            <GitCompare size={14} />
            <span>{isBn ? 'নিয়ম-ভিত্তিক তুলনা' : 'DETERMINISTIC COMPARISON'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'নমুনা রেকর্ড তুলনা নিরীক্ষা' : 'Sample Record Comparison Audit'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'দলিলের তথ্য বনাম মৌজা রেফারেন্স রেকর্ড — ৪টি সুনির্দিষ্ট স্ট্যাটাসের মাধ্যমে অসংগতি চিহ্নিতকরণ।'
              : 'Cross-examines extracted deed information against reference baseline using 4 deterministic validation states.'}
          </p>
        </div>

        {/* Comparison Table Container */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-std)',
          border: '1px solid #CAD7CF',
          boxShadow: 'var(--shadow-hard-sm)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          {/* Table Explanation Banner */}
          <div style={{
            padding: '14px 20px',
            background: '#FAFBF9',
            borderBottom: '1px solid #CAD7CF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-main)'
              }}>
                {isBn ? 'নমুনা প্লট: দাগ ৪২৭ • খতিয়ান ১২৮' : 'Specimen Plot: Dag 427 • Khatian 128'}
              </span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              <Info size={14} />
              <span>{isBn ? 'সহনশীলতা: ±০.৫ শতক' : 'Tolerance: ±0.5 Decimal'}</span>
            </div>
          </div>

          {/* Horizontally Scrollable Table on Mobile */}
          <div className="table-responsive-wrapper" style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: '640px'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--ground)',
                  borderBottom: '2px solid #CBD8D2',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-main)',
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '12px 18px', width: '22%' }}>{isBn ? 'ফিল্ড' : 'Field'}</th>
                  <th style={{ padding: '12px 18px', width: '22%' }}>{isBn ? 'দলিলের মান' : 'Deed Extracted'}</th>
                  <th style={{ padding: '12px 18px', width: '22%' }}>{isBn ? 'রেফারেন্স রেকর্ড' : 'Reference Record'}</th>
                  <th style={{ padding: '12px 18px', width: '18%' }}>{isBn ? 'ফলাফল' : 'Status'}</th>
                  <th style={{ padding: '12px 18px', width: '16%' }}>{isBn ? 'পর্যবেক্ষণ' : 'Observation'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const Icon = row.icon;
                  const stStyle = getStatusStyles(row.status);
                  const isAlt = idx % 2 === 1;

                  return (
                    <tr
                      key={idx}
                      style={{
                        background: isAlt ? '#FAFCF9' : '#FFFFFF',
                        borderBottom: '1px solid #E3EAE6',
                        fontSize: '0.9rem'
                      }}
                    >
                      {/* Field */}
                      <td style={{
                        padding: '14px 18px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {row.field}
                      </td>

                      {/* Deed Value */}
                      <td style={{
                        padding: '14px 18px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}>
                        {row.deedVal}
                      </td>

                      {/* Reference Record */}
                      <td style={{
                        padding: '14px 18px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-body)'
                      }}>
                        {row.refVal}
                      </td>

                      {/* Status Chip */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          background: stStyle.bg,
                          border: `1px solid ${stStyle.border}`,
                          color: stStyle.text,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap'
                        }}>
                          <Icon size={14} style={{ flexShrink: 0 }} />
                          <span>{row.statusText}</span>
                        </span>
                      </td>

                      {/* Observation */}
                      <td style={{
                        padding: '14px 18px',
                        fontSize: '0.82rem',
                        color: 'var(--text-body)',
                        fontFamily: 'var(--font-body)',
                        lineHeight: 1.45
                      }}>
                        {row.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vital Rule Explanation Note (Differences are review flags, not proof of fraud) */}
        <div style={{
          background: '#FFF9E6',
          border: '1px solid #F5E29E',
          borderRadius: 'var(--radius-std)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          marginBottom: '28px'
        }}>
          <Info size={18} style={{ color: '#8F6B00', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: '#664D00', lineHeight: 1.55 }}>
            <strong>{isBn ? 'গুরুত্বপূর্ণ আইনি সতর্কতা:' : 'Important Safety Note:'} </strong>
            {isBn
              ? 'তথ্যের পার্থক্য বা অসংগতি চিহ্নিত করার অর্থ এই নয় যে দলিলে জালিয়াতি হয়েছে। এটি শুধুমাত্র সাধারণ নাগরিকের জন্য একটি সংকেত, যেন জমি কেনার পূর্বে সংশ্লিষ্ট সহকারী কমিশনার (ভূমি) অফিসে গিয়ে কাগজগুলো আনুষ্ঠানিকভাবে মিলিয়ে নেওয়া যায়।'
              : 'Identified discrepancies are not evidence of fraud or judicial verdicts. They serve as deterministic signals to alert citizens to inspect official physical volumes before transacting.'}
          </div>
        </div>

        {/* CTA to launch Compare Tool */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            id="compare-preview-launch-btn"
            onClick={onStartCompare}
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
            <span>{isBn ? 'অসঙ্গতি নিরীক্ষা টুল চালু করুন →' : 'Launch Mismatch Detector →'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
