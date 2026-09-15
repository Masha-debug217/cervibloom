import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const TIER_STYLE = {
  ROUTINE: { bg: 'var(--surface-alt)', accent: 'var(--text-secondary)' },
  DISCUSS: { bg: 'var(--primary-tint)', accent: 'var(--primary)' },
  SEEK_CARE: { bg: 'var(--primary-tint)', accent: 'var(--primary)' },
};

const APPOINTMENT_STATUS_STYLE = {
  PENDING: { bg: 'var(--surface-alt)', accent: 'var(--text-secondary)' },
  CONFIRMED: { bg: 'var(--primary-tint)', accent: 'var(--primary)' },
  DECLINED: { bg: 'var(--surface-alt)', accent: '#b3261e' },
  COMPLETED: { bg: 'var(--surface-alt)', accent: 'var(--text-secondary)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const sw = language === 'sw';
  const [questions, setQuestions] = useState([]);
  const [tiers, setTiers] = useState({});
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function loadLogs() {
    client.get('/symptom-logs/').then(res => setLogs(res.data)).catch(() => {});
  }

  useEffect(() => {
    client.get('/symptom-logs/questions/')
      .then(res => { setQuestions(res.data.questions); setTiers(res.data.tiers); })
      .catch(() => setError(t('dashboard_error_questions')));
    loadLogs();
    client.get('/screening-reminders/').then(res => setReminder(res.data[0] || null)).catch(() => {});
    client.get('/facilities/').then(res => setFacilities(res.data)).catch(() => {});
    client.get('/appointment-requests/').then(res => setAppointments(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setAnswer(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.key] === 'yes' || answers[q.key] === 'no');

  async function submit() {
    setError(''); setSubmitting(true);
    const payload = {
      answers: Object.fromEntries(questions.map(q => [q.key, answers[q.key] === 'yes'])),
      notes,
    };
    try {
      const res = await client.post('/symptom-logs/', payload);
      setResult(res.data);
      setAnswers({}); setNotes('');
      loadLogs();
    } catch {
      setError(t('dashboard_error_submit'));
    } finally {
      setSubmitting(false);
    }
  }

  // "Nearest" facility: same county as the patient's profile if we have one,
  // otherwise just the first known facility so the high-risk result still
  // points somewhere concrete.
  const nearestFacility =
    facilities.find(f => user?.county && f.county?.toLowerCase() === user.county.toLowerCase()) ||
    facilities[0] ||
    null;

  // Rebuilds the "irregular bleeding, pelvic/back pain" summary from the
  // raw answers instead of the server's stored (English-only) snapshot, so
  // past Navigator entries also read correctly in Kiswahili.
  function symptomSummary(log) {
    const yesKeys = questions.filter(q => log.answers?.[q.key] === true).map(q => q.key);
    if (yesKeys.length === 0) return log.symptoms || t('dashboard_no_symptoms');
    return questions
      .filter(q => yesKeys.includes(q.key))
      .map(q => (sw && q.short_label_sw) || q.short_label)
      .join(', ');
  }

  const tier = tiers[result?.risk_tier];
  const tierLabel = tier ? ((sw && tier.label_sw) || tier.label) : result?.risk_tier;
  const tierGuidance = tier ? ((sw && tier.guidance_sw) || tier.guidance) : '';

  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('dashboard_title')}</h2>
        <p>{t('dashboard_sub')}</p>
      </div>
      <div className="dash-grid">
        <div className="panel">
          <h3>{t('dashboard_navigator_heading')}</h3>
          {error && <div className="error-box">{error}</div>}

          {!result && questions.map(q => (
            <div key={q.key} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13.5, marginBottom: 8 }}>{(sw && q.text_sw) || q.text}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['yes', 'no'].map(v => (
                  <button
                    key={v}
                    type="button"
                    className={answers[q.key] === v ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ padding: '6px 18px' }}
                    onClick={() => setAnswer(q.key, v)}
                  >
                    {v === 'yes' ? t('dashboard_yes') : t('dashboard_no')}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!result && (
            <>
              <label style={{ display: 'block', marginTop: 12 }}>{t('dashboard_notes_label')}</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('dashboard_notes_placeholder')} />
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                onClick={submit}
                disabled={!allAnswered || submitting}
              >
                {submitting ? t('dashboard_submit_checking') : allAnswered ? t('dashboard_submit_ready') : t('dashboard_submit_incomplete')}
              </button>
            </>
          )}

          {result && (
            <div>
              <div style={{
                background: (TIER_STYLE[result.risk_tier] || TIER_STYLE.ROUTINE).bg,
                borderLeft: `4px solid ${(TIER_STYLE[result.risk_tier] || TIER_STYLE.ROUTINE).accent}`,
                borderRadius: 10, padding: '14px 16px', marginBottom: 14,
              }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: (TIER_STYLE[result.risk_tier] || TIER_STYLE.ROUTINE).accent }}>
                  {tierLabel}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.55 }}>
                  {tierGuidance}
                </div>
              </div>

              {result.risk_tier === 'SEEK_CARE' && nearestFacility && (
                <div className="facility-card" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="fname">{nearestFacility.name}</div>
                    <div className="fmeta">{nearestFacility.county} {t('directory_county_suffix')} · {t('dashboard_nearest_facility')}</div>
                  </div>
                  <a
                    className="btn btn-outline"
                    href={nearestFacility.latitude && nearestFacility.longitude
                      ? `https://www.google.com/maps?q=${nearestFacility.latitude},${nearestFacility.longitude}`
                      : '#'}
                    target="_blank" rel="noreferrer"
                  >
                    {t('dashboard_get_directions')}
                  </a>
                </div>
              )}

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setResult(null)}>
                {t('dashboard_start_another')}
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <h3>{t('dashboard_reminder_heading')}</h3>
            {reminder ? (
              <div className="reminder-badge">
                <div>
                  <div className="rdate">{t('dashboard_reminder_due')} {reminder.next_due_date}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{reminder.guidance_note}</div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{t('dashboard_reminder_empty')}</p>
            )}
            <Link className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }} to="/directory">{t('dashboard_find_center')}</Link>
          </div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <h3>{t('dashboard_appointments_heading')}</h3>
            {appointments.length === 0 ? (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{t('dashboard_appointments_empty')}</p>
            ) : (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('dashboard_appointment_note')}</p>
                {appointments.map(a => {
                  const style = APPOINTMENT_STATUS_STYLE[a.status] || APPOINTMENT_STATUS_STYLE.PENDING;
                  const statusKey = `dashboard_appointment_status_${a.status.toLowerCase()}`;
                  return (
                    <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.facility_name}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            {a.preferred_date}{a.preferred_time ? `, ${a.preferred_time}` : ''}
                          </div>
                          {a.admin_note && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.admin_note}</div>
                          )}
                        </div>
                        <span style={{
                          fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                          background: style.bg, color: style.accent, whiteSpace: 'nowrap',
                        }}>
                          {t(statusKey)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="panel">
            <h3>{t('dashboard_history_heading')}</h3>
            {logs.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{t('dashboard_history_empty')}</p>}
            {logs.map(l => {
              const logTier = tiers[l.risk_tier];
              const logTierLabel = logTier ? ((sw && logTier.label_sw) || logTier.label) : (l.risk_tier || 'n/a');
              return (
                <div key={l.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span className="tag" style={{ marginRight: 8 }}>{logTierLabel}</span>
                  {symptomSummary(l)}
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{new Date(l.created_at).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
