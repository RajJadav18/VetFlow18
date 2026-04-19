import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { invAPI } from '../api';
import { Modal, EmptyState, Spinner, Field, Input, Select } from '../components/NotifPanel';
import toast from 'react-hot-toast';

const DEMO = [
  { _id:'1', name:'Amoxicillin 250mg',   category:'ANTIBIOTIC',   quantity:148, unit:'TABLETS', minThreshold:50,  expiryDate:'2026-09-01', costPerUnit:8   },
  { _id:'2', name:'Rabies Vaccine',       category:'VACCINE',      quantity:12,  unit:'VIALS',   minThreshold:20,  expiryDate:'2026-06-01', costPerUnit:120  },
  { _id:'3', name:'Ketamine HCl',         category:'SEDATIVE',     quantity:3,   unit:'VIALS',   minThreshold:10,  expiryDate:'2026-12-01', costPerUnit:450, isScheduled:true, schedClass:'H' },
  { _id:'4', name:'Ivermectin 1%',        category:'ANTIPARASITIC',quantity:34,  unit:'VIALS',   minThreshold:10,  expiryDate:'2027-03-01', costPerUnit:95   },
  { _id:'5', name:'Metronidazole 400mg',  category:'ANTIBIOTIC',   quantity:220, unit:'TABLETS', minThreshold:50,  expiryDate:'2027-01-01', costPerUnit:5    },
  { _id:'6', name:'Dexamethasone Inj.',   category:'ANALGESIC',    quantity:8,   unit:'VIALS',   minThreshold:15,  expiryDate:'2026-04-30', costPerUnit:65   },
  { _id:'7', name:'Atropine Sulphate',    category:'ANALGESIC',    quantity:45,  unit:'VIALS',   minThreshold:10,  expiryDate:'2027-08-01', costPerUnit:42   },
];

function getStatus(item) {
  if (item.quantity <= 0)                          return { label:'OUT',      badge:'badge-crit' };
  if (item.quantity <= (item.minThreshold||0))     return { label:'LOW',      badge:'badge-high' };
  const d = item.expiryDate ? new Date(item.expiryDate) : null;
  if (d && d < new Date())                         return { label:'EXPIRED',  badge:'badge-crit' };
  if (d && d < new Date(Date.now()+30*86400000))   return { label:'EXPIRING', badge:'badge-high' };
  return { label:'OK', badge:'badge-low' };
}

function getColor(item) {
  if (!item.minThreshold) return 'var(--accent)';
  if (item.quantity <= 0) return 'var(--crit)';
  if (item.quantity <= item.minThreshold) return 'var(--high)';
  return 'var(--accent)';
}

function getPct(item) {
  const max = Math.max(item.minThreshold||1, item.quantity) * 1.5;
  return Math.min(100, Math.round((item.quantity / max) * 100));
}

export default function Inventory() {
  const [items,    setItems]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [creating, setCreating]= useState(false);
  const [catFilter,setCatFilter]= useState('all');
  const [form, setForm] = useState({
    name:'', category:'ANTIBIOTIC', quantity:0, unit:'TABLETS',
    minThreshold:10, expiryDate:'', costPerUnit:'', supplier:'', isScheduled:false, schedClass:'',
  });

  const load = () => {
    setLoading(true);
    invAPI.list().then(d => setItems(Array.isArray(d) && d.length ? d : DEMO))
      .catch(() => setItems(DEMO))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = catFilter === 'all' ? items : items.filter(i => i.category === catFilter);

  const handleCreate = async () => {
    if (!form.name) return toast.error('Medicine name required');
    try {
      await invAPI.create(form);
      toast.success(`${form.name} added to inventory`);
      setCreating(false);
      setForm({ name:'', category:'ANTIBIOTIC', quantity:0, unit:'TABLETS', minThreshold:10, expiryDate:'', costPerUnit:'', supplier:'', isScheduled:false, schedClass:'' });
      load();
    } catch(e) { toast.error(e.message); }
  };

  const CATS = ['all','VACCINE','ANTIBIOTIC','ANTIPARASITIC','ANALGESIC','SEDATIVE','SUPPLEMENT','CONSUMABLE','EQUIPMENT'];
  const lowCount  = items.filter(i => i.quantity <= (i.minThreshold||0)).length;
  const expiryCount = items.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date(Date.now()+30*86400000)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-head text-xl font-bold">Inventory</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{items.length} items · {lowCount} low stock · {expiryCount} expiring</div>
        </div>
        <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-lg font-bold text-xs text-black" style={{ background:'var(--accent)' }}>+ Add Item</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['💊', items.length, 'Total Items',      'var(--accent)',  'rgba(0,200,150,0.1)'  ],
          ['⚠️', lowCount,     'Low Stock',        'var(--crit)',   'rgba(255,59,59,0.1)'  ],
          ['📅', expiryCount,  'Expiring 30d',     'var(--high)',   'rgba(255,140,66,0.1)' ],
          ['📦', 3,            'Pending Orders',   'var(--blue)',   'rgba(59,130,246,0.1)' ],
        ].map(([icon,val,label,color,bg]) => (
          <div key={label} className="card relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity:0.6 }} />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3" style={{ background:bg }}>{icon}</div>
            <div className="font-head text-2xl font-black" style={{ color }}>{val}</div>
            <div className="text-xs mt-1" style={{ color:'var(--text-2)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
            style={{ background: catFilter===c ? 'var(--accent-dim)' : 'var(--bg-elevated)', border:`1px solid ${catFilter===c?'var(--accent-glow)':'var(--border)'}`, color:catFilter===c?'var(--accent)':'var(--text-2)' }}>
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding:'10px 16px' }}>Medicine</th>
                <th>Category</th>
                <th>Stock</th>
                <th style={{ minWidth:100 }}>Level</th>
                <th>Expiry</th>
                <th>Cost/Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const st  = getStatus(item);
                const clr = getColor(item);
                const pct = getPct(item);
                const isLow = item.quantity <= (item.minThreshold||0);
                return (
                  <motion.tr key={item._id} className={isLow ? 'crit-row' : ''}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}>
                    <td style={{ padding:'11px 16px' }}>
                      <div className="font-semibold text-xs">{item.name}</div>
                      {item.isScheduled && <div className="font-mono text-[9px]" style={{ color:'var(--high)' }}>Schedule {item.schedClass} Drug</div>}
                      {item.supplier && <div className="text-[10px]" style={{ color:'var(--text-3)' }}>{item.supplier}</div>}
                    </td>
                    <td>
                      <span className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{item.category}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-semibold">{item.quantity} {item.unit}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background:'var(--bg-elevated)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:clr }} />
                        </div>
                        <span className="font-mono text-[9px] w-6 text-right" style={{ color:clr }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-[10px]" style={{ color: item.expiryDate && new Date(item.expiryDate)<new Date(Date.now()+30*86400000) ? 'var(--crit)' : 'var(--text-3)' }}>
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN',{month:'short',year:'2-digit'}) : '—'}
                      </span>
                    </td>
                    <td className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>
                      {item.costPerUnit ? `₹${item.costPerUnit}` : '—'}
                    </td>
                    <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Add Inventory Item" subtitle="Add medicine or supply to this branch">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Medicine / Item Name *">
              <Input placeholder="e.g. Amoxicillin 250mg" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </Field>
          </div>
          <Field label="Category">
            <Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {['VACCINE','ANTIBIOTIC','ANTIPARASITIC','ANALGESIC','SEDATIVE','SUPPLEMENT','CONSUMABLE','EQUIPMENT'].map(c=><option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Unit">
            <Select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>
              {['VIALS','TABLETS','ML','STRIPS','PIECES','KG','BOXES'].map(u=><option key={u}>{u}</option>)}
            </Select>
          </Field>
          <Field label="Quantity">
            <Input type="number" min="0" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:+e.target.value}))} />
          </Field>
          <Field label="Min Threshold (reorder alert)">
            <Input type="number" min="0" value={form.minThreshold} onChange={e=>setForm(f=>({...f,minThreshold:+e.target.value}))} />
          </Field>
          <Field label="Expiry Date">
            <Input type="date" value={form.expiryDate} onChange={e=>setForm(f=>({...f,expiryDate:e.target.value}))} />
          </Field>
          <Field label="Cost Per Unit (₹)">
            <Input type="number" placeholder="0" value={form.costPerUnit} onChange={e=>setForm(f=>({...f,costPerUnit:e.target.value}))} />
          </Field>
          <div className="col-span-2">
            <Field label="Supplier">
              <Input placeholder="e.g. Cipla, Sun Pharma" value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} />
            </Field>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer mb-5 mt-1">
          <input type="checkbox" checked={form.isScheduled} onChange={e=>setForm(f=>({...f,isScheduled:e.target.checked}))} className="accent-emerald-500" />
          <span style={{ color:'var(--text-2)' }}>Scheduled / controlled drug</span>
          {form.isScheduled && <Input placeholder="Schedule class e.g. H, X" style={{ width:140 }} value={form.schedClass} onChange={e=>setForm(f=>({...f,schedClass:e.target.value}))} />}
        </label>
        <div className="flex gap-3">
          <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background:'var(--accent)' }}>
            Add to Inventory
          </button>
          <button onClick={() => setCreating(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
