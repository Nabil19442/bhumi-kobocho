import React, { useState } from 'react';
import { ScanText, CheckCircle2, AlertTriangle, FileText, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function DeedScanVisual({ lang = 'bn', onStartScanning, onViewPassport }) {
  const isBn = lang === 'bn';
  const [simMode, setSimMode] = useState('clean'); // 'clean' or 'conflict'
  const [isScanning, setIsScanning] = useState(false);

  const handleSimToggle = (mode) => {
    setSimMode(mode);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 600);
  };

  const isConflict = simMode === 'conflict';

  return (
    <div className="deed-scan-visual-card" style={{
      background: 'var(--bg-paper)',
      borderRadius: 'var(--radius-md, 12px)',
      border: '2px solid var(--text-main)',
      boxShadow: '0 12px 32px rgba(16, 39, 42, 0.12)',
      overflow: 'hidden',
      maxWidth: '520px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Top Interactive Mode Switcher */}
      <div style={{
        background: 'var(--dark-band)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1.5px solid var(--text-main)',
        color: '#EAF0E8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          <ScanText size={15} style={{ color: '#FDE68A' }} />
          <span>{isBn ? 'দলিল স্ক্যান ও হিস্ট্রি ম্যাচিং ডেমো' : 'LIVE SCAN & HISTORY MATCH'}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleSimToggle('clean')}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              background: !isConflict ? 'var(--primary-accent)' : 'rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isBn ? 'সঠিক ধারাবাহিকতা' : 'Clean Title'}
          </button>
          <button
            type="button"
            onClick={() => handleSimToggle('conflict')}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              background: isConflict ? '#DC2626' : 'rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isBn ? 'বিরোধ শনাক্ত' : 'Detect Conflict'}
          </button>
        </div>
      </div>

      {/* Simulated Land Deed Header */}
      <div style={{ padding: '16px 20px', background: '#FAF7F0', borderBottom: '1px dashed #CAD7CF', position: 'relative' }}>
        {/* Animated Scanning Line */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '2px',
            background: 'var(--primary-accent)',
            boxShadow: '0 0 10px 2px var(--primary-accent)',
            animation: 'pulse 0.6s ease'
          }} />
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isBn ? 'সাব-রেজিস্ট্রি হস্তান্তর দলিল (কৃত্রিম নমুনা)' : 'SUB-REGISTRY DEED (SYNTHETIC SPECIMEN)'}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {isConflict ? 'দলিল নং ৪৫২০/২০২৩ (সাফ-কবলা)' : 'দলিল নং 2026-0017 (সাফ-কবলা)'}
            </div>
          </div>
          <span style={{
            background: isConflict ? '#FEE2E2' : '#DCFCE7',
            color: isConflict ? '#991B1B' : '#166534',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            border: isConflict ? '1px solid #F87171' : '1px solid #86EFAC'
          }}>
            {isConflict ? (isBn ? 'সম্ভাব্য দ্বৈত বিক্রয়' : 'Potential Duplicate') : (isBn ? 'ধারাবাহিক ইতিহাস' : 'Verified Chain')}
          </span>
        </div>

        {/* Extracted Deed Fields Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          fontSize: '0.82rem',
          background: '#FFFFFF',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #E2E8F0'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{isBn ? 'বিক্রেতা:' : 'Seller:'} </span>
            <strong style={{ color: 'var(--text-main)' }}>{isConflict ? 'মোঃ মোর্শেদ আলম' : 'আব্দুল করিম'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{isBn ? 'ক্রেতা:' : 'Buyer:'} </span>
            <strong style={{ color: 'var(--text-main)' }}>{isConflict ? 'তারেক রহমান' : 'মোঃ সাকিব হাসান'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{isBn ? 'দাগ নং:' : 'Dag No:'} </span>
            <strong style={{ color: 'var(--primary-accent)' }}>{isConflict ? '৫৫০' : '১২৩৪'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{isBn ? 'খতিয়ান নং:' : 'Khatian:'} </span>
            <strong style={{ color: 'var(--primary-accent)' }}>{isConflict ? '২২০' : '৪৫৬'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{isBn ? 'জমির পরিমাণ:' : 'Land Area:'} </span>
            <strong style={{ color: '#B45309' }}>{isConflict ? '১০.০০ শতক' : '১০.০০ শতক'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{isBn ? 'মৌজা:' : 'Mouza:'} </span>
            <strong style={{ color: 'var(--text-main)' }}>{isConflict ? 'গুলশান (JL 15)' : 'শান্তিপুর (JL 12)'}</strong>
          </div>
        </div>
      </div>

      {/* History Matching & Conflict Detection Result Box */}
      <div style={{ padding: '16px 20px', background: isConflict ? '#FFF5F5' : '#F0FDF4' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          {isConflict ? (
            <AlertTriangle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={20} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: isConflict ? '#991B1B' : '#166534',
              fontFamily: 'var(--font-heading)',
              marginBottom: '4px'
            }}>
              {isConflict
                ? (isBn ? 'উচ্চ ঝুঁকি — সম্ভাব্য দ্বৈত বিক্রয় সতর্কতা' : 'High Risk — Potential Duplicate Sale Detected')
                : (isBn ? 'কোনো দ্বন্দ্ব পাওয়া যায়নি — ধারাবাহিকতা সন্তোষজনক' : 'No Conflict Detected — Clean Title Chain')}
            </div>

            <p style={{
              fontSize: '0.78rem',
              color: isConflict ? '#7F1D1D' : '#14532D',
              margin: 0,
              lineHeight: 1.45
            }}>
              {isConflict
                ? (isBn
                    ? 'বিক্রেতা পূর্বে দলিল ১১০২/২০২০ এর মাধ্যমে আবুল কাশেমের কাছে এই সম্পূর্ণ ১০ শতক জমি হস্তান্তর করেছেন। বর্তমানে কোনো অতিরিক্ত অংশ অবশিষ্ট নেই।'
                    : 'The seller previously transferred all 10.0 decimals to Abul Kashem in Deed 1102/2020. Remaining unencumbered area is 0.0 decimals.')
                : (isBn
                    ? 'পূর্ববর্তী নিবন্ধিত দলিল ২০১৫-০৮৪১ এর ধারাবাহিক সূত্র যাচাই হয়েছে। বিক্রেতার স্বত্ব ও জমার হিসাব সংরক্ষিত ইতিহাসের সাথে সঙ্গতিপূর্ণ।'
                    : 'Verified unbroken continuity with prior registered deed 2015-0841. Seller balance matches chronological registry records.')}
            </p>

            <div style={{
              marginTop: '10px',
              padding: '6px 10px',
              borderRadius: '4px',
              background: '#FFFFFF',
              border: isConflict ? '1px solid #FECACA' : '1px solid #BBF7D0',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {isConflict ? 'রেফারেন্স পূর্ববর্তী দলিল: 1102/2020' : 'রেফারেন্স পূর্ববর্তী দলিল: 2015-0841'}
              </span>
              <span style={{ fontWeight: 700, color: isConflict ? '#DC2626' : '#16A34A' }}>
                {isConflict ? '০.০০ শতক অবশিষ্ট' : '১০.০০ শতক অনুমোদিত'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual CTA in card */}
        <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onStartScanning}
            className="btn-primary"
            style={{
              flex: 1,
              height: '38px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '6px'
            }}
          >
            <span>{isBn ? 'আপনার দলিল যাচাই করুন' : 'Verify Your Deed'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
