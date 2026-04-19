// ─── client/src/api/index.js ─────────────────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vetflow-backend-ceh8.onrender.com/api'
  ,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('vf_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r.data,
  err => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    if (err.response?.status === 401) {
      localStorage.removeItem('vf_token');
      localStorage.removeItem('vf_user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(msg));
  }
);

// ── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  login: (d) => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
  changePassword: (d) => api.post('/auth/change-password', d),
};

// ── Dashboard ────────────────────────────────────────────────────
export const dashAPI = {
  stats: () => api.get('/dashboard/stats'),
};

// ── Animals ──────────────────────────────────────────────────────
export const animalAPI = {
  list: (p = {}) => api.get('/animals', { params: p }),
  get: (id) => api.get(`/animals/${id}`),
  create: (d) => api.post('/animals', d),
  update: (id, d) => api.patch(`/animals/${id}`, d),
  delete: (id) => api.delete(`/animals/${id}`),
  addHistory: (id, d) => api.post(`/animals/${id}/history`, d),
};

// ── Triage ───────────────────────────────────────────────────────
export const triageAPI = {
  list: (p = {}) => api.get('/triage', { params: p }),
  get: (id) => api.get(`/triage/${id}`),
  create: (d) => api.post('/triage', d),
  update: (id, d) => api.patch(`/triage/${id}`, d),
  resolve: (id, d) => api.patch(`/triage/${id}/resolve`, d),
};

// ── Ambulance ────────────────────────────────────────────────────
export const ambAPI = {
  list: () => api.get('/ambulance'),
  nearest: (lat, lng) => api.get('/ambulance/nearest', { params: { lat, lng } }),
  dispatch: (vid, d) => api.post(`/ambulance/${vid}/dispatch`, d),
  status: (vid, status) => api.patch(`/ambulance/${vid}/status`, { status }),
  create: (d) => api.post('/ambulance', d),
};

// ── Wildlife ─────────────────────────────────────────────────────
export const wildAPI = {
  list: () => api.get('/wildlife'),
  create: (d) => api.post('/wildlife', d),
  update: (id, d) => api.patch(`/wildlife/${id}`, d),
  officers: () => api.get('/wildlife/officers'),
  nearestOfficer: (lat, lng) => api.get('/wildlife/officers/nearest', { params: { lat, lng } }),
};

// ── Inventory ────────────────────────────────────────────────────
export const invAPI = {
  list: (p = {}) => api.get('/inventory', { params: p }),
  create: (d) => api.post('/inventory', d),
  update: (id, d) => api.patch(`/inventory/${id}`, d),
  use: (id, q) => api.post(`/inventory/${id}/use`, { qty: q }),
  delete: (id) => api.delete(`/inventory/${id}`),
  lowStock: () => api.get('/inventory', { params: { lowStock: true } }),
  expiring: () => api.get('/inventory', { params: { expiring: true } }),
};

// ── Schedule / Appointments ──────────────────────────────────────
export const schedAPI = {
  appointments: (p = {}) => api.get('/schedule', { params: p }),
  create: (d) => api.post('/schedule', d),
  update: (id, d) => api.patch(`/schedule/${id}`, d),
  delete: (id) => api.delete(`/schedule/${id}`),
};

// ── Staff ────────────────────────────────────────────────────────
export const staffAPI = {
  list: () => api.get('/staff'),
  create: (d) => api.post('/staff', d),
  update: (id, d) => api.patch(`/staff/${id}`, d),
  deactivate: (id) => api.delete(`/staff/${id}`),
};

export default api;
