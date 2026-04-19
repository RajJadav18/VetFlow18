// ─── client/src/components/CriticalOverlay.jsx ──────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useNavigate } from 'react-router-dom';

export default function CriticalOverlay({ data }) {
  const clearCritical = useAppStore(s => s.clearCritical);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="rounded-2xl p-8 w-full max-w-md"
          style={{ background: 'var(--bg-surface)', border: '2px solid var(--crit)', boxShadow: '0 0 60px rgba(255,59,59,0.3)' }}
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <motion.span className="text-5xl" animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 1 }}>🚨</motion.span>
            <div>
              <div className="font-head text-2xl font-black" style={{ color: 'var(--crit)' }}>CRITICAL ALERT</div>
              <div className="text-sm" style={{ color: '#FF8A8A' }}>Immediate action required</div>
            </div>
          </div>
          <div className="rounded-xl p-4 mb-5 space-y-1 text-sm" style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)' }}>
            <p><span className="font-semibold" style={{ color: 'var(--crit)' }}>Case:</span> {data.complaint || 'Emergency reported'}</p>
            <p><span className="font-semibold" style={{ color: 'var(--crit)' }}>Clinic ID:</span> {data.clinicId?.toString().slice(-6)}</p>
            <p><span className="font-semibold" style={{ color: 'var(--crit)' }}>Time:</span> {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={clearCritical}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'var(--crit)' }}>
              ✓ Acknowledge
            </button>
            <button
              onClick={() => { clearCritical(); navigate('/triage'); }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ border: '1px solid rgba(255,59,59,0.4)', color: '#FF8A8A' }}>
              View Triage →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
