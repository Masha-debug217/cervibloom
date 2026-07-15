import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const SYMPTOM_OPTIONS = [
  'Unusual vaginal bleeding', 'Pelvic pain', 'Pain during intercourse', 'Unusual discharge',
];

export default function Dashboard() {
  const [checked, setChecked] = useState([]);
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [saved, setSaved] = useState(false);

  function loadLogs() {
    client.get('/symptom-logs/').then(res => setLogs(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadLogs();
    client.get('/screening-reminders/').then(res => setReminder(res.data[0] || null)).catch(() => {});
  }, []);

  function toggle(s) {
    setChecked(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function save() {
    await client.post('/symptom-logs/', { symptoms: checked.join(', '), notes });
    setSaved(true);
    setChecked([]); setNotes('');
    loadLogs();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Your Dashboard</h2>
      </div>
      <div className="dash-grid">
        <div className="panel">
          <h3>Log a symptom</h3>
          {SYMPTOM_OPTIONS.map(s => (
            <div className="check-row" key={s}>
              <input type="checkbox" checked={checked.includes(s)} onChange={() => toggle(s)} /> {s}
            </div>
          ))}
          <label style={{ display: 'block', marginTop: 12 }}>Additional notes</label>
          <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional details..." />
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={save}>
            {saved ? 'Saved ✓' : 'Save entry'}
          </button>
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
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No reminder set yet — an admin can add one via the Django admin panel.</p>
            )}
            <Link className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }} to="/directory">Find a center near me</Link>
          </div>
          <div className="panel">
            <h3>Screening history</h3>
            {logs.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>No entries logged yet.</p>}
            {logs.map(l => (
              <div className="check-row" key={l.id} style={{ borderBottom: 'none' }}>
                {l.symptoms || 'No symptoms'} — {new Date(l.created_at).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
