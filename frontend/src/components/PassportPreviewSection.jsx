import React from 'react';
import { 
  FileBadge, 
  MapPin, 
  User, 
  Layers, 
  Calendar, 
  ShieldAlert, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Hash
} from 'lucide-react';

export default function PassportPreviewSection({ lang = 'bn', onViewPassport }) {
  const isBn = lang === 'bn';

  return (
    <section id="passport-preview" className="landing-section" style={{
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
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 44px' }}>
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
            <FileBadge size={14} />
            <span>{isBn ? 'প্লট পাসপোর্ট' : 'PLOT PASSPORT'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'নাগরিক প্লট পাসপোর্ট প্রিভিউ' : 'Citizen Plot Passport Preview'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'একটি নির্দিষ্ট প্লটের খতিয়ান ধারাবাহিকতা, অনুমোদিত ক্ষেত্রফল, যাচাই ফলাফল ও পরবর্তী করণীয় একনজরে।'
              : 'A consolidated, transparent identity summary for a specific land parcel showing ownership trail, area facts, and audit guidance.'}
          </p>
        </div>

        {/* Passport Preview Card (Tactile hard shadow) */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-std)',
          border: '1.5px solid var(--text-main)',
          boxShadow: 'var(--shadow-hard)',
          maxWidth: '920px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          {/* Card Top Title Banner */}
          <div style={{
            background: 'var(--dark-band)',
            color: 'var(--white)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--primary-accent)',
                padding: '6px',
                borderRadius: '6px',
                color: '#fff',
                display: 'flex'
              }}>
                <FileBadge size={20} />
              </div>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.8px',
                  color: '#CAD7CF',
                  textTransform: 'uppercase',
                  display: 'block'
                }}>
                  {isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ নমুনা রেকর্ড' : 'PEOPLE’S REPUBLIC OF BANGLADESH DEMO SPECIMEN'}
                </span>
                <strong style={{
                  fontSize: '1.18rem',
                  fontFamily: 'var(--font-heading)',
                  color: '#FFFFFF'
                }}>
                  {isBn ? 'নাগরিক প্লট পাসপোর্ট — দাগ ১০৫৮' : 'Citizen Plot Passport — Dag 1058'}
                </strong>
              </div>
            </div>

            {/* Demo Watermark / Badge */}
            <div style={{
              background: '#9A2C14',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              {isBn ? 'ডেমো ডেটা • আইনি সিদ্ধান্ত নয়' : 'DEMO DATA • NOT LEGAL VERDICT'}
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px 28px' }}>
            {/* Top Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid #CAD7CF'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>
                  {isBn ? 'প্লট রেফারেন্স আইডি' : 'Plot Reference ID'}
                </span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                  rec-demo-001
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>
                  {isBn ? 'মালিকের নাম' : 'Recorded Owner'}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  {isBn ? 'মোঃ রফিকুল ইসলাম' : 'Md. Rafiqul Islam'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>
                  {isBn ? 'খতিয়ান ও দাগ নম্বর' : 'Khatian & Dag'}
                </span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                  {isBn ? 'খতিয়ান ৪১২ • দাগ ১০৫৮' : 'Khatian 412 • Dag 1058'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>
                  {isBn ? 'রেকর্ডকৃত জমির পরিমাণ' : 'Recorded Area'}
                </span>
                <span style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                  {isBn ? '১৫.৫০ শতাংশ' : '15.50 Decimal'}
                </span>
              </div>
            </div>

            {/* Status Chips Row */}
            <div style={{
              margin: '20px 0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginRight: '4px' }}>
                {isBn ? 'যাচাই সূচকসমূহ:' : 'Verification Flags:'}
              </span>

              {/* Matched Chip */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '16px',
                background: 'var(--status-matched-bg)',
                border: '1px solid var(--status-matched-border)',
                color: 'var(--status-matched-text)',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                <CheckCircle2 size={14} />
                <span>{isBn ? 'দাগ ও খতিয়ান মিলেছে (Matched)' : 'Dag & Khatian Matched'}</span>
              </span>

              {/* Needs Review Chip */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '16px',
                background: 'var(--status-review-bg)',
                border: '1px solid var(--status-review-border)',
                color: 'var(--status-review-text)',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                <AlertTriangle size={14} />
                <span>{isBn ? 'নামের বানান আরও যাচাই দরকার (Needs review)' : 'Name Spelling Needs Review'}</span>
              </span>
            </div>

            {/* Timeline Row */}
            <div style={{
              background: '#F8FAF8',
              borderRadius: 'var(--radius-std)',
              border: '1px solid #CAD7CF',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Calendar size={16} color="var(--primary-accent)" />
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-main)'
                }}>
                  {isBn ? 'মালিকানা ও রেকর্ডের ধারাবাহিকতা (টাইমলাইন)' : 'Chain of Title & Mutation Timeline'}
                </span>
              </div>

              {/* 3 Step Timeline */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '0.84rem'
              }}>
                <div style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #E0E7E3' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block' }}>১৯৮৮ • জরিপ পরচা</span>
                  <strong style={{ color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>সিএস/এসএ খতিয়ান</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-body)' }}>মূল জোতদার রেকর্ড প্রস্তুত</span>
                </div>

                <div style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #E0E7E3' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block' }}>২০২১ • সাব-কবলা দলিল</span>
                  <strong style={{ color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>দলিল নং ১৪৮২/২০২১</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-body)' }}>১৫.৫০ শতক খরিদ হস্তান্তর</span>
                </div>

                <div style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #E0E7E3' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block' }}>২০২২ • নামজারি খতিয়ান</span>
                  <strong style={{ color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>কেস MUT-2022-9014</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-body)' }}>নামজারি ও জমা-খারিজ মঞ্জুর</span>
                </div>
              </div>
            </div>

            {/* Two Distinct Boxes: "কী যাচাই হয়নি" and "পরবর্তী পদক্ষেপ" */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {/* Box 1: What was NOT checked */}
              <div style={{
                background: '#FEF4F0',
                border: '1px solid #F3BFB3',
                borderRadius: 'var(--radius-std)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9A2C14', marginBottom: '8px' }}>
                  <ShieldAlert size={16} />
                  <strong style={{ fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
                    {isBn ? 'কী যাচাই হয়নি (সিস্টেমের সীমাবদ্ধতা)' : 'What Was NOT Checked'}
                  </strong>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '0.82rem',
                  lineHeight: 1.55,
                  color: '#70220F'
                }}>
                  <li>{isBn ? 'দেওয়ানি আদালতের কোনো নিষেধাজ্ঞা বা মামলার স্থিতি' : 'Civil court injunctions or pending litigation'}</li>
                  <li>{isBn ? 'ব্যাংক বা আর্থিক প্রতিষ্ঠানে দায় ও বন্ধক' : 'Mortgage or lien status with financial institutions'}</li>
                  <li>{isBn ? 'সরেজমিনে সীমানা ও দখল (ফিজিক্যাল দখল যাচাই হয়নি)' : 'On-ground physical possession or boundary pillars'}</li>
                </ul>
              </div>

              {/* Box 2: Recommended Next Steps */}
              <div style={{
                background: '#EBF3FB',
                border: '1px solid #C4D6F5',
                borderRadius: 'var(--radius-std)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-accent)', marginBottom: '8px' }}>
                  <Compass size={16} />
                  <strong style={{ fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
                    {isBn ? 'পরবর্তী পদক্ষেপ (সরকারি কার্যালয়ে করণীয়)' : 'Next Recommended Steps'}
                  </strong>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '0.82rem',
                  lineHeight: 1.55,
                  color: 'var(--text-main)'
                }}>
                  <li>{isBn ? 'উপজেলা সহকারী কমিশনার (ভূমি) অফিসে নামজারি বালাম পরীক্ষা' : 'Verify mutation bhasha register at Upazila AC Land office'}</li>
                  <li>{isBn ? 'সাব-রেজিস্ট্রি অফিসে মূল বালাম বহির ভলিউম নিশ্চিত করা' : 'Inspect original register volumes at Sub-Registry office'}</li>
                  <li>{isBn ? 'ইউনিয়ন ভূমি সহকারী কর্মকর্তার নিকট ভূমি উন্নয়ন করের দাখিলা নিরীক্ষা' : 'Confirm latest land development tax dakhila payment'}</li>
                </ul>
              </div>
            </div>

            {/* Passport View CTA */}
            <div style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid #CAD7CF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '0.82rem',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)'
              }}>
                {isBn ? 'সকল হিস্যা ও খতিয়ান নম্বর কৃত্রিম ডেমো ডেটা' : 'Synthetic demo data for evaluation purposes'}
              </span>

              <button
                type="button"
                id="passport-preview-open-btn"
                onClick={() => onViewPassport && onViewPassport('rec-demo-001')}
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
                <span>{isBn ? 'সম্পূর্ণ প্লট পাসপোর্ট খুলুন →' : 'Open Full Plot Passport →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
