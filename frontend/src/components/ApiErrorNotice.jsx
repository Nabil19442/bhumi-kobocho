import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

export default function ApiErrorNotice({ error, onRetry, title }) {
  if (!error) return null;

  const isOffline =
    error.isOffline ||
    (typeof error === 'string' && error.toLowerCase().includes('offline')) ||
    (error.message && error.message.toLowerCase().includes('offline'));

  const message = typeof error === 'string' ? error : (error.message || 'An unexpected error occurred.');

  return (
    <div
      role="alert"
      style={{
        margin: '16px 0',
        padding: '14px 18px',
        borderRadius: 'var(--radius-sm)',
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        color: '#991B1B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isOffline ? (
          <WifiOff size={20} style={{ color: '#DC2626', flexShrink: 0 }} aria-hidden="true" />
        ) : (
          <AlertTriangle size={20} style={{ color: '#DC2626', flexShrink: 0 }} aria-hidden="true" />
        )}
        <div>
          {title && <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px', color: '#991B1B' }}>{title}</div>}
          <div style={{ fontSize: '0.85rem', color: '#7F1D1D' }}>{message}</div>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary"
          style={{
            height: '34px',
            padding: '0 12px',
            fontSize: '0.8rem',
            borderColor: '#F87171',
            color: '#991B1B',
            background: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} aria-hidden="true" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
