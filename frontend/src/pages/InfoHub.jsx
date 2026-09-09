import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function InfoHub() {
  const [faqs, setFaqs] = useState([]);
  const [myths, setMyths] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(null); // { results, suggestion } | null
  const [searching, setSearching] = useState(false);

  async function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await client.get('/faqs/search/', { params: { q: query } });
      setSearch(res.data);
    } catch {
      setSearch({ results: [], suggestion: 'Search is unavailable right now. Please try again later.' });
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    client.get('/faqs/').then(res => setFaqs(res.data))
      .catch(() => setError('Could not load Info Hub content. Is the backend running?'));
    client.get('/myths/').then(res => setMyths(res.data)).catch(() => {});
  }, []);

  return (
    <div className="page container">
      <div className="section-head">
        <h2>Info Hub</h2>
        <p>Plain-English, medically grounded answers with no jargon and no scare tactics.</p>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {faqs.length === 0 && !error && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No content yet. Add FAQ items in the Django admin panel.</p>}
        {faqs.map(f => (
          <div className="faq-item" key={f.id}>
            <div className="faq-q" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
              {f.question}<span>{openId === f.id ? '▲' : '▼'}</span>
            </div>
            {openId === f.id && <div className="faq-a">{f.answer}</div>}
          </div>
        ))}
      </div>

      {myths.length > 0 && (
        <div style={{ maxWidth: 640, margin: '40px auto 0' }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 21 }}>Myth vs. Fact</h2>
            <p>Tap a card to reveal what the evidence actually says.</p>
          </div>
          {myths.map(m => (
            <div className="faq-item" key={m.id}>
              <div className="faq-q" onClick={() => setRevealed(r => ({ ...r, [m.id]: !r[m.id] }))}>
                <span><span className="tag" style={{ marginRight: 8 }}>Myth</span>{m.myth}</span>
                <span>{revealed[m.id] ? '▲' : '▼'}</span>
              </div>
              {revealed[m.id] && (
                <div className="faq-a">
                  <strong style={{ color: 'var(--primary)' }}>Fact:</strong> {m.fact}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 520, margin: '40px auto 0' }}>
        <form onSubmit={runSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Ask a question about HPV or screening..."
            style={{ flex: 1 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" disabled={searching || !query.trim()}>
            {searching ? 'Searching…' : 'Ask'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          This searches the verified answers above by keyword. No AI is used, and nothing you type is stored.
        </p>

        {search && (
          <div style={{ marginTop: 16 }}>
            {search.results?.length > 0 && search.results.map(f => (
              <div className="faq-item" key={`s-${f.id}`}>
                <div className="faq-q" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
                  {f.question}<span>{openId === f.id ? '▲' : '▼'}</span>
                </div>
                {openId === f.id && <div className="faq-a">{f.answer}</div>}
              </div>
            ))}
            {search.suggestion && (
              <div className="error-box" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                {search.suggestion}{' '}
                <Link to="/directory" style={{ color: 'var(--primary)', fontWeight: 600 }}>Open the Screening Directory →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
