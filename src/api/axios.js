import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Pulled out as named exports so they can be unit tested directly, without
// needing to go through a real HTTP request or a real page navigation.
export function attachAuthToken(config) {
  const token = localStorage.getItem('estatehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

export function handleAuthError(error) {
  if (error.response?.status === 401) {
    localStorage.removeItem('estatehub_token');
    localStorage.removeItem('estatehub_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
}

api.interceptors.request.use(attachAuthToken);
api.interceptors.response.use((response) => response, handleAuthError);

export default api;
