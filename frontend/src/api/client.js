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

export default client;
