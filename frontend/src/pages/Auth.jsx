import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Admin accounts are deliberately NOT offered here - they are created with
// `manage.py createsuperuser` (see backend/README.md). Open registration
// only mints Patient / Volunteer accounts, and the API rejects role=ADMIN.
const ROLES = [
  { value: 'PATIENT', label: 'Patient', desc: 'Track symptoms, get screening reminders, find care near you.' },
  { value: 'VOLUNTEER', label: 'Volunteer', desc: 'Support outreach programs and community screening drives.' },
];

function destinationFor(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'VOLUNTEER') return '/volunteer';
  return '/dashboard';
}

export default function Auth() {
  const [mode, setMode] = useState('choose'); // choose | register | login
  const [role, setRole] = useState('PATIENT');
  const [form, setForm] = useState({ username: '', email: '', password: '', county: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function pickRole(r) {
    setRole(r);
    setMode('register');
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await register({ ...form, role });
      navigate(destinationFor(u?.role ?? role));
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Registration failed.');
    } finally { setBusy(false); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const u = await login(form.username, form.password);
      navigate(destinationFor(u?.role));
    } catch {
      setError('Incorrect username or password.');
    } finally { setBusy(false); }
  }

  if (mode === 'choose') {
    return (
      <div className="page container">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="brand-icon" style={{ margin: '0 auto 14px' }}>💗</div>
          <h2 style={{ marginBottom: 4 }}>Join CerviBloom</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14.5 }}>Choose your account type to get started</p>
        </div>
        <div className="card-grid">
          {ROLES.map(r => (
            <div className="role-card" key={r.value}>
              <div className="role-icon">●</div>
              <h3>{r.label}</h3>
              <p>{r.desc}</p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => pickRole(r.value)}>
                Join as {r.label}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
          Already have an account?{' '}
          <button className="btn btn-outline" onClick={() => setMode('login')}>Sign in</button>
        </p>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="page container">
        <div className="form-card">
          <h2 style={{ marginBottom: 18 }}>Sign in</h2>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5 }}>
            <button className="btn btn-outline" onClick={() => setMode('choose')}>Back to account types</button>
          </p>
        </div>
      </div>
    );
  }

  // register
  return (
    <div className="page container">
      <div className="form-card">
        <h2 style={{ marginBottom: 18 }}>Join as {ROLES.find(r => r.value === role)?.label}</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>County</label>
            <input value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} />
          </div>
          <div className="field">
            <label>Password (min. 8 characters)</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5 }}>
          <button className="btn btn-outline" onClick={() => setMode('choose')}>Back</button>
        </p>
      </div>
    </div>
  );
}
