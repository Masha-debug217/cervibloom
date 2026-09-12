import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function InfoHub() {
  const { language, t } = useLanguage();
  const sw = language === 'sw';
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
      const res = await client.get('/faqs/search/', { params: { q: query, lang: language } });
      setSearch(res.data);
    } catch {
      setSearch({ results: [], suggestion: t('infohub_search_unavailable') });
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    client.get('/faqs/').then(res => setFaqs(res.data))
      .catch(() => setError(t('infohub_error')));
    client.get('/myths/').then(res => setMyths(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const faqText = (f) => ({
    question: (sw && f.question_sw) || f.question,
    answer: (sw && f.answer_sw) || f.answer,
  });
  const mythText = (m) => ({
    myth: (sw && m.myth_sw) || m.myth,
    fact: (sw && m.fact_sw) || m.fact,
  });

  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('infohub_title')}</h2>
        <p>{t('infohub_sub')}</p>
      </div>
      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {faqs.length === 0 && !error && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('infohub_empty')}</p>}
        {faqs.map(f => {
          const { question, answer } = faqText(f);
          return (
            <div className="faq-item" key={f.id}>
              <div className="faq-q" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
                {question}<span>{openId === f.id ? '▲' : '▼'}</span>
              </div>
              {openId === f.id && <div className="faq-a">{answer}</div>}
            </div>
          );
        })}
      </div>

      {myths.length > 0 && (
        <div style={{ maxWidth: 640, margin: '40px auto 0' }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 21 }}>{t('infohub_myth_title')}</h2>
            <p>{t('infohub_myth_sub')}</p>
          </div>
          {myths.map(m => {
            const { myth, fact } = mythText(m);
            return (
              <div className="faq-item" key={m.id}>
                <div className="faq-q" onClick={() => setRevealed(r => ({ ...r, [m.id]: !r[m.id] }))}>
                  <span><span className="tag" style={{ marginRight: 8 }}>{t('infohub_myth_tag')}</span>{myth}</span>
                  <span>{revealed[m.id] ? '▲' : '▼'}</span>
                </div>
                {revealed[m.id] && (
                  <div className="faq-a">
                    <strong style={{ color: 'var(--primary)' }}>{t('infohub_fact_label')}</strong> {fact}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ maxWidth: 520, margin: '40px auto 0' }}>
        <form onSubmit={runSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder={t('infohub_search_placeholder')}
            style={{ flex: 1 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" disabled={searching || !query.trim()}>
            {searching ? t('infohub_search_button_busy') : t('infohub_search_button')}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          {t('infohub_search_note')}
        </p>

        {search && (
          <div style={{ marginTop: 16 }}>
            {search.results?.length > 0 && search.results.map(f => {
              const { question, answer } = faqText(f);
              return (
                <div className="faq-item" key={`s-${f.id}`}>
                  <div className="faq-q" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
                    {question}<span>{openId === f.id ? '▲' : '▼'}</span>
                  </div>
                  {openId === f.id && <div className="faq-a">{answer}</div>}
                </div>
              );
            })}
            {search.suggestion && (
              <div className="error-box" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                {search.suggestion}{' '}
                <Link to="/directory" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('infohub_open_directory')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
