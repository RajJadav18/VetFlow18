// ─── client/src/stores/appStore.js ─────────────────────────────
import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  criticalAlert:  null,
  sidebarOpen:    true,
  activeBranch:   null,
  realtimePings:  [],

  setCritical:    (data) => set({ criticalAlert: data }),
  clearCritical:  ()     => set({ criticalAlert: null }),
  toggleSidebar:  ()     => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveBranch:(b)    => set({ activeBranch: b }),

  addPing: (ping) => {
    set(s => ({ realtimePings: [...s.realtimePings.slice(-49), ping] }));
    // Auto-remove after 30s
    setTimeout(() => {
      set(s => ({ realtimePings: s.realtimePings.filter(p => p.id !== ping.id) }));
    }, 30000);
  },
  removePing: (id) => set(s => ({ realtimePings: s.realtimePings.filter(p => p.id !== id) })),
}));
