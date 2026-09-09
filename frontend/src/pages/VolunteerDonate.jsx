import { useState } from 'react';
import client from '../api/client';

export default function VolunteerDonate() {
  const [tab, setTab] = useState('volunteer');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(1000);
  const [volDone, setVolDone] = useState(false);
  const [donDone, setDonDone] = useState(false);
  const [error, setError] = useState('');

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
      await client.post('/donations/', { amount_kes: amount });
      setDonDone(true);
    } catch {
      setError('Could not submit — make sure you are logged in.');
    }
  }

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
          {volDone && <div className="success-box">Thanks — your volunteer application has been received.</div>}
        </form>
      )}

      {tab === 'donate' && (
        <form className="form-card" onSubmit={submitDonation}>
          <label>Amount (KES)</label>
          <div style={{ display: 'flex', gap: 8, margin: '8px 0 14px', flexWrap: 'wrap' }}>
            {[500, 1000, 2500, 5000].map(a => (
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
          <div className="field">
            <label>Custom amount</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>Donate (simulated)</button>
          {donDone && <div className="success-box">This is a simulated transaction — no real payment was processed.</div>}
        </form>
      )}
    </div>
  );
}
