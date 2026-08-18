import axios from 'axios';

const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')));

// Auto-normalize API_BASE so it ALWAYS has the /api prefix even if the environment variable omits it
let rawBase = import.meta.env.VITE_API_URL || (isProduction ? 'https://pgmanagement-backend-uez9.onrender.com/api' : '/api');
if (rawBase && !rawBase.endsWith('/api') && !rawBase.endsWith('/api/')) {
  rawBase = rawBase.replace(/\/+$/, '') + '/api';
}
const API_BASE = rawBase;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 25000,
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pg_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.response?.status === 401) {
      // If unauthorized, clear token only if not already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('pg_auth_token');
        localStorage.removeItem('pg_auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
export { API_BASE };
