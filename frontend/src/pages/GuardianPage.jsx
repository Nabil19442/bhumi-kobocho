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
  RotateCw,
  RefreshCw
} from 'lucide-react';
import { fetchSimulationEvents, triggerSimulationApi, fetchGuardianAlerts, markAlertReviewedApi } from '../api';
import ApiErrorNotice from '../components/ApiErrorNotice';

export default function GuardianPage({ t, lang }) {
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
      <div className="page-header-block">
        <h2 className="page-title">
          <ShieldAlert size={28} style={{ color: 'var(--cyan-secondary)' }} />
          {t.guardian_heading}
        </h2>
        <p className="page-subtitle">{t.guardian_subheading}</p>
      </div>

      <ApiErrorNotice error={error} onRetry={loadGuardianData} title="Land Guardian Service Unavailable" />

      {/* Simulation Command Center */}
      <div className="saas-card" style={{ border: '1px solid var(--cyan-border)' }}>
        <div className="saas-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-pill simulated">
              <Radio size={12} className="spin" />
              {t.simulated_badge}
            </span>
            <h3 className="saas-card-title">
              {t.simulation_hub_title}
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            DEMO ONLY &bull; NO LIVE GOVT CONNECTIONS
          </span>
        </div>

        <div className="grid-cols-2" style={{ alignItems: 'flex-end' }}>
          <div className="form-field">
            <label className="field-label-row" htmlFor="simulation-event-picker">
              <span>{t.select_simulation_scenario}</span>
            </label>
            <select
              id="simulation-event-picker"
              className="field-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {eventsCatalog.map(evt => (
                <option key={evt.event_id} value={evt.event_id}>
                  {evt.event_id}: {lang === 'bn' ? evt.title_bn : evt.title_en} ({evt.record_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              id="trigger-simulation-btn"
              className="btn-primary"
              style={{ background: 'var(--cyan-secondary)', color: '#090D16', width: '100%', boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)' }}
              onClick={handleTriggerSimulation}
              disabled={isSimulating}
            >
              <RotateCw size={15} className={isSimulating ? 'spin' : ''} />
              <span>{isSimulating ? 'Simulating Event...' : t.trigger_event_btn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Alerts Feed */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 className="saas-card-title" style={{ fontSize: '1.15rem' }}>
            {t.active_simulated_alerts} ({activeAlerts.length})
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t.chronological_notifications}
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="saas-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px' }}>
            No simulated alerts triggered yet. Select an event scenario above and click Trigger.
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div
              key={alert.alert_id}
              id={`alert-card-${alert.alert_id}`}
              className="saas-card"
              style={{
                borderLeft: alert.is_reviewed ? '4px solid var(--emerald-primary)' : '4px solid var(--rose-mismatch)',
              }}
            >
              <div className="saas-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="status-pill simulated">
                    {alert.badge || 'SIMULATED DEMO ALERT'}
                  </span>
                  <span className="code-badge">Plot: {alert.record_id}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div>
                  {alert.is_reviewed ? (
                    <span className="status-pill matched">
                      <CheckCircle2 size={13} /> {t.reviewed}
                    </span>
                  ) : (
                    <button
                      id={`mark-reviewed-${alert.alert_id}`}
                      className="btn-secondary"
                      style={{ height: '34px', fontSize: '0.8rem', padding: '0 12px' }}
                      onClick={() => handleMarkReviewed(alert.alert_id)}
                    >
                      <CheckCircle2 size={14} style={{ color: 'var(--emerald-light)' }} />
                      <span>{t.mark_reviewed}</span>
                    </button>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                {lang === 'bn' ? alert.title_bn : alert.title_en}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: '16px' }}>
                {lang === 'bn' ? alert.description_bn : alert.description_en}
              </p>

              {/* Old vs New Value Diff Table */}
              <div className="saas-table-wrapper" style={{ marginBottom: '14px' }}>
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>{t.changed_field}</th>
                      <th>{t.old_val} (Old)</th>
                      <th>{t.new_val} (New)</th>
                      <th>{t.observation_note}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alert.diff_report?.map((diff, dIdx) => (
                      <tr key={dIdx}>
                        <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{diff.field}</td>
                        <td>
                          <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontFamily: 'monospace' }}>
                            {String(diff.old_value)}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--crimson-text, #C0392B)', fontFamily: 'monospace' }}>
                            {String(diff.new_value)}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                            {lang === 'bn' ? diff.note_bn : diff.note_en}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Citizen Action Recommendation */}
              <div style={{
                background: '#EDF7ED',
                border: '1px solid #C8E6C9',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={18} style={{ color: '#2E7D32', flexShrink: 0 }} />
                <div style={{ fontSize: '0.84rem', color: 'var(--ink)' }}>
                  <strong style={{ color: '#1B5E20' }}>{t.citizen_recommendation}:</strong>{' '}
                  <span style={{ color: 'var(--ink-soft)' }}>
                    {lang === 'bn' ? alert.action_recommendation_bn : alert.action_recommendation_en}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
