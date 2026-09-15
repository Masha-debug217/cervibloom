import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Moon, Sun, Menu, X, Mail, Phone, MapPin } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './pages/Home';
import InfoHub from './pages/InfoHub';
import Articles from './pages/Articles';
import SurvivorBlog from './pages/SurvivorBlog';
import Directory from './pages/Directory';
import Dashboard from './pages/Dashboard';
import VolunteerDonate from './pages/VolunteerDonate';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './styles/globals.css';
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
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile drawer whenever the route changes (link click, back
  // button, programmatic redirect after sign-in, etc.).
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('cervibloom-theme', next);
  }

  const role = user?.role;
  const links = [
    { to: '/', label: t('nav_home') },
    { to: '/info-hub', label: t('nav_infohub') },
    { to: '/directory', label: t('nav_directory') },
    { to: '/about', label: t('nav_about') },
    { to: '/volunteer', label: t('nav_get_involved') },
    ...(role === 'USER' ? [{ to: '/dashboard', label: t('nav_dashboard') }] : []),
    ...(role === 'ADMIN' ? [{ to: '/admin', label: t('nav_admin') }] : []),
  ];

  function handleSignOut() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-background border-b border-border">
      <div className="container-base h-full flex items-center justify-between gap-4">
        <NavLink to="/" className="brand shrink-0">
          <div className="brand-icon"><img src="/cervibloomLogo.png" alt="CerviBloom" /></div>
          <span className="brand-name hidden xs:inline">CerviBloom</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-semibold hover:bg-accent transition-colors duration-150"
            onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
          >
            <Globe size={14} />
            {language === 'sw' ? 'SW' : 'EN'}
          </button>
          <button
            className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors duration-150"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {!mobileOpen && (
            user ? (
              <button className="btn-outline text-sm whitespace-nowrap" onClick={handleSignOut}>
                {t('nav_signout')}
              </button>
            ) : (
              <NavLink className="btn-primary text-sm whitespace-nowrap" to="/auth">{t('nav_signin')}</NavLink>
            )
          )}

          <button
            className="md:hidden w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t('nav_close_menu') : t('nav_open_menu')}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-black/50 backdrop-blur-md z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-16 right-0 bottom-0 w-72 max-w-[80vw] bg-card border-l border-border z-50 flex flex-col p-6 gap-1 md:hidden">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-accent text-primary font-semibold' : 'text-muted-foreground'}`}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-auto pt-4 border-t border-border">
              {user ? (
                <button className="btn-outline w-full justify-center" onClick={handleSignOut}>
                  {t('nav_signout')} ({user.role.toLowerCase()})
                </button>
              ) : (
                <Link className="btn-primary w-full justify-center" to="/auth">{t('nav_signin')}</Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer-v2 bg-secondary">
      <div className="footer-grid">
        <div className="brand-col">
          <div className="brand" style={{ cursor: 'default' }}>
            <div className="brand-icon"><img src="/cervibloomLogo.png" alt="CerviBloom" /></div>
            <span className="brand-name">CerviBloom</span>
          </div>
          <p>{t('footer_tagline')}</p>
          <p>{t('footer_made_for_kenya')}</p>
        </div>
        <div className="footer-col">
          <h4>{t('footer_quicklinks')}</h4>
          <Link to="/">{t('nav_home')}</Link>
          <Link to="/info-hub">{t('nav_infohub')}</Link>
          <Link to="/directory">{t('nav_directory')}</Link>
          <Link to="/articles">{t('nav_articles')}</Link>
          <Link to="/blog">{t('nav_blog')}</Link>
        </div>
        <div className="footer-col">
          <h4>{t('footer_legal')}</h4>
          <Link to="/about">{t('footer_about')}</Link>
          <Link to="/contact">{t('footer_contact')}</Link>
          <Link to="/terms">{t('footer_terms')}</Link>
          <Link to="/privacy">{t('footer_privacy')}</Link>
        </div>
        <div className="footer-col">
          <h4>{t('footer_contact_heading')}</h4>
          <a href="mailto:cervibloom@gmail.com" className="footer-contact-row"><Mail size={14} />cervibloom@gmail.com</a>
          <a href="tel:+254796957107" className="footer-contact-row"><Phone size={14} />+254 796 957 107</a>
          <div className="footer-contact-row"><MapPin size={14} />Nairobi, Kenya</div>
          <p className="footer-partnered">{t('footer_partnered')}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {t('footer_rights')}</span>
        <span>{t('footer_sourced')}</span>
      </div>
    </footer>
  );
}

// The normal site chrome (sticky nav + footer). /auth deliberately opts out
// of this: it's a full-screen standalone layout with its own minimal header,
// not a page nested inside the rest of the site.
function SiteLayout() {
  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/info-hub" element={<InfoHub />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/blog" element={<SurvivorBlog />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/volunteer" element={<ProtectedRoute><VolunteerDonate /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
