import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, CloudRain, Server } from 'lucide-react';

export default function ApiErrorNotice({ error, onRetry, title }) {
  const [retrying, setRetrying] = useState(false);
  if (!error) return null;

  const isWakingUp = 
    error?.isWakingUp || 
    (typeof error === 'string' && (error.includes('waking up') || error.includes('Render'))) ||
    (error?.message && (error.message.includes('waking up') || error.message.includes('Render')));

  const isOffline =
    error?.isOffline ||
    (typeof error === 'string' && error.toLowerCase().includes('offline')) ||
    (error?.message && error.message.toLowerCase().includes('offline'));

  const message = typeof error === 'string' ? error : (error.message || 'An unexpected error occurred.');

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  // Amber styling for cloud server cold-start waking state; red for hard offline/errors
  const bg = isWakingUp ? '#FFFBEB' : '#FEF2F2';
  const border = isWakingUp ? '#FCD34D' : '#FCA5A5';
  const textColor = isWakingUp ? '#92400E' : '#991B1B';
  const subtextColor = isWakingUp ? '#78350F' : '#7F1D1D';
  const iconColor = isWakingUp ? '#D97706' : '#DC2626';

  return (
    <div
      role="alert"
      style={{
        margin: '16px 0',
        padding: '14px 18px',
        borderRadius: 'var(--radius-sm, 6px)',
        background: bg,
        border: `1px solid ${border}`,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '85%' }}>
        {isWakingUp ? (
          <Server size={22} style={{ color: iconColor, flexShrink: 0 }} aria-hidden="true" />
        ) : isOffline ? (
          <WifiOff size={22} style={{ color: iconColor, flexShrink: 0 }} aria-hidden="true" />
        ) : (
          <AlertTriangle size={22} style={{ color: iconColor, flexShrink: 0 }} aria-hidden="true" />
        )}
        <div>
          {title && (
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '3px', color: textColor }}>
              {title}
            </div>
          )}
          <div style={{ fontSize: '0.86rem', color: subtextColor, lineHeight: 1.45 }}>
            {message}
          </div>
          {isWakingUp && (
            <div style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.88, fontStyle: 'italic' }}>
              💡 টিপস: রেন্ডার ফ্রি ক্লাউড ইনস্ট্যান্স সাময়িক নিষ্ক্রিয়তার পর সক্রিয় হতে ৩০-৫০ সেকেন্ড সময় নিতে পারে।
            </div>
          )}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="btn-secondary"
          style={{
            height: '36px',
            padding: '0 14px',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderColor: isWakingUp ? '#F59E0B' : '#F87171',
            color: textColor,
            background: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            cursor: retrying ? 'wait' : 'pointer',
            opacity: retrying ? 0.7 : 1,
            borderRadius: '4px'
          }}
        >
          <RefreshCw size={13} className={retrying ? 'spin-animation' : ''} aria-hidden="true" />
          <span>{retrying ? 'চেষ্টা করা হচ্ছে...' : 'পুনরায় চেষ্টা (Retry)'}</span>
        </button>
      )}
    </div>
  );
}
