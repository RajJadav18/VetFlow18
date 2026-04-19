// ════════════════════════════════════════════════════════════════
// Triage.jsx
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { triageAPI, ambAPI } from '../api';
import { Modal, EmptyState, Spinner, Field, Input, Select, Textarea } from '../components/NotifPanel';
import toast from 'react-hot-toast';

const UB = { CRITICAL:'badge-crit', HIGH:'badge-high', MEDIUM:'badge-med', LOW:'badge-low', OBSERVATION:'badge-idle' };
const UC = { CRITICAL:'var(--crit)', HIGH:'var(--high)', MEDIUM:'var(--warn)', LOW:'var(--accent)', OBSERVATION:'var(--text-3)' };

export default function Triage() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating,setCreating]= useState(false);
  const [form,    setForm]    = useState({ chiefComplaint:'', urgency:'MEDIUM', urgencyScore:50, species:'', animalName:'', isWildlife:false, isVenomous:false, reporterPhone:'' });

  const load = () => {
    setLoading(true);
    triageAPI.list({ limit:20 }).then(d => setLogs(d?.logs || [])).catch(e=>toast.error(e.message)).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.chiefComplaint) return toast.error('Chief complaint required');
    try {
      await triageAPI.create(form);
      toast.success('Triage created');
      setCreating(false); setForm({ chiefComplaint:'', urgency:'MEDIUM', urgencyScore:50, species:'', animalName:'', isWildlife:false, isVenomous:false, reporterPhone:'' });
      load();
    } catch(e) { toast.error(e.message); }
  };

  const handleResolve = async (id) => {
    try { await triageAPI.resolve(id, { notes:'Resolved from dashboard' }); toast.success('Triage resolved'); load(); }
    catch(e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-head text-xl font-bold">Triage Queue</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{logs.filter(l=>l.status!=='RESOLVED').length} active cases</div>
        </div>
        <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-lg font-bold text-xs text-black" style={{ background:'var(--accent)' }}>+ New Triage</button>
      </div>

      {loading ? <Spinner /> : logs.length === 0 ? <EmptyState icon="🔬" title="No triage cases" desc="Create a new triage report to begin" /> : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Animal</th><th>Complaint</th><th>Score</th><th>Urgency</th><th>Reporter</th><th>Time</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {logs.map(t => (
                <tr key={t._id} className={t.urgency==='CRITICAL'?'crit-row':''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: (UC[t.urgency]||'var(--text-3)')+'20' }}>
                        {t.isWildlife?'🦎':t.isVenomous?'🐍':'🐾'}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{t.animalName||'Unknown'}</div>
                        <div className="font-mono text-[9px]" style={{ color:'var(--text-3)' }}>{t.species||'—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth:180 }}><div className="text-xs truncate">{t.chiefComplaint}</div></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1 rounded-full" style={{ background:'var(--bg-elevated)' }}>
                        <div className="h-full rounded-full" style={{ width:`${t.urgencyScore||50}%`, background:UC[t.urgency]||'var(--accent)' }} />
                      </div>
                      <span className="font-mono text-[10px]" style={{ color:UC[t.urgency] }}>{t.urgencyScore||50}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${UB[t.urgency]||'badge-idle'}`}>{t.urgency}</span></td>
                  <td className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{t.reporterPhone||'—'}</td>
                  <td className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{Math.round((Date.now()-new Date(t.createdAt))/60000)}m</td>
                  <td><span className="badge badge-idle text-[9px]">{t.status}</span></td>
                  <td>
                    <div className="flex gap-1">
                      {t.status!=='RESOLVED' && (
                        <button onClick={()=>handleResolve(t._id)} className="text-[9px] font-bold px-2 py-1 rounded-md"
                          style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={creating} onClose={()=>setCreating(false)} title="New Triage Report" subtitle="Manual triage entry">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Animal Name"><Input placeholder="Name or Unknown" value={form.animalName} onChange={e=>setForm(f=>({...f,animalName:e.target.value}))} /></Field>
          <Field label="Species"><Input placeholder="e.g. Canine, Reptile" value={form.species} onChange={e=>setForm(f=>({...f,species:e.target.value}))} /></Field>
          <Field label="Urgency">
            <Select value={form.urgency} onChange={e=>setForm(f=>({...f,urgency:e.target.value}))}>
              {['CRITICAL','HIGH','MEDIUM','LOW','OBSERVATION'].map(u=><option key={u}>{u}</option>)}
            </Select>
          </Field>
          <Field label="Urgency Score (0-100)"><Input type="number" min="0" max="100" value={form.urgencyScore} onChange={e=>setForm(f=>({...f,urgencyScore:+e.target.value}))} /></Field>
          <Field label="Reporter Phone"><Input placeholder="+91 XXXXX XXXXX" value={form.reporterPhone} onChange={e=>setForm(f=>({...f,reporterPhone:e.target.value}))} /></Field>
          <Field label="Channel">
            <Select>
              <option>WEB</option><option>MOBILE</option><option>NGO</option><option>WALK_IN</option>
            </Select>
          </Field>
        </div>
        <Field label="Chief Complaint *"><Textarea placeholder="Describe symptoms, behaviour, injuries in detail…" value={form.chiefComplaint} onChange={e=>setForm(f=>({...f,chiefComplaint:e.target.value}))} /></Field>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={form.isWildlife} onChange={e=>setForm(f=>({...f,isWildlife:e.target.checked}))} /> Wildlife case
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={form.isVenomous} onChange={e=>setForm(f=>({...f,isVenomous:e.target.checked}))} /> Venomous animal
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background:'var(--accent)' }}>Create Triage</button>
          <button onClick={()=>setCreating(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
