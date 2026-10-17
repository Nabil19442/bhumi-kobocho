import React from 'react';
import { ScanText, History, AlertTriangle, FileBadge, QrCode, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CoreFeaturesSection({
  lang = 'bn',
  onStartScanning,
  onViewHistory,
  onViewPassport,
  onViewLandPrice
}) {
  const isBn = lang === 'bn';

  const features = [
    {
      id: 'scanner',
      title: isBn ? 'এআই দলিল স্ক্যানার' : 'AI Deed Scanner',
      desc: isBn
        ? 'বাংলা ও ইংরেজি দলিলের ছবি বা পিডিএফ থেকে বিক্রেতা, ক্রেতা, দাগ, খতিয়ান, মৌজা ও জমির পরিমাণ স্বয়ংক্রিয়ভাবে শনাক্ত ও সম্পাদনা।'
        : 'Extracts seller, buyer, plot, khatian, and acreage from Bengali/English deed documents with editable confidence reviews.',
      icon: ScanText,
      badge: isBn ? 'অপটিক্যাল এআই' : 'OCR Intelligence',
      action: onStartScanning,
      btnText: isBn ? 'দলিল স্ক্যান করুন' : 'Scan a Deed'
    },
    {
      id: 'history',
      title: isBn ? 'পূর্ববর্তী লেনদেনের ইতিহাস' : 'Previous Land Transaction History',
      desc: isBn
        ? 'স্থায়ী পার্সেল আইডির অধীনে ২০,০০০+ ঐতিহাসিক রেকর্ডের সম্পূর্ণ ধারাবাহিক মালিকানা চেইন ও হস্তান্তরের কালানুক্রমিক সারসংক্ষেপ।'
        : 'Comprehensive chronological chain of custody and transfer history across 20,000+ synthetic parcel records.',
      icon: History,
      badge: isBn ? '২০,০০০+ রেকর্ড' : '20,000+ Records',
      action: onViewHistory || onStartScanning,
      btnText: isBn ? 'ইতিহাস অনুসন্ধান' : 'Search History'
    },
    {
      id: 'conflicts',
      title: isBn ? 'দ্বৈত বিক্রয় ও বিরোধ শনাক্তকরণ' : 'Duplicate Sale Detection',
      desc: isBn
        ? 'একই জমি পূর্বে হস্তান্তর করে থাকলে অথবা অবশিষ্ট হোল্ডিং পরিমাণের চেয়ে অতিরিক্ত বিক্রির চেষ্টা করলে স্বয়ংক্রিয় অডিট সতর্কতা।'
        : 'Detects duplicate conveyances of previously sold parcels and overlapping transactions exceeding seller balance.',
      icon: AlertTriangle,
      badge: isBn ? 'ঝুঁকি সতর্কতা' : 'Conflict Alerts',
      action: onStartScanning,
      btnText: isBn ? 'বিরোধ নিরীক্ষা দেখুন' : 'Inspect Conflicts'
    },
    {
      id: 'passport',
      title: isBn ? 'নাগরিক প্লট পাসপোর্ট' : 'Plot Passport',
      desc: isBn
        ? 'নির্দিষ্ট পার্সেলের জরিপ ভিত্তি, দলিল হস্তান্তর ইতিহাস, ক্ষেত্রফলের সামঞ্জস্য ও সত্যতার একক সমন্বিত ডিজিটাল পাসপোর্ট।'
        : 'Unified single-source summary of cadastral surveys, registration deeds, area consistency, and audit status.',
      icon: FileBadge,
      badge: isBn ? 'প্লট পাসপোর্ট' : 'Passport',
      action: onViewPassport,
      btnText: isBn ? 'পাসপোর্ট খুলুন' : 'Open Passport'
    },
    {
      id: 'qr',
      title: isBn ? 'কিউআর-ভিত্তিক প্লট সত্যতা' : 'QR-based Plot Verification',
      desc: isBn
        ? 'প্রতিটি নির্দিষ্ট প্লটের জন্য আলাদা ডায়নামিক কিউআর কোড যা সরাসরি সংশ্লিষ্ট প্লট পাসপোর্ট ও পাবলিক ভেরিফিকেশনে নিয়ে যায়।'
        : 'Dynamic parcel-specific QR codes directing straight to the dedicated Plot Passport without fixed demo rewiring.',
      icon: QrCode,
      badge: isBn ? 'ডায়নামিক কিউআর' : 'Dynamic QR',
      action: onViewPassport,
      btnText: isBn ? 'কিউআর যাচাই' : 'Verify QR'
    },
    {
      id: 'landprice',
      title: isBn ? 'জমির বাজারমূল্য বুদ্ধিমত্তা' : 'Land Price Intelligence',
      desc: isBn
        ? '২০,০০০ গ্রামীণ ল্যান্ড পয়েন্টে প্রশিক্ষিত মেশিন লার্নিং মডেলের মাধ্যমে মৌজা ও রাস্তার ধরনের ওপর ভিত্তি করে মূল্য প্রাক্কলন।'
        : 'Predictive rural land valuation powered by Gradient Boosting ML trained on 20,000 geographic points.',
      icon: TrendingUp,
      badge: 'ML Engine',
      action: onViewLandPrice,
      btnText: isBn ? 'সম্ভাব্য মূল্য জানুন' : 'Estimate Price'
    }
  ];

  return (
    <section className="landing-section" style={{
      padding: '72px 0',
      background: 'var(--bg-paper)',
      borderBottom: '1px solid #CAD7CF'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
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
            <ShieldCheck size={14} />
            <span>{isBn ? 'মূল ফিচারসমূহ' : 'CORE CAPABILITIES'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}>
            {isBn ? 'জমি ক্রয়ের পূর্বে নির্ভুল যাচাই ব্যবস্থা' : 'Key Verification Capabilities'}
          </h2>

          <p style={{
            fontSize: '1.04rem',
            color: 'var(--text-body)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6
          }}>
            {isBn
              ? 'দলিল স্ক্যান থেকে শুরু করে লেনদেনের ইতিহাস বিশ্লেষণ, দ্বৈত বিক্রয় শনাক্তকরণ এবং বাজারমূল্য প্রাক্কলনের সমন্বিত প্রযুক্তি।'
              : 'End-to-end intelligence from OCR deed scanning to transaction history analysis, duplicate sale prevention, and ML valuation.'}
          </p>
        </div>

        {/* 6-Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-std)',
                  border: '1.5px solid var(--line)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'var(--accent-tint)',
                      border: '1px solid #C4D6F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-accent)'
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'var(--bg-paper)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      color: 'var(--text-muted)'
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-body)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.55,
                    marginBottom: '20px'
                  }}>
                    {item.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={item.action}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    color: 'var(--primary-accent)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{item.btnText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
