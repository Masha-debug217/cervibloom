import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './pages/Home';
import InfoHub from './pages/InfoHub';
import Directory from './pages/Directory';
import Dashboard from './pages/Dashboard';
import VolunteerDonate from './pages/VolunteerDonate';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './theme.css';

// Any route wrapped in this redirects to /auth if nobody is logged in yet.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: 48 }}>Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

// Like ProtectedRoute, but also requires role === ADMIN. Non-admins are
// bounced home rather than to /auth (they ARE logged in, just not allowed).
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: 48 }}>Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function Nav() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  const role = user?.role;

  return (
    <nav>
      <NavLink to="/" className="brand">
        <div className="brand-icon">💗</div>
        <span className="brand-name">CerviBloom</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/">{t('nav_home')}</NavLink>
        <NavLink to="/info-hub">{t('nav_infohub')}</NavLink>
        <NavLink to="/directory">{t('nav_directory')}</NavLink>
        {role === 'USER' && <NavLink to="/dashboard">{t('nav_dashboard')}</NavLink>}
        {role === 'USER' && <NavLink to="/volunteer">{t('nav_volunteer')}</NavLink>}
        {role === 'ADMIN' && <NavLink to="/admin">{t('nav_admin')}</NavLink>}
      </div>
      <div className="nav-right">
        <button
          className="btn btn-outline"
          style={{ padding: '7px 10px' }}
          onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
        >
          {t('nav_lang_switch')}
        </button>
        <button className="icon-btn" onClick={toggleTheme}>{theme === 'light' ? '☾' : '☀'}</button>
        {user ? (
          <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>
            {t('nav_signout')} ({user.role.toLowerCase()})
          </button>
        ) : (
          <NavLink className="btn btn-outline" to="/auth">{t('nav_signin_join')}</NavLink>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer>
      <div className="footer-links">
        <Link to="/about">{t('footer_about')}</Link>
        <Link to="/contact">{t('footer_contact')}</Link>
        <Link to="/terms">{t('footer_terms')}</Link>
        <Link to="/privacy">{t('footer_privacy')}</Link>
      </div>
      {t('footer_disclaimer')}
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info-hub" element={<InfoHub />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/volunteer" element={<ProtectedRoute><VolunteerDonate /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
