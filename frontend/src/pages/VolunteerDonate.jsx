import { useEffect, useState } from 'react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

const PRESETS = [500, 1000, 2500, 5000];

// Illustrative only - approximate reasoning, not audited real-world unit
// costs. The disclaimer under the form says so.
const IMPACT = {
  en: {
    500: 'Roughly covers transport for one woman to reach a screening clinic and back.',
    1000: 'About the cost of one VIA screening visit, consumables included.',
    2500: 'Helps run a small community outreach session reaching a dozen or so women.',
    5000: 'Supports an HPV vaccine awareness drive for a class of adolescent girls.',
  },
  sw: {
    500: 'Inagharamia takribani nauli ya mwanamke mmoja kufika kliniki ya uchunguzi na kurudi.',
    1000: 'Karibu na gharama ya ziara moja ya uchunguzi wa VIA, ikiwemo vifaa.',
    2500: 'Husaidia kuendesha kikao kidogo cha uhamasishaji jamii kinachofikia wanawake kumi na wachache.',
    5000: 'Inasaidia kampeni ya uhamasishaji wa chanjo ya HPV kwa darasa la wasichana balehe.',
  },
};

export default function VolunteerDonate() {
  const { language, t } = useLanguage();
  const impact = IMPACT[language] || IMPACT.en;
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
      setError(err.response?.data?.detail || t('vd_error_volunteer'));
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
      setError(t('vd_error_donate'));
    }
  }

  const totalGiven = history.reduce((sum, d) => sum + Number(d.amount_kes), 0);

  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('vd_title')}</h2>
        <p>{t('vd_sub')}</p>
      </div>
      <div className="tabs">
        <button className={tab === 'volunteer' ? 'active' : ''} onClick={() => setTab('volunteer')}>{t('vd_tab_volunteer')}</button>
        <button className={tab === 'donate' ? 'active' : ''} onClick={() => setTab('donate')}>{t('vd_tab_donate')}</button>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 480, margin: '0 auto 14px' }}>{error}</div>}

      {tab === 'volunteer' && (
        <form className="form-card" onSubmit={submitVolunteer}>
          <div className="field">
            <label>{t('vd_volunteer_question')}</label>
            <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>{t('vd_volunteer_submit')}</button>
          {volDone && <div className="success-box">{t('vd_volunteer_success')}</div>}
        </form>
      )}

      {tab === 'donate' && (
        <div className="form-card" style={{ maxWidth: 520 }}>
          <form onSubmit={submitDonation}>
            <label>{t('vd_donate_amount_label')}</label>
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
            {impact[amount] && (
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                {impact[amount]}
              </p>
            )}
            <div className="field">
              <label>{t('vd_donate_custom_label')}</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14 }}>
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
              {t('vd_donate_anonymous')}
            </label>
            <button className="btn btn-primary" style={{ width: '100%' }}>{t('vd_donate_submit')}</button>
            {donDone && <div className="success-box">{t('vd_donate_success')}</div>}
          </form>

          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.5 }}>
            {t('vd_donate_disclaimer')}
          </p>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 14 }}>
            <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>{t('vd_history_heading')}</h3>
            {history.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('vd_history_empty')}</p>
            )}
            {history.length > 0 && (
              <>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {history.length} {t('vd_history_count_label')} · KES {totalGiven.toLocaleString()} {t('vd_history_total')}
                </div>
                {history.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>KES {Number(d.amount_kes).toLocaleString()}{d.is_anonymous && <span className="tag" style={{ marginLeft: 8 }}>{t('vd_anonymous_tag')}</span>}</span>
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
