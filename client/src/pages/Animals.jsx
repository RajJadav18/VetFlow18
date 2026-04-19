// ════════════════════════════════════════════════════════════════
// Animals.jsx
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animalAPI } from '../api';
import { Modal, EmptyState, Spinner, Field, Input, Select, Textarea } from '../components/NotifPanel';
import toast from 'react-hot-toast';

const URGENCY_BADGE = { CRITICAL:'badge-crit', HIGH:'badge-high', MEDIUM:'badge-med', LOW:'badge-low', OBSERVATION:'badge-idle' };
const KIND_BADGE    = { Pet:'badge-low', Stray:'badge-blue', Wildlife:'badge-wild' };

export function Animals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [selected,setSelected]= useState(null);
  const [creating,setCreating]= useState(false);
  const [form,    setForm]    = useState({ kind:'Pet', name:'', species:'Canine', breed:'', sex:'Unknown', ageMonths:'', weightKg:'', ownerName:'', ownerPhone:'', notes:'' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await animalAPI.list({ kind: filter === 'all' ? undefined : filter, search: search || undefined });
      setAnimals(Array.isArray(data?.animals) ? data.animals : []);
    } catch(e) { toast.error(e.message); }
    finally    { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter, search]);

  const handleCreate = async () => {
    try {
      await animalAPI.create(form);
      toast.success('Animal record created');
      setCreating(false);
      setForm({ kind:'Pet', name:'', species:'Canine', breed:'', sex:'Unknown', ageMonths:'', weightKg:'', ownerName:'', ownerPhone:'', notes:'' });
      load();
    } catch(e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-head text-xl font-bold">Medical Records</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{animals.length} animals across all branches</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input className="form-input text-xs" style={{ width:180 }} placeholder="Search animals…" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-lg font-bold text-xs text-black" style={{ background:'var(--accent)' }}>+ New Record</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all','Pet','Stray','Wildlife'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter===f ? 'text-emerald-400' : ''}`}
            style={{ background: filter===f ? 'var(--accent-dim)' : 'var(--bg-elevated)', border:`1px solid ${filter===f ? 'var(--accent-glow)' : 'var(--border)'}`, color: filter===f ? 'var(--accent)' : 'var(--text-2)' }}>
            {f === 'all' ? `All (${animals.length})` : f}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : animals.length === 0 ? (
        <EmptyState icon="🐾" title="No animals found" desc="Create a new record or adjust your filters" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {animals.map((a, i) => (
              <motion.div key={a._id} className="card cursor-pointer"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y:-2, borderColor:'rgba(255,255,255,0.15)' }}
                onClick={() => setSelected(a)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border2)' }}>
                    {a.species === 'Canine' ? '🐕' : a.species === 'Feline' ? '🐱' : a.species === 'Reptile' ? '🦎' : a.species === 'Avian' ? '🦜' : '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-head font-bold text-sm">{a.name}</div>
                    <div className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{a.ownerName || 'Unregistered'}</div>
                  </div>
                  <span className={`badge ${URGENCY_BADGE[a.urgency] || 'badge-idle'}`}>{a.urgency}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['Species', `${a.species}${a.breed ? `, ${a.breed}` : ''}`],
                    ['Age', a.ageMonths ? `${Math.floor(a.ageMonths/12)}yr ${a.ageMonths%12}mo` : '—'],
                    ['Weight', a.weightKg ? `${a.weightKg} kg` : '—'],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color:'var(--text-3)' }}>{k}</span>
                      <span className="font-mono" style={{ color:'var(--text-2)' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
                  <span className={`badge ${KIND_BADGE[a.kind] || 'badge-idle'}`}>{a.kind}</span>
                  <span className="font-mono text-[9px] ml-auto" style={{ color:'var(--text-3)' }}>
                    {a.medicalHistory?.length || 0} visits
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Animal Profile'} subtitle={`${selected?.species} · ${selected?.kind}`} maxWidth="600px">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl flex items-center gap-4" style={{ background:'linear-gradient(135deg,rgba(0,200,150,0.06),rgba(7,10,15,0.9))', border:'1px solid var(--border)' }}>
              <div className="text-5xl">{selected.species==='Canine'?'🐕':selected.species==='Feline'?'🐱':selected.species==='Reptile'?'🦎':'🐾'}</div>
              <div>
                <div className="font-head text-xl font-bold">{selected.name}</div>
                <div className="text-sm" style={{ color:'var(--text-2)' }}>{selected.species}{selected.breed ? `, ${selected.breed}` : ''} · {selected.sex}</div>
                <div className="flex gap-2 mt-2">
                  <span className={`badge ${URGENCY_BADGE[selected.urgency]}`}>{selected.urgency}</span>
                  <span className={`badge ${KIND_BADGE[selected.kind]}`}>{selected.kind}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Owner', selected.ownerName || '—'], ['Phone', selected.ownerPhone || '—'],
                ['Age', selected.ageMonths ? `${Math.floor(selected.ageMonths/12)}yr` : '—'], ['Weight', selected.weightKg ? `${selected.weightKg}kg` : '—'],
                ['Microchip', selected.microchipId || 'None'], ['Status', selected.isDeceased ? 'Deceased' : 'Active'],
              ].map(([k,v]) => (
                <div key={k} className="card-elevated">
                  <div className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color:'var(--text-3)' }}>{k}</div>
                  <div className="font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {selected.medicalHistory?.length > 0 && (
              <div>
                <div className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color:'var(--text-3)' }}>Medical Timeline</div>
                <div className="space-y-2">
                  {selected.medicalHistory.slice(-3).reverse().map((h, i) => (
                    <div key={i} className="card-elevated border-l-2 pl-3" style={{ borderLeftColor:'var(--accent)' }}>
                      <div className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{new Date(h.date).toLocaleDateString()}</div>
                      <div className="font-semibold text-xs">{h.diagnosis || '—'}</div>
                      <div className="text-xs" style={{ color:'var(--text-2)' }}>{h.treatment}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="New Animal Record" subtitle="Add to clinic database">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Animal Kind">
            <Select value={form.kind} onChange={e => setForm(f=>({...f,kind:e.target.value}))}>
              <option>Pet</option><option>Stray</option><option>Wildlife</option>
            </Select>
          </Field>
          <Field label="Name"><Input placeholder="e.g. Bruno, Unknown" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></Field>
          <Field label="Species">
            <Select value={form.species} onChange={e=>setForm(f=>({...f,species:e.target.value}))}>
              {['Canine','Feline','Bovine','Equine','Avian','Reptile','Exotic','Other'].map(s=><option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Breed"><Input placeholder="e.g. Labrador" value={form.breed} onChange={e=>setForm(f=>({...f,breed:e.target.value}))} /></Field>
          <Field label="Sex">
            <Select value={form.sex} onChange={e=>setForm(f=>({...f,sex:e.target.value}))}>
              <option>Male</option><option>Female</option><option>Unknown</option>
            </Select>
          </Field>
          <Field label="Age (months)"><Input type="number" placeholder="e.g. 36" value={form.ageMonths} onChange={e=>setForm(f=>({...f,ageMonths:e.target.value}))} /></Field>
          <Field label="Weight (kg)"><Input type="number" placeholder="e.g. 28" value={form.weightKg} onChange={e=>setForm(f=>({...f,weightKg:e.target.value}))} /></Field>
          {form.kind==='Pet' && <>
            <Field label="Owner Name"><Input placeholder="Owner full name" value={form.ownerName} onChange={e=>setForm(f=>({...f,ownerName:e.target.value}))} /></Field>
            <Field label="Owner Phone"><Input placeholder="+91 XXXXX XXXXX" value={form.ownerPhone} onChange={e=>setForm(f=>({...f,ownerPhone:e.target.value}))} /></Field>
          </>}
        </div>
        <Field label="Notes"><Textarea placeholder="Initial notes, condition on arrival…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></Field>
        <div className="flex gap-3 mt-2">
          <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background:'var(--accent)' }}>Create Record</button>
          <button onClick={() => setCreating(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
export default Animals;
