import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowRightLeft,
  Clock, 
  ExternalLink,
  Info
} from 'lucide-react';

export default function GuardianPreviewSection({ lang = 'bn', onViewGuardian }) {
  const isBn = lang === 'bn';
  const [isReviewed, setIsReviewed] = useState(false);

  return (
    <section id="guardian-preview" className="landing-section" style={{
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
            <Bell size={14} />
            <span>{isBn ? 'ল্যান্ড গার্ডিয়ান' : 'LAND GUARDIAN'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'ল্যান্ড গার্ডিয়ান — সিমুলেটেড অ্যালার্ট' : 'Land Guardian — Simulated Alert'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'জমির খতিয়ানে কোনো পরিবর্তন বা জমা-খারিজ প্রস্তাব এলে নাগরিক কীভাবে সংকেত পাবেন তার বাস্তব প্রদর্শন।'
              : 'A simulated demonstration of how citizens receive alerts when a record modification or mutation partition is logged.'}
          </p>
        </div>

        {/* Mandatory Explicit Disclaimer Banner */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto 24px',
          background: '#FEF4F0',
          border: '1.5px solid #F3BFB3',
          borderRadius: 'var(--radius-std)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldAlert size={18} style={{ color: '#9A2C14', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#9A2C14',
            fontFamily: 'var(--font-heading)'
          }}>
            {isBn
              ? 'সিমুলেটেড ঘটনা — কোনো সরকারি সিস্টেম পর্যবেক্ষণ করা হচ্ছে না।'
              : 'SIMULATED EVENT — No live government system is being monitored.'}
          </span>
        </div>

        {/* Simulated Alert Card (Hard Shadow) */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-std)',
          border: '1.5px solid var(--text-main)',
          boxShadow: 'var(--shadow-hard)',
          maxWidth: '820px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          {/* Alert Top Bar */}
          <div style={{
            background: '#FFF4E5',
            borderBottom: '1px solid #FFE0B2',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#B45309',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase'
              }}>
                {isBn ? 'সিমুলেটেড ঘটনা' : 'SIMULATED'}
              </span>

              <strong style={{
                fontSize: '0.98rem',
                color: '#9A3412',
                fontFamily: 'var(--font-heading)'
              }}>
                {isBn ? 'নামজারি আবেদন শনাক্ত (কেস: MUT-2026-0427)' : 'Mutation Partition Detected (Case: MUT-2026-0427)'}
              </strong>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.78rem',
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              <Clock size={14} />
              <span>{isBn ? 'আজ, ১০:১৫ পূর্বাহ্ন' : 'Today, 10:15 AM'}</span>
            </div>
          </div>

          {/* Alert Body */}
          <div style={{ padding: '24px' }}>
            <p style={{
              fontSize: '0.96rem',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
              marginBottom: '20px'
            }}>
              {isBn
                ? 'সিমুলেটেড পর্যবেক্ষণ: আপনার সংরক্ষিত প্লট rec-demo-001 (দাগ ১০৫৮, খতিয়ান ৪১২)-এর বিপরীতে একটি নতুন জমা-খারিজ নামজারি আবেদন প্রক্রিয়াকরণ শুরু হয়েছে।'
                : 'Simulated observation: A new mutation application has been logged against your monitored plot rec-demo-001 (Dag 1058, Khatian 412).'}
            </p>

            {/* Old vs New Value Comparison Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '22px'
            }}>
              {/* Previous Value Card */}
              <div style={{
                background: '#F1F5F0',
                border: '1px solid #CBD8D2',
                borderRadius: 'var(--radius-std)',
                padding: '14px 16px'
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {isBn ? 'পূর্বের মান (Previous Value)' : 'PREVIOUS RECORD'}
                </span>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {isBn ? 'খতিয়ান: ৪১২' : 'Khatian: 412'}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-body)', marginTop: '2px' }}>
                  {isBn ? 'জমির পরিমাণ: ১৫.৫০ শতাংশ' : 'Land Area: 15.50 Decimal'}
                </div>
              </div>

              {/* Proposed New Value Card */}
              <div style={{
                background: '#FEF9EE',
                border: '1.5px solid #F59E0B',
                borderRadius: 'var(--radius-std)',
                padding: '14px 16px'
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#B45309',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 700
                }}>
                  {isBn ? 'প্রস্তাবিত নতুন মান (Proposed Value)' : 'PROPOSED NEW VALUE'}
                </span>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#B45309', fontFamily: 'var(--font-mono)' }}>
                  {isBn ? 'খতিয়ান: ৪১২/১' : 'Khatian: 412/1 (Partition)'}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#92400E', marginTop: '2px', fontWeight: 600 }}>
                  {isBn ? 'জমির পরিমাণ: ১০.০০ শতাংশ (-৫.৫০ শতক)' : 'Land Area: 10.00 Decimal (-5.50)'}
                </div>
              </div>
            </div>

            {/* Action Row: Review Toggle & Guardian Hub Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #E3EAE6'
            }}>
              {/* Review Toggle Action */}
              <button
                type="button"
                id="guardian-mark-reviewed-btn"
                onClick={() => setIsReviewed(!isReviewed)}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  border: isReviewed ? '1.5px solid #14633A' : '1.5px solid var(--text-main)',
                  background: isReviewed ? 'var(--status-matched-bg)' : '#FFFFFF',
                  color: isReviewed ? 'var(--status-matched-text)' : 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  minHeight: '44px',
                  transition: 'all 0.15s ease'
                }}
              >
                <CheckCircle2 size={16} />
                <span>
                  {isReviewed 
                    ? (isBn ? '✓ পর্যালোচিত হয়েছে (Reviewed)' : '✓ Reviewed')
                    : (isBn ? 'পর্যালোচিত হিসেবে চিহ্নিত করুন' : 'Mark as Reviewed')}
                </span>
              </button>

              {/* Open Guardian Page */}
              <button
                type="button"
                id="guardian-open-hub-btn"
                onClick={onViewGuardian}
                className="btn-primary"
                style={{
                  height: '42px',
                  padding: '0 20px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderRadius: 'var(--radius-std)',
                  boxShadow: 'var(--shadow-hard-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '44px'
                }}
              >
                <span>{isBn ? 'ল্যান্ড গার্ডিয়ান ফিড দেখুন →' : 'View Land Guardian Feed →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
