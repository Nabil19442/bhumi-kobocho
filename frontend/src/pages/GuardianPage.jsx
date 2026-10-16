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
  ArrowRightLeft
} from 'lucide-react';
import { fetchSimulationEvents, triggerSimulationApi, fetchGuardianAlerts, markAlertReviewedApi } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function GuardianPage({ t, lang = 'bn' }) {
  const isBn = lang === 'bn';
  const [eventsCatalog, setEventsCatalog] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('evt-001');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
        border: '1.5px solid #F3BFB3',
        borderRadius: 'var(--radius-std)',
        padding: '12px 18px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ShieldAlert size={18} style={{ color: '#9A2C14', flexShrink: 0 }} />
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#9A2C14',
          fontFamily: 'var(--font-heading)'
        }}>
          {isBn
            ? 'সিমুলেটেড ঘটনা — কোনো সরকারি সিস্টেম পর্যবেক্ষণ করা হচ্ছে না।'
            : 'SIMULATED EVENT — No live government system is being monitored.'}
        </span>
      </div>

      <ApiErrorNotice error={error} onRetry={loadGuardianData} title={isBn ? 'ল্যান্ড গার্ডিয়ান সেবা সাময়িকভাবে উপলব্ধ নয়' : 'Land Guardian Service Unavailable'} />

      {/* Simulation Command Center Card */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-std)',
        border: '1px solid #CAD7CF',
        boxShadow: 'var(--shadow-hard-sm)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid #CAD7CF',
          marginBottom: '20px'
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
            <h3 style={{
              fontSize: '1.14rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: 0
            }}>
              {isBn ? 'সিমুলেশন সিনারিও কমান্ড সেন্টার' : 'Simulation Scenario Hub'}
            </h3>
          </div>
          <span style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            background: 'var(--ground)',
            border: '1px solid #CBD8D2',
            borderRadius: '4px',
            color: 'var(--muted)',
            fontWeight: 700
          }}>
            EVENT GENERATOR
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'flex-end'
        }}>
          <div className="form-field">
            <label htmlFor="simulation-scenario-select" style={{
              display: 'block',
              fontSize: '0.86rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
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
                height: '46px',
                padding: '0 12px',
                borderRadius: 'var(--radius-std)',
                border: '1.5px solid #CAD7CF',
                background: 'var(--paper)',
                color: 'var(--text-main)',
                fontSize: '0.94rem',
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
              className="btn-primary"
              onClick={handleTriggerSimulation}
              disabled={isSimulating}
              style={{
                width: '100%',
                height: '46px',
                fontSize: '0.96rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                borderRadius: 'var(--radius-std)',
                boxShadow: 'var(--shadow-hard-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              <RefreshCw size={16} className={isSimulating ? 'spin' : ''} />
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
            fontSize: '1.24rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)',
            margin: 0
          }}>
            {isBn ? 'সক্রিয় সিমুলেটেড সতর্কতা সমূহ' : 'Active Simulated Alerts'}
          </h2>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
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
            border: '1px solid #CAD7CF',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            <Bell size={32} style={{ margin: '0 auto 10px', color: '#9AAFAA' }} />
            <p style={{ margin: 0, fontSize: '0.92rem' }}>
              {isBn 
                ? 'বর্তমানে কোনো সিমুলেটেড সতর্কতা নেই। ওপরের কমান্ড সেন্টার থেকে একটি ইভেন্ট শুরু করুন।' 
                : 'No active simulated alerts. Trigger an event from the command center above.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeAlerts.map((alert) => {
              const isReviewed = alert.is_reviewed;

              return (
                <div
                  key={alert.alert_id}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-std)',
                    border: '1.5px solid var(--text-main)',
                    boxShadow: 'var(--shadow-hard)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Alert Header Bar */}
                  <div style={{
                    background: '#FFF4E5',
                    borderBottom: '1px solid #FFE0B2',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
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
                        {isBn ? 'সিমুলেটেড ঘটনা' : 'SIMULATED'}
                      </span>
                      <strong style={{
                        fontSize: '1rem',
                        fontFamily: 'var(--font-heading)',
                        color: '#9A3412'
                      }}>
                        {isBn ? alert.title_bn : alert.title_en}
                      </strong>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.78rem',
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <Clock size={14} />
                      <span>{alert.timestamp || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Alert Content */}
                  <div style={{ padding: '24px' }}>
                    <p style={{
                      fontSize: '0.94rem',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.6,
                      marginBottom: '20px'
                    }}>
                      {isBn ? alert.description_bn : alert.description_en}
                    </p>

                    {/* Diff Reports Grid */}
                    {alert.diff_report && alert.diff_report.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '16px',
                        marginBottom: '20px'
                      }}>
                        {alert.diff_report.map((diff, dIdx) => (
                          <div
                            key={dIdx}
                            style={{
                              background: '#F8FAF8',
                              border: '1px solid #CAD7CF',
                              borderRadius: 'var(--radius-std)',
                              padding: '14px'
                            }}
                          >
                            <span style={{
                              fontSize: '0.74rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--muted)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              display: 'block',
                              marginBottom: '6px'
                            }}>
                              {isBn ? 'পরিবর্তিত ক্ষেত্র:' : 'Changed Field:'} {diff.field}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'block' }}>
                                  {isBn ? 'পূর্বের মান:' : 'Old Value:'}
                                </span>
                                <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                                  {String(diff.old_value)}
                                </strong>
                              </div>
                              <ArrowRightLeft size={16} color="var(--primary-accent)" />
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.7rem', color: '#B45309', display: 'block' }}>
                                  {isBn ? 'নতুন মান:' : 'New Value:'}
                                </span>
                                <strong style={{ fontSize: '0.94rem', color: '#B45309', fontFamily: 'var(--font-mono)' }}>
                                  {String(diff.new_value)}
                                </strong>
                              </div>
                            </div>
                            {(diff.note_bn || diff.note_en) && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #CBD8D2' }}>
                                {isBn ? diff.note_bn : diff.note_en}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Citizen Action Recommendation */}
                    {(alert.action_recommendation_bn || alert.action_recommendation_en) && (
                      <div style={{
                        background: '#EBF3FB',
                        border: '1px solid #C4D6F5',
                        borderRadius: 'var(--radius-std)',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <Info size={16} style={{ color: 'var(--primary-accent)', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          <strong>{isBn ? 'নাগরিকের করণীয়:' : 'Recommended Action:'} </strong>
                          {isBn ? alert.action_recommendation_bn : alert.action_recommendation_en}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Row: Review Toggle */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid #E3EAE6'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                        {isBn ? 'প্লট আইডি:' : 'Plot ID:'} {alert.record_id}
                      </span>

                      <button
                        type="button"
                        id={`mark-reviewed-${alert.alert_id}`}
                        onClick={() => handleMarkReviewed(alert.alert_id)}
                        disabled={isReviewed}
                        style={{
                          height: '42px',
                          padding: '0 16px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-heading)',
                          borderRadius: 'var(--radius-std)',
                          border: isReviewed ? '1.5px solid #14633A' : '1.5px solid var(--text-main)',
                          background: isReviewed ? 'var(--status-matched-bg)' : '#FFFFFF',
                          color: isReviewed ? 'var(--status-matched-text)' : 'var(--text-main)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isReviewed ? 'default' : 'pointer',
                          minHeight: '44px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>
                          {isReviewed 
                            ? (isBn ? '✓ পর্যালোচিত হয়েছে (Reviewed)' : '✓ Reviewed')
                            : (isBn ? 'পর্যালোচিত হিসেবে চিহ্নিত করুন' : 'Mark as Reviewed')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
