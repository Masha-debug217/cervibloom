import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const TIER_STYLE = {
  ROUTINE: { bg: 'var(--surface-alt)', accent: 'var(--text-secondary)' },
  DISCUSS: { bg: 'var(--primary-tint)', accent: 'var(--primary)' },
  SEEK_CARE: { bg: 'var(--primary-tint)', accent: 'var(--primary)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [tiers, setTiers] = useState({});
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function loadLogs() {
    client.get('/symptom-logs/').then(res => setLogs(res.data)).catch(() => {});
  }

  useEffect(() => {
    client.get('/symptom-logs/questions/')
      .then(res => { setQuestions(res.data.questions); setTiers(res.data.tiers); })
      .catch(() => setError('Could not load the Symptom Navigator questions.'));
    loadLogs();
    client.get('/screening-reminders/').then(res => setReminder(res.data[0] || null)).catch(() => {});
    client.get('/facilities/').then(res => setFacilities(res.data)).catch(() => {});
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
      setError('Could not save your entry. Please try again.');
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

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Your Dashboard</h2>
        <p>The Symptom Navigator is an educational guide, not a diagnosis.</p>
      </div>
      <div className="dash-grid">
        <div className="panel">
          <h3>Symptom Navigator</h3>
          {error && <div className="error-box">{error}</div>}

          {!result && questions.map(q => (
            <div key={q.key} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13.5, marginBottom: 8 }}>{q.text}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['yes', 'no'].map(v => (
                  <button
                    key={v}
                    type="button"
                    className={answers[q.key] === v ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ padding: '6px 18px', textTransform: 'capitalize' }}
                    onClick={() => setAnswer(q.key, v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!result && (
            <>
              <label style={{ display: 'block', marginTop: 12 }}>Additional notes</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional details..." />
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                onClick={submit}
                disabled={!allAnswered || submitting}
              >
                {submitting ? 'Checking…' : allAnswered ? 'See guidance' : 'Answer every question to continue'}
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
                  {tiers[result.risk_tier]?.label || result.risk_tier}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.55 }}>
                  {tiers[result.risk_tier]?.guidance}
                </div>
              </div>

              {result.risk_tier === 'SEEK_CARE' && nearestFacility && (
                <div className="facility-card" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="fname">{nearestFacility.name}</div>
                    <div className="fmeta">{nearestFacility.county} County · nearest screening centre</div>
                  </div>
                  <a
                    className="btn btn-outline"
                    href={nearestFacility.latitude && nearestFacility.longitude
                      ? `https://www.google.com/maps?q=${nearestFacility.latitude},${nearestFacility.longitude}`
                      : '#'}
                    target="_blank" rel="noreferrer"
                  >
                    Get directions
                  </a>
                </div>
              )}

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setResult(null)}>
                Start another check
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <h3>Screening reminder</h3>
            {reminder ? (
              <div className="reminder-badge">
                <div>
                  <div className="rdate">Next screening due: {reminder.next_due_date}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{reminder.guidance_note}</div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No reminder set yet. An admin can add one for you.</p>
            )}
            <Link className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }} to="/directory">Find a center near me</Link>
          </div>
          <div className="panel">
            <h3>Navigator history</h3>
            {logs.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No entries logged yet.</p>}
            {logs.map(l => (
              <div key={l.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span className="tag" style={{ marginRight: 8 }}>{tiers[l.risk_tier]?.label || l.risk_tier || 'n/a'}</span>
                {l.symptoms || 'No symptoms'}
                <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
