import { useEffect, useState } from 'react';
import client from '../api/client';

const PRESETS = [500, 1000, 2500, 5000];

// Illustrative only - placeholder reasoning for this student project, not
// audited real-world unit costs. The disclaimer under the form says so.
const IMPACT = {
  500: 'Roughly covers transport for one woman to reach a screening clinic and back.',
  1000: 'About the cost of one VIA screening visit, consumables included.',
  2500: 'Helps run a small community outreach session reaching a dozen or so women.',
  5000: 'Supports an HPV vaccine awareness drive for a class of adolescent girls.',
};

export default function VolunteerDonate() {
  const [tab, setTab] = useState('volunteer');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(1000);
  const [anonymous, setAnonymous] = useState(false);
  const [volDone, setVolDone] = useState(false);
  const [donDone, setDonDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  function loadHistory() {
    client.get('/donations/').then(res => setHistory(res.data)).catch(() => {});
  }
  useEffect(() => { loadHistory(); }, []);

  async function submitVolunteer(e) {
    e.preventDefault();
    setError('');
    try {
      await client.post('/volunteer-applications/', { message });
      setVolDone(true); setMessage('');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Could not submit your application. Volunteer applications can only be sent from a Volunteer account.'
      );
    }
  }

  async function submitDonation(e) {
    e.preventDefault();
    setError('');
    try {
      await client.post('/donations/', { amount_kes: amount, is_anonymous: anonymous });
      setDonDone(true);
      loadHistory();
    } catch {
      setError('Could not submit. Make sure you are logged in.');
    }
  }

  const totalGiven = history.reduce((sum, d) => sum + Number(d.amount_kes), 0);

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Volunteer &amp; Donate</h2>
        <p>Partnering with local anti-cancer organizations, including the Africa Cancer Foundation.</p>
      </div>
      <div className="tabs">
        <button className={tab === 'volunteer' ? 'active' : ''} onClick={() => setTab('volunteer')}>Volunteer</button>
        <button className={tab === 'donate' ? 'active' : ''} onClick={() => setTab('donate')}>Donate</button>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 480, margin: '0 auto 14px' }}>{error}</div>}

      {tab === 'volunteer' && (
        <form className="form-card" onSubmit={submitVolunteer}>
          <div className="field">
            <label>Why do you want to volunteer?</label>
            <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>Submit application</button>
          {volDone && <div className="success-box">Thanks. Your volunteer application has been received.</div>}
        </form>
      )}

      {tab === 'donate' && (
        <div className="form-card" style={{ maxWidth: 520 }}>
          <form onSubmit={submitDonation}>
            <label>Amount (KES)</label>
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 10px', flexWrap: 'wrap' }}>
              {PRESETS.map(a => (
                <div key={a}
                  onClick={() => setAmount(a)}
                  style={{
                    padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                    border: `1px solid ${amount === a ? 'var(--primary)' : 'var(--border)'}`,
                    background: amount === a ? 'var(--primary)' : 'transparent',
                    color: amount === a ? 'white' : 'var(--text)',
                  }}>
                  {a}
                </div>
              ))}
            </div>
            {IMPACT[amount] && (
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                {IMPACT[amount]}
              </p>
            )}
            <div className="field">
              <label>Custom amount</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14 }}>
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
              Give anonymously (don't show my name in any acknowledgement)
            </label>
            <button className="btn btn-primary" style={{ width: '100%' }}>Donate (simulated)</button>
            {donDone && <div className="success-box">This is a simulated transaction. No real payment was processed.</div>}
          </form>

          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.5 }}>
            Impact figures above are illustrative estimates for this project, not audited costs.
          </p>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 14 }}>
            <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>My donation history</h3>
            {history.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No donations recorded yet.</p>
            )}
            {history.length > 0 && (
              <>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {history.length} donation{history.length > 1 ? 's' : ''} · KES {totalGiven.toLocaleString()} total (simulated)
                </div>
                {history.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>KES {Number(d.amount_kes).toLocaleString()}{d.is_anonymous && <span className="tag" style={{ marginLeft: 8 }}>anonymous</span>}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
