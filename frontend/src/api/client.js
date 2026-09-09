import axios from 'axios';

// Change this to your deployed backend URL when you deploy.
export const API_BASE = 'http://127.0.0.1:8000/api';

const client = axios.create({ baseURL: API_BASE });

// Attach the saved JWT access token to every request automatically,
// so individual components don't need to remember to do this.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Silent token refresh -------------------------------------------------
// The access token only lives ~6 hours. Without this, the first request
// after it expires 401s and the user looks logged out even though a valid
// refresh token is sitting in localStorage. On a 401 we try ONCE to mint a
// new access token with the refresh token, then replay the original request.
// If the refresh itself fails, the session really is dead: clear tokens and
// bounce to /auth.

let refreshPromise = null;

function forceLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Hard redirect rather than importing router internals here.
  if (window.location.pathname !== '/auth') {
    window.location.assign('/auth');
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Only handle a genuine 401 that we haven't already retried, and never
    // try to refresh the refresh call itself.
    if (
      status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes('/auth/login/')
    ) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      forceLogout();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      // Collapse concurrent 401s into a single refresh round-trip.
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE}/auth/login/refresh/`, { refresh })
          .finally(() => { refreshPromise = null; });
      }
      const { data } = await refreshPromise;
      localStorage.setItem('access_token', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${data.access}`;
      return client(original);
    } catch (refreshError) {
      forceLogout();
      return Promise.reject(refreshError);
    }
  },
);

export default client;
