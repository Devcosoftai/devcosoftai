import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const adminApi = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — auto logout
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────
export const adminLogin = (credentials) =>
  adminApi.post('/admin/auth/login', credentials);

export const adminGetMe = () =>
  adminApi.get('/admin/auth/me');

export const adminChangePassword = (data) =>
  adminApi.post('/admin/auth/change-password', data);

export const adminSeed = () =>
  adminApi.post('/admin/auth/seed');

// ── Contacts ────────────────────────────────────────
export const adminGetContacts = (params) =>
  adminApi.get('/admin/contacts', { params });

export const adminGetContact = (id) =>
  adminApi.get(`/admin/contacts/${id}`);

export const adminUpdateStatus = (id, status) =>
  adminApi.patch(`/admin/contacts/${id}/status`, { status });

export const adminDeleteContact = (id) =>
  adminApi.delete(`/admin/contacts/${id}`);

export const adminExportCSV = () =>
  adminApi.get('/admin/contacts/export/csv', { responseType: 'blob' });

export default adminApi;
