import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const STATUS_KEY = {
  PENDING: 'blog_status_pending',
  PUBLISHED: 'blog_status_published',
  REJECTED: 'blog_status_rejected',
};

export default function SurvivorBlog() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState('read');
  const [posts, setPosts] = useState([]);
  const [mine, setMine] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError('');
    client.get('/blog-posts/').then(res => {
      const all = res.data;
      setPosts(all.filter(p => p.status === 'PUBLISHED'));
      setMine(user ? all.filter(p => p.author_username === user.username) : []);
    }).catch(() => setError(t('blog_error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await client.post('/blog-posts/', { title, body });
      setTitle(''); setBody(''); setSubmitted(true);
      load();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : t('blog_submit_error'));
    } finally { setBusy(false); }
  }

  return (
    <div className="page container">
      <div className="section-head">
        <h2>{t('blog_title')}</h2>
        <p>{t('blog_sub')}</p>
      </div>

      <div className="tabs" style={{ maxWidth: 360 }}>
        <button className={tab === 'read' ? 'active' : ''} onClick={() => setTab('read')}>{t('blog_tab_read')}</button>
        <button className={tab === 'share' ? 'active' : ''} onClick={() => setTab('share')}>{t('blog_tab_share')}</button>
      </div>

      {error && <div className="error-box" style={{ maxWidth: 640, margin: '0 auto 20px' }}>{error}</div>}

      {tab === 'read' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {posts.length === 0 && !error && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('blog_empty')}</p>
          )}
          {posts.map(p => {
            const open = openId === p.id;
            return (
              <div className="panel" key={p.id} style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>{p.title}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                  {t('blog_by')} {p.author_username} · {new Date(p.created_at).toLocaleDateString()}
                </p>
                {open && <p style={{ whiteSpace: 'pre-line', fontSize: 14.5, lineHeight: 1.7 }}>{p.body}</p>}
                <button className="btn btn-outline" onClick={() => setOpenId(open ? null : p.id)}>
                  {open ? t('articles_read_less') : t('articles_read_more')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'share' && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {!user ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              {t('blog_sign_in_prompt')}{' '}
              <Link to="/auth" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav_signin')}</Link>
            </p>
          ) : (
            <>
              <form className="form-card" onSubmit={submit}>
                <div className="field">
                  <label>{t('blog_field_title')}</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} />
                </div>
                <div className="field">
                  <label>{t('blog_field_body')}</label>
                  <textarea rows={7} value={body} onChange={e => setBody(e.target.value)} required />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
                  {busy ? t('blog_submitting') : t('blog_submit')}
                </button>
                {submitted && <div className="success-box">{t('blog_submit_success')}</div>}
              </form>

              {mine.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 10 }}>{t('blog_mine_heading')}</h3>
                  {mine.map(p => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5,
                      }}
                    >
                      <span>{p.title}</span>
                      <span className="tag">{t(STATUS_KEY[p.status] || p.status)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
