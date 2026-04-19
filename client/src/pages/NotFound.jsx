import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ type:'spring',damping:15 }}>
        <div className="text-7xl mb-6 animate-float">🌊</div>
        <div className="font-head text-6xl font-black mb-3" style={{ color:'var(--accent)' }}>404</div>
        <div className="font-head text-xl font-bold mb-2">Page Not Found</div>
        <div className="text-sm mb-8" style={{ color:'var(--text-3)' }}>This page doesn't exist in the VetFlow system.</div>
        <button onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl font-bold text-sm text-black"
          style={{ background:'var(--accent)' }}>
          ← Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
