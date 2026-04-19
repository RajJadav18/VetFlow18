// ─── NotifPanel ──────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFS = [
  { id:1, icon:'🚨', color:'rgba(255,59,59,0.1)',  title:'Critical — TG-00491',       msg:'King Cobra sighting · Aarey Forest · Officer alerted', time:'5m', unread:true },
  { id:2, icon:'💊', color:'rgba(255,140,66,0.1)', title:'Low Stock Alert',            msg:'Ketamine HCl — 3 vials remaining', time:'21m', unread:true },
  { id:3, icon:'📅', color:'rgba(0,200,150,0.1)',  title:'New Appointment',            msg:'Max (Labrador) — 3:30 PM today', time:'35m', unread:true },
  { id:4, icon:'🦎', color:'rgba(126,232,162,0.1)',title:'Wildlife Release Complete', msg:'Indian Star Tortoise WL-0088 released', time:'1hr' },
  { id:5, icon:'🐾', color:'rgba(167,139,250,0.1)',title:'Adoption Request',           msg:'Mochi — Kapoor family pending review', time:'2hr' },
];

export default function NotifPanel({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[150]" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="fixed top-0 right-0 h-screen z-[200] flex flex-col"
            style={{ width: '340px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            initial={{ x: 340 }} animate={{ x: 0 }} exit={{ x: 340 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="font-head font-bold text-base">Notifications</div>
              <div className="flex items-center gap-2">
                <span className="badge badge-crit">3 New</span>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-white/5"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {NOTIFS.map(n => (
                <div key={n.id} className="flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/3 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: n.color }}>{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mb-1 truncate">{n.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{n.msg}</div>
                    <div className="font-mono text-[9px] mt-1" style={{ color: 'var(--text-3)' }}>{n.time}</div>
                  </div>
                  {n.unread && <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: 'var(--accent)' }} />}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── StatCard ────────────────────────────────────────────────────
export function StatCard({ icon, value, label, trend, trendUp, color }) {
  return (
    <motion.div
      className="card relative overflow-hidden cursor-default"
      whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.15)' }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${color || 'var(--accent)'},transparent)`, opacity: 0.6 }} />
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3"
        style={{ background: color ? `${color}20` : 'var(--accent-dim)' }}>{icon}</div>
      <div className="font-head text-2xl font-black tracking-tight">{value}</div>
      <div className="text-xs mt-1 font-medium" style={{ color: 'var(--text-2)' }}>{label}</div>
      {trend && <div className={`text-[10px] mt-1 font-mono ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>{trendUp ? '↑' : '↓'} {trend}</div>}
    </motion.div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, subtitle, children, maxWidth = '540px' }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div className="w-full overflow-y-auto"
          style={{ maxWidth, maxHeight: '90vh', background: 'var(--bg-surface)', border: '1px solid var(--border2)', borderRadius: '20px' }}
          initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              <div className="font-head text-lg font-bold">{title}</div>
              {subtitle && <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-3)' }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>✕</button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <div className="font-head font-bold text-base mb-1">{title}</div>
      <div className="text-sm" style={{ color: 'var(--text-3)' }}>{desc}</div>
    </div>
  );
}

// ─── LoadingSpinner ──────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--accent)', borderRightColor: 'rgba(0,200,150,0.3)' }} />
    </div>
  );
}

// ─── FormField ──────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return <input className="form-input" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="form-input" style={{ cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234A5568' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', appearance: 'none' }} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ ...props }) {
  return <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} {...props} />;
}
