import React from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Layers, 
  Compass, 
  Droplets, 
  Zap, 
  ArrowRight, 
  ShieldAlert,
  BarChart2
} from 'lucide-react';

export default function LandPricePreviewSection({ lang = 'bn', onViewLandPrice }) {
  const isBn = lang === 'bn';

  const supportedFactors = [
    {
      icon: <Layers size={18} />,
      title_bn: 'জমির পরিমাণ ও শ্রেণি',
      title_en: 'Area & Land Type',
      desc_bn: 'শতক হিসাব এবং নাল, ভিটি, পুকুর, বাগান বা বাণিজ্যিক জমির ধরন',
      desc_en: 'Decimal measurement and classification (nal, viti, etc.)'
    },
    {
      icon: <Compass size={18} />,
      title_bn: 'রাস্তার সংযোগ ও প্রশস্ততা',
      title_en: 'Road Access & Width',
      desc_bn: 'পাকা, এইচবিবি বা কাঁচা রাস্তা এবং রাস্তার প্রশস্ততা (ফিট)',
      desc_en: 'Road frontage type (pucca, HBB, katcha) and width in feet'
    },
    {
      icon: <MapPin size={18} />,
      title_bn: 'ভৌগোলিক অবস্থান ও দূরত্ব',
      title_en: 'Location & Proximity',
      desc_bn: 'জেলা, উপজেলা ও মৌজা ভিত্তিক দূরত্ব ও স্থানীয় বাজারের সান্নিধ্য',
      desc_en: 'District, upazila, mouza and distance to local growth centers'
    },
    {
      icon: <Droplets size={18} />,
      title_bn: 'নিষ্কাশন ও প্লাবন ঝুঁকি',
      title_en: 'Drainage & Flood Risk',
      desc_bn: 'উঁচু জমি, ঢালু নিষ্কাশন ও মৌসুমি প্লাবন ঝুঁকির মাত্রা',
      desc_en: 'Topography, elevation, and seasonal inundation risk level'
    },
    {
      icon: <Zap size={18} />,
      title_bn: 'অবকাঠামো সুবিধা',
      title_en: 'Infrastructure Utilities',
      desc_bn: 'পল্লী বিদ্যুৎ সংযোগ ও গভীর নলকূপ সেচ সুবিধার উপস্থিতি',
      desc_en: 'Rural electricity grid availability and irrigation access'
    },
    {
      icon: <BarChart2 size={18} />,
      title_bn: 'এমপিরিক্যাল বাউন্ড ও রেঞ্জ',
      title_en: 'Empirical Uncertainty',
      desc_bn: '৮০% সম্ভাব্য বিচ্যুতির পরিসীমা ও প্রতি শতকের আনুমানিক দর',
      desc_en: '80% empirical residual interval and unit-consistent rates'
    }
  ];

  return (
    <section 
      id="land-price-preview" 
      className="landing-section" 
      style={{
        background: 'var(--paper)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '72px 20px'
      }}
    >
      <div style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            marginBottom: '12px'
          }}>
            <TrendingUp size={14} aria-hidden="true" />
            <span>{isBn ? 'মেশিন লার্নিং বুদ্ধিমত্তা' : 'Machine Learning Intelligence'}</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 800,
            color: 'var(--ink)',
            fontFamily: 'var(--font-heading)',
            margin: '0 0 12px',
            lineHeight: 1.25
          }}>
            {isBn ? 'জমির সম্ভাব্য মূল্য বিশ্লেষণ' : 'Rural Land Price Intelligence'}
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            margin: 0
          }}>
            {isBn
              ? 'জমির অবস্থান, পরিমাণ, রাস্তার সংযোগ ও অন্যান্য বৈশিষ্ট্যের ভিত্তিতে পরীক্ষামূলক মডেলের মাধ্যমে সম্ভাব্য মূল্য বিশ্লেষণ করুন।'
              : 'Estimate multi-factor rural land valuations using our reproducible machine learning regression model.'}
          </p>
        </div>

        {/* Supported Factors Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '18px',
          marginBottom: '36px'
        }}>
          {supportedFactors.map((factor, idx) => (
            <div 
              key={idx}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-std)',
                padding: '20px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{
                background: 'var(--accent-tint)',
                color: 'var(--primary-accent)',
                padding: '10px',
                borderRadius: '6px',
                display: 'flex',
                flexShrink: 0
              }}>
                {factor.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 4px'
                }}>
                  {isBn ? factor.title_bn : factor.title_en}
                </h3>
                <p style={{
                  fontSize: '0.86rem',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {isBn ? factor.desc_bn : factor.desc_en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Strict Disclaimer Banner */}
        <div style={{
          background: '#FEF6F0',
          border: '1px solid #F5CFC0',
          borderRadius: 'var(--radius-std)',
          padding: '16px 20px',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <ShieldAlert size={22} style={{ color: '#9A2C14', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ fontSize: '0.88rem', color: '#9A2C14', lineHeight: 1.55 }}>
            <strong>{isBn ? 'সতর্কবার্তা ও সীমাবদ্ধতা:' : 'Strict Disclaimer:'} </strong>
            {isBn
              ? 'এই মডেলটি সম্পূর্ণ কৃত্রিম ডেটাসেট (synthetic data) দ্বারা প্রশিক্ষিত ও পরীক্ষিত। এটি বাংলাদেশের কোনো সরকারি সাব-রেজিস্ট্রি বা ভূমি মন্ত্রণালয়ের নথি নয়, কোনো প্রকৃত বাজারদর নয় এবং জমি কেনাবেচার আর্থিক বা আইনি সিদ্ধান্তের জন্য ব্যবহারযোগ্য নয়।'
              : 'This model is trained on synthetic demo data only. It does not represent official government valuations or actual Bangladesh market rates and must not be used for legal or financial appraisal.'}
          </div>
        </div>

        {/* Prominent CTA Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={onViewLandPrice}
            style={{
              background: 'var(--accent)',
              color: 'var(--white)',
              padding: '14px 28px',
              fontSize: '1.02rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              borderRadius: 'var(--radius-std)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 4px rgba(39, 66, 160, 0.2)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-accent-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <span>{isBn ? 'জমির মূল্য বিশ্লেষণ করুন' : 'Analyze Rural Land Value'}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
}
