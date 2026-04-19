import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staffAPI } from '../api';
import { Modal, EmptyState, Spinner, Field, Input, Select } from '../components/NotifPanel';
import toast from 'react-hot-toast';

const DEMO_STAFF = [
  { _id:'1', name:'Dr. Riya Mehta',   email:'riya@vetflow.in',   role:'owner',        phone:'9876543210', isActive:true },
  { _id:'2', name:'Dr. Arjun Kumar',  email:'arjun@vetflow.in',  role:'vet',          phone:'9876543211', isActive:true },
  { _id:'3', name:'Priya Patel',      email:'priya@vetflow.in',  role:'technician',   phone:'9876543212', isActive:true },
  { _id:'4', name:'Rahul Verma',      email:'rahul@vetflow.in',  role:'paramedic',    phone:'9876543213', isActive:true },
  { _id:'5', name:'Sunita More',      email:'sunita@vetflow.in', role:'vet',          phone:'9876543214', isActive:false },
  { _id:'6', name:'Neha Kapoor',      email:'neha@vetflow.in',   role:'receptionist', phone:'9876543215', isActive:true },
];

const ROLE_BADGE = { owner:'badge-purple', vet:'badge-low', technician:'badge-blue', receptionist:'badge-idle', paramedic:'badge-high', ngo:'badge-wild' };
const GRADIENTS  = [
  'linear-gradient(135deg,#0F6E56,#00C896)', 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
  'linear-gradient(135deg,#10B981,#059669)', 'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)', 'linear-gradient(135deg,#FF8C42,#FF3B3B)',
];

const DUTY = [
  { name:'Dr. Riya Mehta',  role:'Lead Vet',    mon:true,  tue:true,  wed:false, thu:true,  fri:true,  cases:34 },
  { name:'Dr. Arjun Kumar', role:'Surgery',      mon:false, tue:true,  wed:true,  thu:true,  fri:false, cases:21 },
  { name:'Priya Patel',     role:'Vet Tech',     mon:true,  tue:true,  wed:true,  thu:true,  fri:true,  cases:48 },
  { name:'Rahul Verma',     role:'Paramedic',    mon:true,  tue:false, wed:true,  thu:false, fri:true,  cases:29 },
  { name:'Neha Kapoor',     role:'Receptionist', mon:true,  tue:true,  wed:true,  thu:true,  fri:true,  cases:0  },
];

export default function Staff() {
  const [staff,    setStaff]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [creating, setCreating]= useState(false);
  const [tab,      setTab]     = useState('cards');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'receptionist', phone:'' });

  const load = () => {
    setLoading(true);
    staffAPI.list()
      .then(d => setStaff(Array.isArray(d) && d.length ? d : DEMO_STAFF))
      .catch(() => setStaff(DEMO_STAFF))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    try {
      await staffAPI.create(form);
      toast.success(`${form.name} added to team`);
      setCreating(false);
      setForm({ name:'', email:'', password:'', role:'receptionist', phone:'' });
      load();
    } catch(e) { toast.error(e.message); }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try { await staffAPI.deactivate(id); toast.success('Staff deactivated'); load(); }
    catch(e) { toast.error(e.message); }
  };

  const activeStaff = staff.filter(s => s.isActive);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-head text-xl font-bold">Staff Management</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{activeStaff.length} active · {staff.length - activeStaff.length} inactive</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex rounded-lg p-1" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
            {[['cards','Cards'],['roster','Duty Roster']].map(([v,l]) => (
              <button key={v} onClick={()=>setTab(v)}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                style={{ background:tab===v?'var(--bg-surface)':'transparent', color:tab===v?'var(--text-1)':'var(--text-3)', border:tab===v?'1px solid var(--border)':'1px solid transparent' }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-lg font-bold text-xs text-black" style={{ background:'var(--accent)' }}>
            + Add Staff
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['👨‍⚕️', staff.filter(s=>s.role==='vet'||s.role==='owner').length, 'Veterinarians', 'var(--accent)' ],
          ['🔬', staff.filter(s=>s.role==='technician').length,              'Technicians',   'var(--blue)'   ],
          ['🚑', staff.filter(s=>s.role==='paramedic').length,               'Paramedics',    'var(--high)'   ],
          ['🏢', staff.filter(s=>s.role==='receptionist').length,            'Admin',         'var(--purple)' ],
        ].map(([icon,val,label,color]) => (
          <div key={label} className="card">
            <div className="font-head text-2xl font-black mb-1" style={{ color }}>{val}</div>
            <div className="text-xs" style={{ color:'var(--text-2)' }}>{icon} {label}</div>
          </div>
        ))}
      </div>

      {tab === 'cards' ? (
        loading ? <Spinner /> : staff.length === 0 ? (
          <EmptyState icon="👨‍⚕️" title="No staff members" desc="Add team members to get started" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {staff.map((s, i) => (
              <motion.div key={s._id} className="card cursor-pointer"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                whileHover={{ y:-2, borderColor:'rgba(255,255,255,0.15)' }}
                style={{ opacity: s.isActive ? 1 : 0.55 }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-head font-bold text-sm">{s.name}</div>
                    <div className="text-[11px] truncate" style={{ color:'var(--text-3)' }}>{s.email}</div>
                    <div className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{s.phone||'—'}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`badge ${ROLE_BADGE[s.role]||'badge-idle'}`}>{s.role}</span>
                      <span className={`badge ${s.isActive?'badge-low':'badge-crit'}`} style={{ fontSize:'8px' }}>
                        {s.isActive?'ACTIVE':'INACTIVE'}
                      </span>
                    </div>
                  </div>
                  {s.isActive && (
                    <button onClick={e=>{e.stopPropagation();handleDeactivate(s._id,s.name)}}
                      className="text-[9px] font-bold px-2 py-1 rounded-md flex-shrink-0"
                      style={{ background:'var(--crit-dim)', color:'var(--crit)', border:'1px solid rgba(255,59,59,0.2)' }}>
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Duty Roster */
        <div className="card overflow-hidden p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding:'10px 16px' }}>Staff</th>
                <th>Role</th>
                {['Mon','Tue','Wed','Thu','Fri'].map(d => <th key={d}>{d}</th>)}
                <th>Cases</th>
              </tr>
            </thead>
            <tbody>
              {DUTY.map((d, i) => (
                <tr key={d.name}>
                  <td style={{ padding:'11px 16px' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: GRADIENTS[i%GRADIENTS.length] }}>
                        {d.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-xs">{d.name}</div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROLE_BADGE[d.role.toLowerCase()]||'badge-idle'}`} style={{ fontSize:'9px' }}>{d.role}</span></td>
                  {[d.mon,d.tue,d.wed,d.thu,d.fri].map((on,j) => (
                    <td key={j} className="text-center">
                      <span className={`badge ${on?'badge-low':'badge-idle'}`} style={{ fontSize:'8px' }}>{on?'ON':'OFF'}</span>
                    </td>
                  ))}
                  <td className="font-mono text-xs font-semibold" style={{ color:'var(--accent)' }}>{d.cases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Add Staff Member" subtitle="New team member for this clinic">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *">
            <Input placeholder="Dr. Riya Mehta" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          </Field>
          <Field label="Email Address *">
            <Input type="email" placeholder="riya@vetflow.in" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          </Field>
          <Field label="Password">
            <Input type="password" placeholder="Min 8 characters" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} />
          </Field>
          <Field label="Phone">
            <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          </Field>
          <div className="col-span-2">
            <Field label="Role">
              <Select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                {['owner','vet','technician','receptionist','paramedic','ngo'].map(r => <option key={r}>{r}</option>)}
              </Select>
            </Field>
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background:'var(--accent)' }}>
            Add Staff Member
          </button>
          <button onClick={()=>setCreating(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
