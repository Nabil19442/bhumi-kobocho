import React from 'react';
import { 
  ScanText, 
  ShieldCheck, 
  ShieldAlert, 
  History, 
  Network, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

/**
 * CoreFeaturesSection
 * 
 * Features of Bhumi Kobocho:
 * 1. AI-powered deed scanning and information extraction
 * 2. Land ownership verification
 * 3. Land Guardian and duplicate-sale detection
 * 4. Land transaction history
 * 5. Land record relationship graph
 */
export default function CoreFeaturesSection({
  lang = 'bn',
  onStartScanning,
  onViewHistory,
  onViewPassport,
  onViewGuardian
}) {
  const isBn = lang === 'bn';

  const features = [
    {
      id: 'scanner',
      title: isBn ? 'এআই দলিল স্ক্যানার ও তথ্য নিষ্কাশন' : 'AI-Powered Deed Scanning & Extraction',
      desc: isBn
        ? 'বাংলা ও ইংরেজি হস্তলিখিত বা মুদ্রিত দলিলের ছবি ও পিডিএফ থেকে বিক্রেতা, ক্রেতা, দাগ নং, খতিয়ান ও জমির পরিমাণ নিমেষেই নির্ভুলভাবে শনাক্ত ও সম্পাদনা।'
        : 'Extracts seller, buyer, dag number, khatian, mouza, and acreages from Bengali and English deed documents into verified, editable records.',
      icon: ScanText,
      badge: isBn ? 'অপটিক্যাল এআই' : 'AI Extraction',
      action: onStartScanning,
      btnText: isBn ? 'দলিল স্ক্যান করুন' : 'Scan a Deed'
    },
    {
      id: 'ownership',
      title: isBn ? 'জমির মালিকানা ও ধারাবাহিকতা যাচাই' : 'Land Ownership & Title Verification',
      desc: isBn
        ? 'মৌজা খতিয়ানের মূল রেকর্ডের সাথে বর্তমান দলিলের ধারাবাহিক চেইন যাচাই করে জমির প্রকৃত মালিকানা ও স্বত্বের নির্ভুল সামঞ্জস্য নিরীক্ষা।'
        : 'Verifies ownership consistency against mouza baseline surveys, validating the true chain of title and legal ownership claims.',
      icon: ShieldCheck,
      badge: isBn ? 'স্বত্ব যাচাই' : 'Title Verification',
      action: onViewPassport || onStartScanning,
      btnText: isBn ? 'মালিকানা যাচাই' : 'Verify Ownership'
    },
    {
      id: 'guardian',
      title: isBn ? 'ল্যান্ড গার্ডিয়ান ও দ্বৈত বিক্রয় শনাক্তকরণ' : 'Land Guardian & Duplicate-Sale Detection',
      desc: isBn
        ? 'একই জমি পূর্বে হস্তান্তর করে থাকলে অথবা বিক্রেতার অবশিষ্ট পরিমাণের চেয়ে অতিরিক্ত বিক্রির চেষ্টা হলে স্বয়ংক্রিয় দ্বৈত বিক্রয় ও ওভারল্যাপ সতর্কতা।'
        : 'Automated detection preventing duplicate conveyances of previously sold parcels and transactions exceeding seller remaining balance.',
      icon: ShieldAlert,
      badge: isBn ? 'ঝুঁকি সতর্কতা' : 'Duplicate Alert',
      action: onViewGuardian || onStartScanning,
      btnText: isBn ? 'ল্যান্ড গার্ডিয়ান দেখুন' : 'Explore Guardian'
    },
    {
      id: 'history',
      title: isBn ? 'জমির পূর্ববর্তী লেনদেনের ইতিহাস' : 'Land Transaction History',
      desc: isBn
        ? 'নির্দিষ্ট পার্সেল আইডির অধীনে ২০,০০০+ ঐতিহাসিক রেকর্ডের সম্পূর্ণ ধারাবাহিক মালিকানা চেইন, হস্তান্তরের তারিখ ও দলিলের কালানুক্রমিক ইতিহাস।'
        : 'Comprehensive chronological chain of custody and transfer history across 20,000+ synthetic parcel records.',
      icon: History,
      badge: isBn ? '২০,০০০+ রেকর্ড' : '20,000+ Records',
      action: onViewHistory || onStartScanning,
      btnText: isBn ? 'ইতিহাস অনুসন্ধান' : 'Search History'
    },
    {
      id: 'graph',
      title: isBn ? 'জমির রেকর্ড সম্পর্ক গ্রাফ' : 'Land Record Relationship Graph',
      desc: isBn
        ? 'দলিল, মালিক, উত্তরাধিকারী, দাগ ও খতিয়ানের জটিল সংযোগগুলো একটি স্পষ্ট ও ইন্টারঅ্যাক্টিভ নলেজ গ্রাফের মাধ্যমে ভিজ্যুয়ালাইজ করে মালিকানা স্পষ্ট করে।'
        : 'Interactive knowledge graph visualizing relationships between deeds, owners, heirs, survey dags, and khatian nodes for clear ownership chains.',
      icon: Network,
      badge: isBn ? 'নলেজ গ্রাফ' : 'Knowledge Graph',
      action: onViewPassport || onStartScanning,
      btnText: isBn ? 'সম্পর্ক গ্রাফ খুলুন' : 'Open Relationship Graph'
    }
  ];

  return (
    <section 
      id="features-section" 
      className="landing-section" 
      style={{
        padding: '72px 0',
        background: 'var(--bg-paper)',
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
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
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
            <Sparkles size={14} />
            <span>{isBn ? 'মূল সক্ষমতা' : 'CORE CAPABILITIES'}</span>
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
            {isBn ? 'ভূমি কবচের প্রধান ফিচারসমূহ' : 'Main Features of Bhumi Kobocho'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            margin: 0
          }}>
            {isBn
              ? 'কৃত্রিম বুদ্ধিমত্তা ও ওপেন ডেটা আর্কিটেকচারের সমন্বয়ে জমি যাচাইয়ের সবচেয়ে নির্ভরযোগ্য ও আধুনিক প্রযুক্তি।'
              : 'Reliable land verification technology combining artificial intelligence, open cadastral standards, and knowledge graphs.'}
          </p>
        </div>

        {/* Feature Cards Grid: 5 Core Features */}
        <div 
          className="features-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="feature-clean-card"
                style={{
                  background: 'var(--white)',
                  borderRadius: '12px',
                  border: '1.5px solid var(--line)',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(16, 39, 42, 0.05)',
                  transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--primary-accent)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(39, 66, 160, 0.10)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 39, 42, 0.05)';
                }}
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      background: 'var(--accent-tint)',
                      border: '1px solid #C4D6F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-accent)'
                    }}>
                      <Icon size={22} />
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--line)',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '10px',
                    lineHeight: 1.35
                  }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.94rem',
                    color: 'var(--text-body)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px dashed var(--line)' }}>
                  <button
                    type="button"
                    onClick={item.action}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      color: 'var(--primary-accent)',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      fontFamily: 'var(--font-heading)',
                      transition: 'gap 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.gap = '10px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.gap = '7px';
                    }}
                  >
                    <span>{item.btnText}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
