import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Admin accounts are deliberately NOT offered here - they are created with
// `manage.py createsuperuser` (see backend/README.md). Open registration
// always creates a plain User account (there is no role to pick), and the
// API has no writable `role` field for a client to set.
function destinationFor(role) {
  return role === 'ADMIN' ? '/admin' : '/dashboard';
}

export default function Auth() {
  const { t } = useLanguage();
  const [mode, setMode] = useState('register'); // register | login
  const [form, setForm] = useState({ username: '', email: '', password: '', county: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await register(form);
      navigate(destinationFor(u?.role));
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : t('auth_error_registration'));
    } finally { setBusy(false); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await login(form.username, form.password);
      navigate(destinationFor(u?.role));
    } catch {
      setError(t('auth_error_login'));
    } finally { setBusy(false); }
  }

  if (mode === 'login') {
    return (
      <div className="page container">
        <div className="form-card">
          <h2 style={{ marginBottom: 18 }}>{t('auth_sign_in')}</h2>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>{t('auth_username')}</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>{t('auth_password_short')}</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
              {busy ? t('auth_signing_in') : t('auth_sign_in')}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5 }}>
            {t('auth_need_account')}{' '}
            <button className="btn btn-outline" onClick={() => setMode('register')}>{t('auth_create_one')}</button>
          </p>
        </div>
      </div>
    );
  }

  // register
  return (
    <div className="page container">
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div className="brand-icon" style={{ margin: '0 auto 10px' }}>💗</div>
          <h2 style={{ marginBottom: 4 }}>{t('auth_join_title')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
            {t('auth_join_sub')}
          </p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="field">
            <label>{t('auth_username')}</label>
            <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field">
            <label>{t('auth_email')}</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>{t('auth_county')}</label>
            <input value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('auth_password')}</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? t('auth_creating') : t('auth_create_account')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5 }}>
          {t('auth_have_account')}{' '}
          <button className="btn btn-outline" onClick={() => setMode('login')}>{t('auth_sign_in')}</button>
        </p>
      </div>
    </div>
  );
}
