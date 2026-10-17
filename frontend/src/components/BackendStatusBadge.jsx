import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';
import { checkBackendConnection, getApiBaseUrl } from '../api';

export default function BackendStatusBadge({ lang = 'bn' }) {
  const isBn = lang === 'bn';
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline' | 'waking'
  const [latency, setLatency] = useState(null);
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());

  const runCheck = async () => {
    setStatus('checking');
    const result = await checkBackendConnection();
    setApiUrl(result.apiBase);
    if (result.online) {
      setStatus('online');
      setLatency(result.latencyMs);
    } else if (result.isWakingUp) {
      setStatus('waking');
      // Auto-retry in 10 seconds if cold-starting
      setTimeout(runCheck, 10000);
    } else {
      setStatus('offline');
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const isLiveRender = apiUrl.includes('onrender.com');

  return (
    <div 
      className="backend-status-indicator"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '16px',
        fontSize: '0.74rem',
        fontFamily: 'var(--font-mono, monospace)',
        background: status === 'online' ? 'rgba(16, 185, 129, 0.1)' :
                    status === 'waking' ? 'rgba(245, 158, 11, 0.12)' :
                    status === 'offline' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
        border: `1px solid ${
          status === 'online' ? '#10B981' :
          status === 'waking' ? '#F59E0B' :
          status === 'offline' ? '#EF4444' : '#94A3B8'
        }`,
        color: status === 'online' ? '#065F46' :
               status === 'waking' ? '#92400E' :
               status === 'offline' ? '#991B1B' : '#475569'
      }}
      title={`Backend: ${apiUrl} ${latency ? `(${latency}ms)` : ''}`}
    >
      <span 
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: status === 'online' ? '#10B981' :
                           status === 'waking' ? '#F59E0B' :
                           status === 'offline' ? '#EF4444' : '#94A3B8',
          display: 'inline-block',
          boxShadow: status === 'online' ? '0 0 6px #10B981' : 'none'
        }}
      />
      <span>
        {status === 'checking' && (isBn ? 'API চেক হচ্ছে...' : 'Checking API...')}
        {status === 'waking' && (isBn ? 'সার্ভার সক্রিয় হচ্ছে...' : 'Waking Render...')}
        {status === 'online' && (isBn ? (isLiveRender ? 'ক্লাউড সার্ভার লাইভ' : 'API সক্রিয়') : (isLiveRender ? 'Render Cloud Live' : 'API Live'))}
        {status === 'offline' && (isBn ? 'সার্ভার অফলাইন' : 'API Offline')}
      </span>
      {status === 'offline' && (
        <button
          type="button"
          onClick={runCheck}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#991B1B',
            display: 'inline-flex',
            alignItems: 'center',
            marginLeft: '2px'
          }}
          title={isBn ? 'পুনরায় চেক করুন' : 'Retry connection'}
        >
          <RefreshCw size={11} />
        </button>
      )}
    </div>
  );
}
