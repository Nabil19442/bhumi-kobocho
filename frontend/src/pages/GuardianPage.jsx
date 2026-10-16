import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Info, 
  AlertTriangle,
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  Bell,
  ArrowRightLeft,
  ExternalLink
} from 'lucide-react';
import { fetchSimulationEvents, triggerSimulationApi, fetchGuardianAlerts, markAlertReviewedApi } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';
import GuardianAlertModal from '../components/GuardianAlertModal';

export default function GuardianPage({ t, lang = 'bn' }) {
  const isBn = lang === 'bn';
  const [eventsCatalog, setEventsCatalog] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('evt-001');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);

  const loadGuardianData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, alertsData] = await Promise.all([
        fetchSimulationEvents(),
        fetchGuardianAlerts()
      ]);
      if (eventsData && eventsData.events) {
        setEventsCatalog(eventsData.events);
      }
      if (alertsData && alertsData.alerts) {
        setActiveAlerts(alertsData.alerts);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGuardianData();
  }, []);

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    setError(null);
    try {
      const newAlert = await triggerSimulationApi(selectedEventId);
      if (newAlert) {
        setActiveAlerts(prev => [newAlert, ...prev.filter(a => a.alert_id !== newAlert.alert_id)]);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleMarkReviewed = async (alertId) => {
    setError(null);
    try {
      const updated = await markAlertReviewedApi(alertId);
      if (updated && updated.alert) {
        setActiveAlerts(prev =>
          prev.map(a => (a.alert_id === alertId ? { ...a, is_reviewed: true } : a))
        );
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            padding: '8px',
            borderRadius: 'var(--radius-std)',
            display: 'flex'
          }}>
            <Bell size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
              lineHeight: 1.2
            }}>
              {isBn ? 'ল্যান্ড গার্ডিয়ান — নাগরিক অ্যালার্ট ফিড' : 'Land Guardian Alert Feed'}
            </h1>
            <p style={{
              fontSize: '0.96rem',
              color: 'var(--text-body)',
              fontFamily: 'var(--font-body)',
              margin: '4px 0 0'
            }}>
              {isBn 
                ? 'জমির রেকর্ডে কোনো পরিবর্তন বা নামজারি আবেদন শনাক্ত হলে রিয়েল-টাইম সতর্কবার্তা প্রদর্শন।' 
                : 'Simulated monitoring hub alerting citizens when records or mutations change.'}
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Prominent Disclaimer Banner */}
      <div style={{
        background: '#FEF4F0',
        border: '1px solid #F3BFB3',
        borderRadius: 'var(--radius-std)',
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ShieldAlert size={18} style={{ color: '#9A2C14', flexShrink: 0 }} />
        <span style={{
          fontSize: '0.88rem',
          fontWeight: 700,
          color: '#9A2C14',
          fontFamily: 'var(--font-heading)'
        }}>
          {isBn
            ? 'সিমুলেটেড সতর্কতা ব্যবস্থা — কোনো লাইভ সরকারি সিস্টেম পর্যবেক্ষণ করা হচ্ছে না।'
            : 'SIMULATED EVENT MONITORING — No live government system is being observed.'}
        </span>
      </div>

      <ApiErrorNotice error={error} onRetry={loadGuardianData} title={isBn ? 'ল্যান্ড গার্ডিয়ান সেবা সাময়িকভাবে উপলব্ধ নয়' : 'Land Guardian Service Unavailable'} />

      {/* Simulation Command Center Card */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid var(--line)',
        boxShadow: '0 1px 3px rgba(16, 39, 42, 0.05)',
        padding: '20px 24px',
        marginBottom: '28px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--line)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#B45309',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              {isBn ? 'সিমুলেশন কন্ট্রোল' : 'SIMULATION'}
            </span>
            <h2 style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              margin: 0
            }}>
              {isBn ? 'সিমুলেশন সিনারিও কমান্ড সেন্টার' : 'Simulation Scenario Hub'}
            </h2>
          </div>
          <span style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            background: 'var(--ground)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            color: 'var(--muted)',
            fontWeight: 700
          }}>
            EVENT GENERATOR
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '16px',
          alignItems: 'flex-end'
        }}>
          <div>
            <label htmlFor="simulation-scenario-select" style={{
              display: 'block',
              fontSize: '0.84rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--ink)',
              marginBottom: '6px'
            }}>
              {isBn ? 'সিমুলেশন সিনারিও নির্বাচন করুন:' : 'Select Simulation Scenario:'}
            </label>
            <select
              id="simulation-scenario-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer'
              }}
            >
              {eventsCatalog.map(evt => (
                <option key={evt.event_id} value={evt.event_id}>
                  {evt.event_id}: {isBn ? evt.title_bn : evt.title_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              id="trigger-simulation-btn"
              type="button"
              onClick={handleTriggerSimulation}
              disabled={isSimulating}
              style={{
                height: '44px',
                padding: '0 20px',
                fontSize: '0.92rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                border: 'none',
                background: 'var(--accent)',
                color: 'var(--white)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={15} className={isSimulating ? 'spin' : ''} />
              <span>{isBn ? 'সিমুলেশন ইভেন্ট শুরু করুন' : 'Trigger Simulated Event'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts List */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '1.18rem',
            fontWeight: 800,
            color: 'var(--ink)',
            fontFamily: 'var(--font-heading)',
            margin: 0
          }}>
            {isBn ? 'সক্রিয় সিমুলেটেড সতর্কতা সমূহ' : 'Active Simulated Alerts'}
          </h2>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
            color: 'var(--muted)',
            fontWeight: 700
          }}>
            {activeAlerts.length} {isBn ? 'টি সতর্কতা' : 'alerts'}
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-std)',
            border: '1px solid var(--line)',
            padding: '36px 20px',
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            <Bell size={28} style={{ margin: '0 auto 8px', color: 'var(--muted)' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {isBn 
                ? 'বর্তমানে কোনো সিমুলেটেড সতর্কতা নেই। ওপরের কমান্ড সেন্টার থেকে একটি ইভেন্ট শুরু করুন।' 
                : 'No active simulated alerts. Trigger an event from the command center above.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeAlerts.map((alert) => {
              const isReviewed = alert.is_reviewed;

              return (
                <div
                  key={alert.alert_id}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-std)',
                    border: '1px solid var(--line)',
                    boxShadow: '0 1px 3px rgba(16, 39, 42, 0.04)',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Alert Header Row */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--line)',
                    background: isReviewed ? 'var(--paper)' : '#FFFAF5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: '#B45309',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.4px'
                      }}>
                        {isBn ? 'সিমুলেটেড' : 'SIMULATED'}
                      </span>
                      <strong style={{
                        fontSize: '1rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--ink)'
                      }}>
                        {isBn ? alert.title_bn : alert.title_en}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.76rem',
                        color: 'var(--muted)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <Clock size={13} />
                        <span>{alert.timestamp || 'N/A'}</span>
                      </div>

                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isReviewed ? 'var(--status-matched-bg)' : 'var(--status-review-bg)',
                        color: isReviewed ? 'var(--status-matched-text)' : 'var(--status-review-text)',
                        border: isReviewed ? '1px solid var(--status-matched-border)' : '1px solid var(--status-review-border)'
                      }}>
                        {isReviewed ? (isBn ? '✓ পর্যালোচিত' : 'Reviewed') : (isBn ? 'সক্রিয় পর্যালোচনা' : 'Active')}
                      </span>
                    </div>
                  </div>

                  {/* Alert Body Snippet */}
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--ink-soft)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.55,
                      margin: '0 0 14px'
                    }}>
                      {isBn ? alert.description_bn : alert.description_en}
                    </p>

                    {/* Quick Diff Pill Tags */}
                    {alert.diff_report && alert.diff_report.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '16px'
                      }}>
                        {alert.diff_report.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--paper)',
                              border: '1px solid var(--line)',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--ink)'
                            }}
                          >
                            <span>{d.field}:</span>
                            <span style={{ color: 'var(--muted)' }}>{String(d.old_value)}</span>
                            <ArrowRightLeft size={12} style={{ color: 'var(--primary-accent)' }} />
                            <strong style={{ color: '#B45309' }}>{String(d.new_value)}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--line)'
                    }}>
                      <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                        {isBn ? 'প্লট আইডি:' : 'Plot ID:'} <strong>{alert.record_id}</strong>
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Detail Modal Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedAlertForModal(alert)}
                          style={{
                            height: '38px',
                            padding: '0 14px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            borderRadius: 'var(--radius-std)',
                            border: '1px solid var(--line)',
                            background: 'var(--paper)',
                            color: 'var(--ink)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{isBn ? 'বিস্তারিত পরিবর্তন দেখুন' : 'View Full Details'}</span>
                          <ExternalLink size={14} />
                        </button>

                        {/* Inline Review Toggle */}
                        <button
                          type="button"
                          id={`mark-reviewed-${alert.alert_id}`}
                          onClick={() => handleMarkReviewed(alert.alert_id)}
                          disabled={isReviewed}
                          style={{
                            height: '38px',
                            padding: '0 14px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            borderRadius: 'var(--radius-std)',
                            border: isReviewed ? '1px solid var(--status-matched-border)' : '1px solid var(--accent)',
                            background: isReviewed ? 'var(--status-matched-bg)' : 'var(--accent)',
                            color: isReviewed ? 'var(--status-matched-text)' : 'var(--white)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: isReviewed ? 'default' : 'pointer'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {isReviewed 
                              ? (isBn ? '✓ পর্যালোচিত' : '✓ Reviewed')
                              : (isBn ? 'পর্যালোচিত চিহ্নিত করুন' : 'Mark Reviewed')}
                          </span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Details Modal Popup */}
      <GuardianAlertModal
        isOpen={Boolean(selectedAlertForModal)}
        alert={selectedAlertForModal}
        onClose={() => setSelectedAlertForModal(null)}
        onMarkReviewed={handleMarkReviewed}
        lang={lang}
      />
    </div>
  );
}
