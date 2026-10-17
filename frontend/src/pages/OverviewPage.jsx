import React from 'react';
import { 
  LayoutDashboard, 
  ScanText, 
  History, 
  FileBadge, 
  ClipboardCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Info,
  Layers,
  Database
} from 'lucide-react';

export default function OverviewPage({
  t,
  lang = 'bn',
  onNavigate,
  onLoadScenario
}) {
  const isBn = lang === 'bn';

  const stats = [
    {
      label: isBn ? 'কৃত্রিম লেনদেন রেকর্ড' : 'Synthetic Land Records',
      value: '২০,০০০+',
      sub: isBn ? 'স্থায়ী পার্সেল আইডিসহ সম্পূর্ণ সংরক্ষিত' : 'Indexed with stable Parcel IDs',
      icon: Database,
      color: 'var(--primary-accent)'
    },
    {
      label: isBn ? 'স্বয়ংক্রিয় বিরোধ শনাক্তকরণ' : 'Conflict Rule Engine',
      value: '৫ টি দৃশ্যপট',
      sub: isBn ? 'দ্বৈত বিক্রয়, ওভারল্যাপ ও সূত্রের ফাঁক' : 'Duplicate, overlap, and gap detection',
      icon: AlertTriangle,
      color: '#D97706'
    },
    {
      label: isBn ? 'প্লট পাসপোর্ট ও কিউআর' : 'Dynamic Plot Passports',
      value: '১০০% ডাইনামিক',
      sub: isBn ? 'পার্সেল ভিত্তিক ইউনিক কিউআর যাচাই' : 'Parcel-specific QR verification',
      icon: FileBadge,
      color: '#16A34A'
    },
    {
      label: isBn ? 'গ্রামীণ জমির মূল্য মডেল' : 'Rural Land Price ML',
      value: '২০,০০০ পয়েন্ট',
      sub: isBn ? 'হিস্টোগ্রাম গ্র্যাডিয়েন্ট বুস্টিং এলগরিদম' : 'HistGradientBoostingRegressor',
      icon: TrendingUp,
      color: '#2563EB'
    }
  ];

  const workflows = [
    {
      id: 'scanner',
      title: isBn ? '১. বিক্রেতার দলিল যাচাই করুন' : '1. Verify a Land Deed',
      desc: isBn
        ? 'বিক্রেতার দেওয়া দলিলের স্ক্যান আপলোড করুন, এআই ফিল্ড পর্যালোচনা করুন এবং বিরোধ চিহ্নিত করুন।'
        : "Upload deed, review 9 extracted fields, and run automated conflict detection against history.",
      btnText: isBn ? 'যাচাই শুরু করুন' : 'Start Verification',
      icon: ScanText,
      primary: true
    },
    {
      id: 'history',
      title: isBn ? '২. পার্সেল লেনদেনের ইতিহাস' : '2. Land Transaction History',
      desc: isBn
        ? 'দাগ ও খতিয়ানের অধীনে সকল পূর্ববর্তী হস্তান্তরের সম্পূর্ণ কালানুক্রমিক চেইন অব টাইটেল পরিদর্শন করুন।'
        : 'Explore complete chronological chain of custody and transfer history under stable Parcel IDs.',
      btnText: isBn ? 'ইতিহাস দেখুন' : 'Explore History',
      icon: History
    },
    {
      id: 'passport',
      title: isBn ? '৩. নাগরিক প্লট পাসপোর্ট ও কিউআর' : '3. Plot Passport & QR',
      desc: isBn
        ? 'জমির খতিয়ান ভিত্তি, হস্তান্তরের ইতিহাস, ক্ষেত্রফলের সামঞ্জস্য ও শেয়ারযোগ্য কিউআর কোড দেখুন।'
        : 'View comprehensive title summary, verified acreage, timeline, and dynamic QR verification.',
      btnText: isBn ? 'পাসপোর্ট খুলুন' : 'Open Passport',
      icon: FileBadge
    },
    {
      id: 'landprice',
      title: isBn ? '৪. জমির বাজারমূল্য প্রাক্কলন' : '4. Land Price Intelligence',
      desc: isBn
        ? 'মৌজা, রাস্তার দূরত্ব ও অবকাঠামোগত বৈশিষ্ট্যের ওপর ভিত্তি করে প্রতি শতক জমির আনুমানিক মূল্য জানুন।'
        : 'Estimate rural land value per decimal based on road access, mouza, and infrastructure features.',
      btnText: isBn ? 'মূল্য প্রাক্কলন' : 'Estimate Price',
      icon: TrendingUp
    }
  ];

  const testScenarios = [
    {
      id: 'scen-1',
      title: isBn ? 'দৃশ্যপট ১: দ্বৈত বিক্রয় বিরোধ (দাগ ৫৫০)' : 'Scenario 1: Duplicate Sale Conflict (Plot 550)',
      desc: isBn ? 'বিক্রেতা পূর্বে সমস্ত ১০ শতক বিক্রি করার পর পুনরায় বিক্রির চেষ্টা' : 'Seller conveys 10.0 dec previously transferred; 0.0 dec remaining',
      status: isBn ? 'উচ্চ ঝুঁকি সতর্কতা' : 'High Risk Alert',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    },
    {
      id: 'scen-2',
      title: isBn ? 'দৃশ্যপট ২: হস্তান্তরিত জমির ক্ষেত্রফল ওভারল্যাপ (দাগ ৭৮৪)' : 'Scenario 2: Overlapping Area Conflict (Plot 784)',
      desc: isBn ? 'অবশিষ্ট ৪ শতকের বিপরীতে ৭ শতক বিক্রির চেষ্টা (৩ শতক ওভারল্যাপ)' : 'Attempting to sell 7.0 dec against remaining 4.0 dec balance',
      status: isBn ? 'ক্ষেত্রফল বিরোধ' : 'Area Overlap',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A'
    },
    {
      id: 'scen-3',
      title: isBn ? 'দৃশ্যপট ৩: স্বাভাবিক বিক্রয় ও পরিচ্ছন্ন চেইন (দাগ ১০৫৮)' : 'Scenario 3: Normal Sale & Clean Chain (Plot 1058)',
      desc: isBn ? '১৫.৫ শতকের মধ্য থেকে ৫ শতক বৈধ হস্তান্তর; ধারাবাহিকতা সঠিক' : 'Valid 5.0 dec transfer from 15.5 dec holding; clean continuity',
      status: isBn ? 'কোনো দ্বন্দ্ব নেই' : 'Clean Title',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0'
    },
    {
      id: 'scen-4',
      title: isBn ? 'দৃশ্যপট ৪: অসম্পূর্ণ ইতিহাস ও খতিয়ানের ফাঁক (দাগ ৩৩১০)' : 'Scenario 4: Missing Linkage Gap (Plot 3310)',
      desc: isBn ? 'পূর্ববর্তী দলিলের তথ্য অপ্রাপ্য এবং প্যারেন্ট খতিয়ানের সংযোগ অনুপস্থিত' : 'Missing prior deed linkage requiring physical archival review',
      status: isBn ? 'পর্যালোচনা প্রয়োজন' : 'Needs Review',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE'
    }
  ];

  return (
    <div className="overview-page-root" style={{
      maxWidth: 'var(--max-content-width)',
      margin: '0 auto',
      padding: '32px var(--gutter-desktop)',
      boxSizing: 'border-box'
    }}>
      {/* Top Banner Alert */}
      <div style={{
        background: '#FFFBEB',
        border: '1.5px solid #FDE68A',
        borderRadius: 'var(--radius-std)',
        padding: '12px 18px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} style={{ color: '#D97706', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#92400E', lineHeight: 1.4 }}>
            <strong>{isBn ? 'ভূমি ক্রয় যাচাইকরণ ব্যবস্থা (ভূমি কবচ):' : 'Land Purchase Verification Intelligence:'}</strong>{' '}
            {isBn
              ? 'জমি কেনার আগে বিক্রেতার দলিলের সত্যতা, পূর্ববর্তী লেনদেনের ধারাবাহিকতা ও সম্ভাব্য দ্বৈত বিক্রয় শনাক্ত করার প্ল্যাটফর্ম।'
              : 'Empowering potential land buyers in Bangladesh to verify transaction histories and detect duplicate sales before purchasing.'}
          </span>
        </div>
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#FFFFFF',
          border: '1px solid #FDE68A',
          color: '#B45309'
        }}>
          {isBn ? 'ডেমো ডেটা মোড' : 'DEMO BENCHMARK'}
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          fontFamily: 'var(--font-heading)',
          margin: '0 0 8px 0'
        }}>
          {isBn ? 'ভূমি ক্রয় যাচাইকরণ ড্যাশবোর্ড' : 'Purchase Verification Dashboard'}
        </h1>
        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          margin: 0,
          maxWidth: '780px',
          lineHeight: 1.55
        }}>
          {isBn
            ? 'দলিল স্ক্যান করুন, সংরক্ষিত ২০,০০০+ লেনদেন রেকর্ডে পার্সেল অনুসন্ধান করুন এবং ক্রয়ের সিদ্ধান্ত নেওয়ার আগেই সম্ভাব্য বিরোধ চিহ্নিত করুন।'
            : 'Scan deeds, inspect transaction chains under stable Parcel IDs, and identify potential conflicts before making a land purchase.'}
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '36px'
      }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-std)',
                border: '1.5px solid var(--line)',
                padding: '20px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                  {s.label}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--accent-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color
                }}>
                  <Icon size={16} />
                </div>
              </div>

              <div style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '4px'
              }}>
                {s.value}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {s.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Workflow Jump Cards */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          fontFamily: 'var(--font-heading)',
          marginBottom: '16px'
        }}>
          {isBn ? 'মূল যাচাইকরণ সেবা' : 'Core Verification Workflows'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {workflows.map((wf) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.id}
                style={{
                  background: 'var(--bg-paper)',
                  borderRadius: 'var(--radius-std)',
                  border: wf.primary ? '2px solid var(--primary-accent)' : '1.5px solid var(--line)',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: wf.primary ? 'var(--shadow-hard-sm)' : 'var(--shadow-subtle)'
                }}
              >
                <div>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: wf.primary ? 'var(--primary-accent)' : 'var(--accent-tint)',
                    color: wf.primary ? '#FFFFFF' : 'var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}>
                    <Icon size={18} />
                  </div>

                  <h3 style={{
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '8px'
                  }}>
                    {wf.title}
                  </h3>

                  <p style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.5,
                    marginBottom: '18px'
                  }}>
                    {wf.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(wf.id)}
                  className={wf.primary ? 'btn-primary' : 'btn-secondary'}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%'
                  }}
                >
                  <span>{wf.btnText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Conflict Scenarios Quick Launcher */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-std)',
        border: '1.5px solid var(--line)',
        padding: '24px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', margin: '0 0 4px 0' }}>
              {isBn ? 'বিরোধ নিরীক্ষা টেস্ট দৃশ্যপট' : 'Conflict Detection Test Scenarios'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              {isBn ? 'নিচের যেকোনো একটিতে ক্লিক করে সরাসরি যাচাই ইঞ্জিনের ফলাফল পরীক্ষা করুন:' : 'Click any scenario below to immediately test the verification engine:'}
            </p>
          </div>
          <span style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            background: 'var(--bg-paper)',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid var(--line)'
          }}>
            {isBn ? '৫ টি টেস্ট প্রিসেট' : '5 TEST PRESETS'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {testScenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => onNavigate && onNavigate('scanner')}
              style={{
                background: scen.bg,
                border: `1.5px solid ${scen.border}`,
                borderRadius: '8px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: scen.color, fontFamily: 'var(--font-mono)' }}>
                  {scen.status}
                </span>
                <ArrowRight size={14} style={{ color: scen.color }} />
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                {scen.title}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
                {scen.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
