import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

// Wrap the whole app in <AuthProvider> so any component can ask
// "who is logged in?" via useAuth() instead of passing props everywhere.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await client.get('/auth/me/');
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const res = await client.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return fetchMe(); // resolves to the logged-in user (or null)
  }

  async function register(payload) {
    await client.post('/auth/register/', payload);
    // After registering, log them straight in for a smoother flow.
    return login(payload.username, payload.password);
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
