import { useEffect, useState } from 'react';
import { motion }    from 'framer-motion';
import { Suspense }  from 'react';
import Globe3D       from '../components/Globe3D';
import { StatCard }  from '../components/NotifPanel';
import { Spinner }   from '../components/NotifPanel';
import { dashAPI, triageAPI, ambAPI } from '../api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate }  from 'react-router-dom';
import toast from 'react-hot-toast';

const URGENCY_BADGE = { CRITICAL:'badge-crit', HIGH:'badge-high', MEDIUM:'badge-med', LOW:'badge-low', OBSERVATION:'badge-idle' };
const URGENCY_CLR   = { CRITICAL:'var(--crit)', HIGH:'var(--high)', MEDIUM:'var(--warn)', LOW:'var(--accent)', OBSERVATION:'var(--text-3)' };

function UrgencyBar({ score, urgency }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: URGENCY_CLR[urgency] || 'var(--accent)' }} />
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color: URGENCY_CLR[urgency] }}>{score}</span>
    </div>
  );
}

const FEED = [
  { icon:'🚨', bg:'rgba(255,59,59,0.1)',  t:'Critical triage incoming', s:'TG-00491 · King Cobra · Aarey Forest', ts:'5m ago' },
  { icon:'🚑', bg:'rgba(255,140,66,0.1)', t:'Ambulance dispatched',      s:'VF-AMB-003 → Aarey Colony',            ts:'6m ago' },
  { icon:'📅', bg:'rgba(0,200,150,0.1)',  t:'Appointment booked',        s:'Max (Labrador) · 3:30 PM today',       ts:'34m ago' },
  { icon:'💊', bg:'rgba(255,204,0,0.1)',  t:'Inventory alert',           s:'Ketamine HCl below threshold',         ts:'41m ago' },
  { icon:'🦎', bg:'rgba(126,232,162,0.1)',t:'Wildlife case updated',     s:'Monitor WL-0093 — suture check passed', ts:'1hr ago' },
];

export default function Dashboard() {
  const user     = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [stats,  setStats]  = useState(null);
  const [triages,setTriages] = useState([]);
  const [ambs,   setAmbs]   = useState([]);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, t, a] = await Promise.all([
          dashAPI.stats().catch(() => null),
          triageAPI.list({ limit: 5, status: 'PENDING' }).catch(() => ({ logs: [] })),
          ambAPI.list().catch(() => []),
        ]);
        setStats(s);
        setTriages(t?.logs || []);
        setAmbs(Array.isArray(a) ? a : []);
      } catch(e) { console.error(e); }
      finally    { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      {/* Critical Banner */}
      <motion.div className="crit-banner flex items-center gap-3 rounded-xl p-3 px-4"
        style={{ background:'rgba(255,59,59,0.08)', border:'1px solid rgba(255,59,59,0.25)' }}
        initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background:'var(--crit)', boxShadow:'0 0 8px var(--crit)', flexShrink:0 }} />
        <p className="text-xs flex-1" style={{ color:'#FF8A8A' }}>
          <strong style={{ color:'var(--crit)' }}>🚨 CRITICAL —</strong> TG-00491 · King Cobra · Aarey Forest Colony · RFO Patil alerted · VF-AMB-003 ETA 19 min
        </p>
        <button onClick={() => navigate('/ambulance')} className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background:'rgba(255,59,59,0.15)', border:'1px solid rgba(255,59,59,0.3)', color:'var(--crit)' }}>
          Track →
        </button>
      </motion.div>

      {/* Hero Globe */}
      <motion.div className="relative overflow-hidden rounded-2xl" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', minHeight:'280px' }}
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        {/* Globe canvas */}
        <div className="absolute inset-0">
          <Suspense fallback={null}><Globe3D /></Suspense>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background:'linear-gradient(90deg,rgba(7,10,15,0.96) 36%,rgba(7,10,15,0.2) 100%)' }} />
        {/* Content */}
        <div className="relative z-10 p-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold font-mono"
            style={{ background:'var(--accent-dim)', border:'1px solid var(--accent-glow)', color:'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />
            Real-Time Command Center
          </div>
          <div className="font-head text-3xl font-black mb-2" style={{ letterSpacing:'-1.2px', lineHeight:1.1 }}>
            Mumbai's Most Advanced<br /><span style={{ color:'var(--accent)' }}>Veterinary Ecosystem</span>
          </div>
          <div className="text-sm mb-5" style={{ color:'var(--text-2)', lineHeight:1.7 }}>
            AI triage · Live GPS ambulance tracking · Wildlife coordination · 4 branches · {stats?.todayAppts || 47} animals today
          </div>
          <div className="flex gap-3 flex-wrap">
            <motion.button onClick={() => navigate('/triage')}
              className="px-5 py-2.5 rounded-lg font-head font-bold text-sm text-black"
              style={{ background:'var(--accent)' }}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
              + New Triage
            </motion.button>
            <motion.button onClick={() => navigate('/animals')}
              className="px-5 py-2.5 rounded-lg font-head font-bold text-sm"
              style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}
              whileHover={{ scale:1.02, background:'rgba(255,255,255,0.05)' }} whileTap={{ scale:0.97 }}>
              View Records
            </motion.button>
          </div>
          <div className="flex gap-6 mt-5 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
            {[
              [stats?.totalAnimals || '2,847', 'Animals Treated'],
              ['4.8m', 'Avg Response'],
              [stats?.totalTriages || 312, 'Triages Done'],
            ].map(([v,l]) => (
              <div key={l}>
                <div className="font-head text-xl font-black" style={{ color:'var(--accent)' }}>{v}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide" style={{ color:'var(--text-3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      {loading ? <div className="grid grid-cols-4 gap-4"><Spinner /></div> : (
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <StatCard icon="🚨" value={stats?.criticalTriages ?? 3} label="Critical Cases"    trend="2 since yesterday" color="var(--crit)" />
          <StatCard icon="📋" value={stats?.totalTriages ?? 14}  label="Active Triages"    trend="3 resolved today"  trendUp color="var(--high)" />
          <StatCard icon="🚑" value={`${stats?.activeAmbs ?? 2}/4`} label="Ambulances Active" trend="2 idle, 2 dispatched" trendUp color="var(--accent)" />
          <StatCard icon="🦎" value={stats?.wildlifeCases ?? 3}  label="Wildlife Cases"    trend="Forest dept alerted" color="var(--wild)" />
        </motion.div>
      )}

      {/* Triage Queue + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Triage table */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color:'var(--text-3)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />
              Live Triage Queue
            </div>
            <button onClick={() => navigate('/triage')} className="text-xs font-semibold" style={{ color:'var(--accent)' }}>View all →</button>
          </div>
          {triages.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color:'var(--text-3)' }}>No active triages</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Animal</th><th>Score</th><th>Urgency</th><th>Time</th></tr></thead>
              <tbody>
                {triages.map(t => (
                  <tr key={t._id} className={t.urgency === 'CRITICAL' ? 'crit-row' : ''} onClick={() => navigate('/triage')}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: URGENCY_CLR[t.urgency] + '20' }}>🐾</div>
                        <div>
                          <div className="font-semibold text-xs">{t.animalName || 'Unknown'}</div>
                          <div className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{t.species || 'Unknown species'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ minWidth:'100px' }}><UrgencyBar score={t.urgencyScore} urgency={t.urgency} /></td>
                    <td><span className={`badge ${URGENCY_BADGE[t.urgency] || 'badge-idle'}`}>{t.urgency}</span></td>
                    <td className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>
                      {Math.round((Date.now() - new Date(t.createdAt)) / 60000)}m ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Donut */}
          <div className="card">
            <div className="text-xs font-bold uppercase tracking-wider font-mono mb-3 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Cases Today
            </div>
            <div className="flex items-center gap-4">
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
                <circle cx="45" cy="45" r="35" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                <circle cx="45" cy="45" r="35" fill="none" stroke="var(--crit)" strokeWidth="10" strokeDasharray="33 220" strokeDashoffset="0" />
                <circle cx="45" cy="45" r="35" fill="none" stroke="var(--high)" strokeWidth="10" strokeDasharray="66 220" strokeDashoffset="-33" />
                <circle cx="45" cy="45" r="35" fill="none" stroke="var(--warn)" strokeWidth="10" strokeDasharray="55 220" strokeDashoffset="-99" />
                <circle cx="45" cy="45" r="35" fill="none" stroke="var(--accent)" strokeWidth="10" strokeDasharray="66 220" strokeDashoffset="-154" />
              </svg>
              <div className="space-y-2 flex-1 text-xs">
                {[['var(--crit)','Critical','3'],['var(--high)','High','7'],['var(--warn)','Medium','12'],['var(--accent)','Low/Obs','25']].map(([c,l,v]) => (
                  <div key={l} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm" style={{ background:c }} /><span style={{ color:'var(--text-2)' }}>{l}</span></div>
                    <span className="font-mono font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="card">
            <div className="text-xs font-bold uppercase tracking-wider font-mono mb-3 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Live Activity
            </div>
            <div className="space-y-1">
              {FEED.map((f, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg cursor-default hover:bg-white/3 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ background:f.bg }}>{f.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{f.t}</div>
                    <div className="text-[10px] truncate" style={{ color:'var(--text-2)' }}>{f.s}</div>
                    <div className="font-mono text-[9px]" style={{ color:'var(--text-3)' }}>{f.ts}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ambulances preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Ambulance Fleet
          </div>
          <button onClick={() => navigate('/ambulance')} className="text-xs font-semibold" style={{ color:'var(--accent)' }}>Track live →</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(ambs.length ? ambs : [
            { vehicleId:'VF-AMB-001', status:'EN_ROUTE',  vehicleNo:'MH01AB1234' },
            { vehicleId:'VF-AMB-002', status:'IDLE',      vehicleNo:'MH01AB5678' },
            { vehicleId:'VF-AMB-003', status:'DISPATCHED',vehicleNo:'MH01CD9012' },
            { vehicleId:'VF-AMB-004', status:'IDLE',      vehicleNo:'MH01CD3456' },
          ]).map(a => {
            const active = ['DISPATCHED','EN_ROUTE','ON_SCENE'].includes(a.status);
            return (
              <div key={a.vehicleId} className="card-elevated flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: active ? 'rgba(255,59,59,0.1)' : 'rgba(255,255,255,0.04)', border:`1px solid ${active ? 'rgba(255,59,59,0.2)' : 'var(--border)'}` }}>
                  {active ? '🚑' : '🅿️'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-head font-bold text-xs">{a.vehicleId}</div>
                  <div className="font-mono text-[9px] truncate" style={{ color:'var(--text-3)' }}>{a.vehicleNo}</div>
                  <span className={`badge text-[9px] mt-1 ${active ? 'badge-high' : 'badge-idle'}`}>{a.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
