import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const defaultApiBaseUrl = isLocalhost ? 'http://localhost:5000/api' : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
  baseURL: defaultApiBaseUrl
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

export default api;
