import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Articles() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const sw = language === 'sw';
  const [tab, setTab] = useState('all'); // all | saved
  const [articles, setArticles] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError('');
    if (tab === 'saved' && !user) {
      setArticles([]);
      return;
    }
    const endpoint = tab === 'saved' ? '/articles/bookmarked/' : '/articles/';
    client.get(endpoint).then(res => setArticles(res.data))
      .catch(() => setError(t('articles_error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  useEffect(() => { load(); }, [load]);

  async function toggleBookmark(id) {
    setBusyId(id);
    try {
      const res = await client.post(`/articles/${id}/toggle_bookmark/`);
      if (tab === 'saved' && !res.data.is_bookmarked) {
        setArticles(prev => prev.filter(a => a.id !== id));
      } else {
        setArticles(prev => prev.map(a => (a.id === id ? { ...a, is_bookmarked: res.data.is_bookmarked } : a)));
      }
    } catch {
      setError(t('articles_bookmark_error'));
    } finally {
      setBusyId(null);
    }
  }

  const articleText = (a) => ({
    title: (sw && a.title_sw) || a.title,
    summary: (sw && a.summary_sw) || a.summary,
    body: (sw && a.body_sw) || a.body,
  });

  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('articles_title')}</h2>
        <p>{t('articles_sub')}</p>
      </div>

      <div className="tabs" style={{ maxWidth: 360 }}>
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>{t('articles_tab_all')}</button>
        <button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>{t('articles_tab_saved')}</button>
      </div>

      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {tab === 'saved' && !user && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('articles_bookmark_sign_in')}{' '}
            <Link to="/auth" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav_signin')}</Link>
          </p>
        )}

        {(tab === 'all' || user) && articles.length === 0 && !error && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            {tab === 'saved' ? t('articles_empty_saved') : t('articles_empty')}
          </p>
        )}

        {articles.map(a => {
          const { title, summary, body } = articleText(a);
          const open = openId === a.id;
          return (
            <div className="panel" key={a.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <h3 style={{ margin: 0 }}>{title}</h3>
                {user ? (
                  <button
                    className="btn btn-outline"
                    style={{ padding: '5px 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                    disabled={busyId === a.id}
                    onClick={() => toggleBookmark(a.id)}
                  >
                    {a.is_bookmarked ? t('articles_bookmark_saved') : t('articles_bookmark_save')}
                  </button>
                ) : (
                  <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {t('articles_bookmark_sign_in')}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>{summary}</p>

              {open && (
                <>
                  <p style={{ whiteSpace: 'pre-line', fontSize: 14.5, lineHeight: 1.7 }}>{body}</p>
                  {a.source_name && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {t('articles_source_label')}{' '}
                      {a.source_url ? (
                        <a href={a.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{a.source_name}</a>
                      ) : a.source_name}
                    </p>
                  )}
                </>
              )}

              <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => setOpenId(open ? null : a.id)}>
                {open ? t('articles_read_less') : t('articles_read_more')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
