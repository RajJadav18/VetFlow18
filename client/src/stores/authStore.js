// ─── client/src/stores/authStore.js ─────────────────────────────
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('vf_token') || null,
  user:  JSON.parse(localStorage.getItem('vf_user') || 'null'),

  login: (token, user) => {
    localStorage.setItem('vf_token', token);
    localStorage.setItem('vf_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('vf_token');
    localStorage.removeItem('vf_user');
    set({ token: null, user: null });
  },
}));
