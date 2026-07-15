import { useEffect, useState } from 'react';
import client from '../api/client';

export default function InfoHub() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/faqs/').then(res => setFaqs(res.data))
      .catch(() => setError('Could not load Info Hub content. Is the backend running?'));
  }, []);

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Info Hub</h2>
        <p>Plain-English, medically grounded answers — no jargon, no scare tactics.</p>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {faqs.length === 0 && !error && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No content yet — add FAQItems in the Django admin panel.</p>}
        {faqs.map(f => (
          <div className="faq-item" key={f.id}>
            <div className="faq-q" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
              {f.question}<span>{openId === f.id ? '▲' : '▼'}</span>
            </div>
            {openId === f.id && <div className="faq-a">{f.answer}</div>}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 520, margin: '32px auto 0', display: 'flex', gap: 8 }}>
        <input type="text" placeholder="Ask a question about HPV or screening..." disabled style={{ flex: 1 }} />
        <button className="btn btn-primary" disabled>Ask</button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
        Planned for a future phase: AI-assisted Q&amp;A grounded in the verified content above.
      </p>
    </div>
  );
}
