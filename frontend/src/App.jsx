import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import InfoHub from './pages/InfoHub';
import Directory from './pages/Directory';
import Dashboard from './pages/Dashboard';
import VolunteerDonate from './pages/VolunteerDonate';
import Auth from './pages/Auth';
import './theme.css';

// Any route wrapped in this redirects to /auth if nobody is logged in yet.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: 48 }}>Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function Nav() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return (
    <nav>
      <NavLink to="/" className="brand">
        <div className="brand-icon">💗</div>
        <span className="brand-name">CerviBloom</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/info-hub">Info Hub</NavLink>
        <NavLink to="/directory">Screening Directory</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/volunteer">Volunteer &amp; Donate</NavLink>
      </div>
      <div className="nav-right">
        <button className="icon-btn" onClick={toggleTheme}>{theme === 'light' ? '☾' : '☀'}</button>
        {user ? (
          <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>
            Sign out ({user.role.toLowerCase()})
          </button>
        ) : (
          <NavLink className="btn btn-outline" to="/auth">Sign in / Join</NavLink>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info-hub" element={<InfoHub />} />
          <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/volunteer" element={<ProtectedRoute><VolunteerDonate /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
        <footer>CerviBloom — final year project · not a diagnostic tool · always consult a healthcare provider</footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
