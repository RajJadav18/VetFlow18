import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore  } from '../stores/appStore';
import { useSocket    } from '../hooks/useSocket';
import CriticalOverlay  from './CriticalOverlay';
import NotifPanel       from './NotifPanel';
import toast            from 'react-hot-toast';

const NAV = [
  { to: '/',           icon: '⬛', label: 'Dashboard'    },
  { to: '/triage',     icon: '🔬', label: 'AI Triage',   badge: 'crit' },
  { to: '/ambulance',  icon: '🚑', label: 'Ambulance',   badge: 'high' },
  { to: '/wildlife',   icon: '🌿', label: 'Wildlife',    badge: 'wild' },
  { to: '/animals',    icon: '🐾', label: 'Records'      },
  { to: '/schedule',   icon: '📅', label: 'Schedule'     },
  { to: '/inventory',  icon: '💊', label: 'Inventory',   badge: 'warn' },
  { to: '/adoption',   icon: '🏡', label: 'Adoption'     },
  { to: '/staff',      icon: '👨‍⚕️', label: 'Staff'       },
  { to: '/analytics',  icon: '📊', label: 'Analytics'    },
];

const BADGE_COLORS = {
  crit: 'bg-red-500',
  high: 'bg-orange-500',
  wild: 'bg-emerald-500',
  warn: 'bg-yellow-500',
};

export default function Layout() {
  const user          = useAuthStore(s => s.user);
  const logout        = useAuthStore(s => s.logout);
  const crit          = useAppStore(s  => s.criticalAlert);
  const sidebarOpen   = useAppStore(s  => s.sidebarOpen);
  const toggleSidebar = useAppStore(s  => s.toggleSidebar);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  useSocket();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Critical Overlay */}
      {crit && <CriticalOverlay data={crit} />}

      {/* Notification Panel */}
      <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside
        className="fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300"
        style={{
          width: sidebarOpen ? '248px' : '0px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#0F6E56,#00C896)', boxShadow: '0 0 20px rgba(0,200,150,0.3)' }}>
            🌊
          </div>
          <div>
            <div className="font-head font-extrabold text-lg tracking-tight" style={{ letterSpacing: '-0.5px' }}>
              Vet<span style={{ color: 'var(--accent)' }}>Flow</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              {user?.clinicId?.name || 'Mumbai Central'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest font-mono" style={{ color: 'var(--text-3)' }}>Operations</div>
          {NAV.slice(0,4).map(n => (
            <NavLink key={n.to} to={n.to} end={n.to==='/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="text-base w-5 text-center">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.badge && <span className={`w-2 h-2 rounded-full ${BADGE_COLORS[n.badge]} animate-pulse-dot`} />}
            </NavLink>
          ))}
          <div className="px-3 py-2 mt-2 text-[10px] font-semibold uppercase tracking-widest font-mono" style={{ color: 'var(--text-3)' }}>Clinic</div>
          {NAV.slice(4,8).map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="text-base w-5 text-center">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.badge && <span className={`w-2 h-2 rounded-full ${BADGE_COLORS[n.badge]} animate-pulse-dot`} />}
            </NavLink>
          ))}
          <div className="px-3 py-2 mt-2 text-[10px] font-semibold uppercase tracking-widest font-mono" style={{ color: 'var(--text-3)' }}>Admin</div>
          {NAV.slice(8).map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="text-base w-5 text-center">{n.icon}</span>
              <span className="flex-1">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors" onClick={handleLogout}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#1D9E75,#3B82F6)' }}>
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name || 'Dr. Admin'}</div>
              <div className="font-mono text-[10px] capitalize" style={{ color: 'var(--text-3)' }}>{user?.role || 'owner'}</div>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>↩</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 transition-all duration-300" style={{ marginLeft: sidebarOpen ? '248px' : '0' }}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6"
          style={{ height: '60px', background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              ☰
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)' }}>
              <div className="w-[6px] h-[6px] rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
              <span className="font-mono text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              🔔
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--crit)' }}>3</span>
            </button>
            <button onClick={() => { toast.success('VetFlow v1.0 — Veterinary & Wildlife Platform'); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              ⚙
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto" style={{ background: 'var(--bg-base)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
