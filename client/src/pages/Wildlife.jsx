import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { wildAPI } from '../api';
import { EmptyState, Spinner } from '../components/NotifPanel';
import toast from 'react-hot-toast';

const SPECIES = [
  { name:'King Cobra',     sci:'Ophiophagus hannah',     emoji:'🐍', venomous:true,  iucn:'LC', sch:'Sch II' },
  { name:'Indian Monitor', sci:'Varanus bengalensis',    emoji:'🦎', venomous:false, iucn:'LC', sch:'Sch I'  },
  { name:"Russell's Viper",sci:'Daboia russelii',        emoji:'🐍', venomous:true,  iucn:'LC', sch:'—'      },
  { name:'Indian Peacock', sci:'Pavo cristatus',         emoji:'🦚', venomous:false, iucn:'LC', sch:'Nat Bird'},
  { name:'Indian Pangolin',sci:'Manis crassicaudata',    emoji:'🦔', venomous:false, iucn:'CR', sch:'Sch I'  },
  { name:'Indian Leopard', sci:'Panthera pardus fusca',  emoji:'🐆', venomous:false, iucn:'VU', sch:'Sch I'  },
];

export default function Wildlife() {
  const [cases,   setCases]   = useState([]);
  const [officers,setOfficers]= useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([wildAPI.list(), wildAPI.officers()])
      .then(([c,o]) => { setCases(Array.isArray(c)?c:[]); setOfficers(Array.isArray(o)?o:[]); })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-head text-xl font-bold">Wildlife & Forest Module</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>Schedule I · Schedule II · IUCN Red List · CITES</div>
        </div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
          style={{ background:'rgba(126,232,162,0.1)', border:'1px solid rgba(126,232,162,0.2)', color:'var(--wild)' }}>
          🆘 Wildlife SOS: 9871963535
        </div>
      </div>

      {/* Species grid */}
      <div className="card">
        <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--wild)' }} />Species Reference Guide
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIES.map(s => (
            <motion.div key={s.name} className="p-3 rounded-xl cursor-pointer"
              style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.venomous?'rgba(255,59,59,0.2)':'var(--border)'}` }}
              whileHover={{ y:-2, borderColor: s.venomous?'var(--crit)':'rgba(0,200,150,0.4)' }}>
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="font-head font-bold text-xs mb-0.5">{s.name}</div>
              <div className="font-mono text-[9px] italic mb-2" style={{ color:'var(--text-3)' }}>{s.sci}</div>
              <div className="flex gap-1 flex-wrap">
                {s.venomous && <span className="badge badge-crit" style={{ fontSize:'8px' }}>VENOMOUS</span>}
                <span className="badge badge-wild" style={{ fontSize:'8px' }}>IUCN {s.iucn}</span>
                <span className="badge badge-idle" style={{ fontSize:'8px' }}>{s.sch}</span>
              </div>
              {s.venomous && <p className="text-[9px] mt-2 font-semibold" style={{ color:'var(--crit)' }}>⚠️ 10m exclusion zone</p>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active cases */}
        <div className="card">
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--wild)' }} />Active Wildlife Cases
          </div>
          {loading ? <Spinner /> : cases.length === 0 ? (
            <div>
              <EmptyState icon="🌿" title="No active cases" desc="Wildlife cases reported will appear here" />
              {/* Demo data */}
              {[
                { name:'King Cobra', loc:'Aarey Forest Colony', venomous:true,  status:'ACTIVE' },
                { name:'Monitor Lizard', loc:'SGNP Buffer Zone', venomous:false, status:'TREATMENT' },
                { name:'Indian Peacock', loc:'Goregaon East',    venomous:false, status:'PENDING' },
              ].map((c,i) => (
                <div key={i} className="flex items-center gap-3 py-3" style={{ borderTop:'1px solid var(--border)' }}>
                  <div className="text-xl">{c.venomous?'🐍':'🦎'}</div>
                  <div className="flex-1"><div className="font-semibold text-xs">{c.name}</div><div className="text-[10px]" style={{ color:'var(--text-3)' }}>{c.loc}</div></div>
                  <span className={`badge ${c.status==='ACTIVE'?'badge-crit':c.status==='TREATMENT'?'badge-blue':'badge-idle'}`} style={{ fontSize:'9px' }}>{c.status}</span>
                </div>
              ))}
            </div>
          ) : cases.map(c => (
            <div key={c._id} className="flex items-center gap-3 py-3" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="text-xl">{c.isVenomous?'🐍':'🦎'}</div>
              <div className="flex-1">
                <div className="font-semibold text-xs">{c.commonName||'Unknown'}</div>
                <div className="text-[10px]" style={{ color:'var(--text-3)' }}>{c.sightingAt?.forestBlock||'Unknown location'}</div>
              </div>
              <div className="space-y-1">
                {c.isVenomous && <span className="badge badge-crit" style={{ fontSize:'8px', display:'block' }}>VENOMOUS</span>}
                <span className="badge badge-idle" style={{ fontSize:'8px', display:'block' }}>{c.threatLevel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Forest officers */}
        <div className="card" style={{ background:'linear-gradient(135deg,rgba(0,40,25,0.85),rgba(7,10,15,0.95))', border:'1px solid rgba(0,200,150,0.12)' }}>
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--wild)' }} />Forest Range Officers — Maharashtra
          </div>
          {loading ? <Spinner /> : (
            <div className="space-y-0 divide-y" style={{ borderColor:'rgba(0,200,150,0.08)' }}>
              {(officers.length ? officers : [
                { name:'RFO Suresh Patil',  badgeNo:'MH/SGNP/001', rangeOffice:'Aarey Range',   phone:'9876512345', isAvailable:true  },
                { name:'RFO Ramesh Sharma', badgeNo:'MH/SGNP/002', rangeOffice:'Borivali Range', phone:'8765498765', isAvailable:true  },
                { name:'RFO Anita Kumar',   badgeNo:'MH/SGNP/003', rangeOffice:'Powai Range',    phone:'7654321098', isAvailable:false },
              ]).map(o => (
                <div key={o.badgeNo||o.name} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background:'rgba(0,200,150,0.1)', border:'1px solid rgba(0,200,150,0.2)', color:'var(--wild)' }}>
                    {o.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs">{o.name}</div>
                    <div className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{o.badgeNo} · {o.rangeOffice}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`badge ${o.isAvailable?'badge-low':'badge-idle'}`} style={{ fontSize:'8px', display:'block' }}>
                      {o.isAvailable?'AVAILABLE':'BUSY'}
                    </span>
                    <div className="font-mono text-[9px]" style={{ color:'var(--wild)' }}>{o.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-3 rounded-xl" style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(0,200,150,0.1)' }}>
            <div className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color:'var(--text-3)' }}>MH Forest Dept Helpline</div>
            <div className="font-mono text-sm font-semibold" style={{ color:'var(--wild)' }}>1800-233-0091</div>
          </div>
        </div>
      </div>
    </div>
  );
}
