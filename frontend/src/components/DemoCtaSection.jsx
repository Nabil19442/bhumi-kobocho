import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Layers, Info } from 'lucide-react';

export default function DemoCtaSection({
  lang = 'bn',
  onStartScanning,
  onStartCompare
}) {
  const isBn = lang === 'bn';

  const demoScenarios = [
    {
      id: 'scen-1',
      title: isBn ? 'দ্বৈত বিক্রয় বিরোধ' : 'Duplicate Sale Conflict',
      badge: isBn ? 'উচ্চ ঝুঁকি' : 'High Risk',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    },
    {
      id: 'scen-2',
      title: isBn ? 'অতিরিক্ত জমির পরিমাণ সীমা' : 'Excess Area Exceeded',
      badge: isBn ? 'সীমা লঙ্ঘন' : 'Area Limit',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A'
    },
    {
      id: 'scen-3',
      title: isBn ? 'ধারাবাহিক সঠিক দলিল' : 'Clean Title Chain',
      badge: isBn ? 'যাচাইকৃত' : 'Clean Chain',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0'
    },
    {
      id: 'scen-4',
      title: isBn ? 'অসম্পূর্ণ ইতিহাস ও সূত্রের ফাঁক' : 'Incomplete History Gap',
      badge: isBn ? 'পর্যালোচনা' : 'History Gap',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE'
    }
  ];

  return (
    <section className="landing-section" style={{
      padding: '64px 0',
      background: 'var(--accent-tint)',
      borderBottom: '1px solid #C4D6F5'
    }}>
      <div className="landing-container" style={{
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
        padding: '0 var(--gutter-desktop)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'var(--bg-paper)',
          borderRadius: 'var(--radius-md, 12px)',
          border: '2px solid var(--text-main)',
          padding: '36px',
          boxShadow: 'var(--shadow-hard)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: '#FDEEE9',
              border: '1px solid #F3BFB3',
              color: '#9A2C14',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              marginBottom: '14px'
            }}>
              <Info size={14} />
              <span>{isBn ? 'ডেমো ডেটা — পরীক্ষামূলক কৃত্রিম রেকর্ড' : 'DEMO DATA — SYNTHETIC BENCHMARK'}</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.25,
              marginBottom: '12px'
            }}>
              {isBn ? 'কৃত্রিম নমুনায় তাৎক্ষণিক দলিল যাচাই পরখ করুন' : 'Try the Deed Verification Workflow Live'}
            </h2>

            <p style={{
              fontSize: '0.98rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              {isBn
                ? 'আসল কাগজপত্র আপলোডের আগে কৃত্রিম নমুনার মাধ্যমে দ্বৈত বিক্রয়, ক্ষেত্রফল ওভারল্যাপ ও প্লট পাসপোর্টের পুরো প্রক্রিয়াটি পরীক্ষা করে দেখুন।'
                : 'Experience the full verification engine with pre-loaded synthetic scenarios including duplicate sales, area overlaps, and clean title chains.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={onStartScanning}
                className="btn-primary"
                style={{
                  height: '46px',
                  padding: '0 22px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '6px'
                }}
              >
                <span>{isBn ? 'যাচাইকরণ ডেমো চালু করুন' : 'Launch Verification Demo'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Scenario quick-picker cards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase'
            }}>
              {isBn ? 'উপলব্ধ কৃত্রিম টেস্ট দৃশ্যপট:' : 'AVAILABLE SYNTHETIC TEST SCENARIOS:'}
            </div>

            {demoScenarios.map((scen) => (
              <div
                key={scen.id}
                onClick={onStartScanning}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: scen.bg,
                  border: `1.5px solid ${scen.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: scen.color }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {scen.title}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: scen.color,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#FFFFFF',
                  border: `1px solid ${scen.border}`
                }}>
                  {scen.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
