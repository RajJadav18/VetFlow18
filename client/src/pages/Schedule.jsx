import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { schedAPI } from '../api';
import { Modal, Spinner, Field, Input, Select, Textarea } from '../components/NotifPanel';
import toast from 'react-hot-toast';

const SLOT_TYPES  = ['GENERAL','EMERGENCY','SURGERY','GROOMING'];
const SLOT_HOURS  = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
const TYPE_COLORS = { GENERAL:'badge-low', EMERGENCY:'badge-crit', SURGERY:'badge-blue', GROOMING:'badge-purple' };
const TYPE_BG     = { GENERAL:'rgba(0,200,150,0.06)', EMERGENCY:'rgba(255,59,59,0.06)', SURGERY:'rgba(59,130,246,0.06)', GROOMING:'rgba(167,139,250,0.06)' };

const DEMO_APPTS = [
  { _id:'1', ownerName:'Ravi Sharma',  ownerPhone:'9812345678', slotStart: setHour(new Date(),9),  slotType:'GENERAL',   status:'CONFIRMED', confirmationNo:'VF-001234', complaint:'Annual checkup' },
  { _id:'2', ownerName:'Priya Iyer',   ownerPhone:'9823456789', slotStart: setHour(new Date(),10), slotType:'EMERGENCY',  status:'CONFIRMED', confirmationNo:'VF-001235', complaint:'Dog not eating' },
  { _id:'3', ownerName:'Karan Mehta',  ownerPhone:'9834567890', slotStart: setHour(new Date(),11), slotType:'SURGERY',    status:'CONFIRMED', confirmationNo:'VF-001236', complaint:'Spay procedure' },
  { _id:'4', ownerName:'Sunita Rao',   ownerPhone:'9845678901', slotStart: setHour(new Date(),14), slotType:'GENERAL',   status:'CONFIRMED', confirmationNo:'VF-001237', complaint:'Vaccination booster' },
  { _id:'5', ownerName:'Amit Kapoor',  ownerPhone:'9856789012', slotStart: setHour(new Date(),15), slotType:'GROOMING',  status:'CONFIRMED', confirmationNo:'VF-001238', complaint:'Full grooming session' },
];

function setHour(d, h) { const r = new Date(d); r.setHours(h,0,0,0); return r.toISOString(); }

export default function Schedule() {
  const [appts,   setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating,setCreating]= useState(false);
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ ownerName:'', ownerPhone:'', slotStart:'', slotType:'GENERAL', complaint:'', notes:'' });

  const load = () => {
    setLoading(true);
    schedAPI.appointments({ date: selDate })
      .then(d => setAppts(Array.isArray(d) && d.length ? d : DEMO_APPTS))
      .catch(() => setAppts(DEMO_APPTS))
      .finally(() => setLoading(false));
  };
  useEffect(load, [selDate]);

  const handleCreate = async () => {
    if (!form.ownerName || !form.slotStart) return toast.error('Owner name and time required');
    try {
      const user = JSON.parse(localStorage.getItem('vf_user') || '{}');
      await schedAPI.create({ ...form, vetId: user.id || '000000000000000000000000' });
      toast.success(`Appointment confirmed! Ref: VF-${Date.now().toString().slice(-6)}`);
      setCreating(false);
      setForm({ ownerName:'', ownerPhone:'', slotStart:'', slotType:'GENERAL', complaint:'', notes:'' });
      load();
    } catch(e) { toast.error(e.message); }
  };

  const cancelAppt = async (id) => {
    try {
      await schedAPI.update(id, { status:'CANCELLED' });
      toast.success('Appointment cancelled');
      load();
    } catch(e) { toast.error(e.message); }
  };

  const getApptForHour = (h) => appts.find(a => new Date(a.slotStart).getHours() === +h.split(':')[0]);
  const todayLabel = new Date(selDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-head text-xl font-bold">Schedule</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{todayLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{ width:160 }} />
          <button onClick={()=>setCreating(true)} className="px-4 py-2 rounded-lg font-bold text-xs text-black" style={{ background:'var(--accent)' }}>
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['📅', appts.length,                                            'Total Today',  'var(--accent)', 'rgba(0,200,150,0.1)'  ],
          ['🚨', appts.filter(a=>a.slotType==='EMERGENCY').length,        'Emergency',    'var(--crit)',   'rgba(255,59,59,0.1)'  ],
          ['🔪', appts.filter(a=>a.slotType==='SURGERY').length,          'Surgeries',    'var(--blue)',   'rgba(59,130,246,0.1)' ],
          ['✅', appts.filter(a=>a.status==='COMPLETED').length,           'Completed',    'var(--accent)', 'rgba(0,200,150,0.1)'  ],
        ].map(([icon,val,label,color,bg]) => (
          <div key={label} className="card">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-2" style={{ background:bg }}>{icon}</div>
            <div className="font-head text-2xl font-black" style={{ color }}>{val}</div>
            <div className="text-xs mt-1" style={{ color:'var(--text-2)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Time slot grid */}
      <div className="card">
        <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Time Slots
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {SLOT_HOURS.map(h => {
            const appt = getApptForHour(h);
            return (
              <motion.div key={h}
                className="rounded-xl p-2 cursor-pointer text-center"
                style={{
                  border:`1px solid ${appt ? (TYPE_BG[appt.slotType]?'rgba(0,200,150,0.3)':'var(--border)') : 'var(--border)'}`,
                  background: appt ? TYPE_BG[appt.slotType] : 'var(--bg-elevated)',
                  minHeight: 72,
                }}
                whileHover={{ y:-1, borderColor:'rgba(0,200,150,0.4)' }}
                onClick={() => !appt && setCreating(true)}>
                <div className="font-mono text-[10px] mb-1.5" style={{ color:'var(--text-3)' }}>{h}</div>
                {appt ? (
                  <>
                    <div className="text-[10px] font-semibold truncate leading-tight">{appt.ownerName}</div>
                    <span className={`badge ${TYPE_COLORS[appt.slotType]||'badge-low'} mt-1`} style={{ fontSize:'8px' }}>{appt.slotType}</span>
                  </>
                ) : (
                  <div className="text-[10px]" style={{ color:'var(--text-3)' }}>Free</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Appointments list */}
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom:'1px solid var(--border)' }}>
            <div className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color:'var(--text-3)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Appointment List
            </div>
          </div>
          {appts.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color:'var(--text-3)' }}>No appointments for this date</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding:'8px 16px' }}>Time</th>
                  <th>Owner</th><th>Phone</th><th>Type</th><th>Complaint</th><th>Ref</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {appts.map(a => (
                  <tr key={a._id}>
                    <td style={{ padding:'11px 16px' }} className="font-mono text-xs font-semibold">
                      {new Date(a.slotStart).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </td>
                    <td className="font-semibold text-xs">{a.ownerName}</td>
                    <td className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{a.ownerPhone||'—'}</td>
                    <td><span className={`badge ${TYPE_COLORS[a.slotType]||'badge-low'}`}>{a.slotType}</span></td>
                    <td style={{ maxWidth:180 }}><div className="text-xs truncate" style={{ color:'var(--text-2)' }}>{a.complaint||'—'}</div></td>
                    <td className="font-mono text-[9px]" style={{ color:'var(--text-3)' }}>{a.confirmationNo||'—'}</td>
                    <td>
                      <span className={`badge ${a.status==='COMPLETED'?'badge-low':a.status==='CANCELLED'?'badge-crit':'badge-idle'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {a.status==='CONFIRMED' && (
                        <button onClick={()=>cancelAppt(a._id)} className="text-[9px] font-bold px-2 py-1 rounded-md"
                          style={{ background:'var(--crit-dim)', color:'var(--crit)', border:'1px solid rgba(255,59,59,0.2)' }}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={creating} onClose={()=>setCreating(false)} title="Book Appointment" subtitle="New appointment for clinic visit">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner / Patient Name *">
            <Input placeholder="Full name" value={form.ownerName} onChange={e=>setForm(f=>({...f,ownerName:e.target.value}))} />
          </Field>
          <Field label="Phone">
            <Input placeholder="+91 XXXXX XXXXX" value={form.ownerPhone} onChange={e=>setForm(f=>({...f,ownerPhone:e.target.value}))} />
          </Field>
          <Field label="Date & Time *">
            <Input type="datetime-local" value={form.slotStart} onChange={e=>setForm(f=>({...f,slotStart:e.target.value}))} />
          </Field>
          <Field label="Appointment Type">
            <Select value={form.slotType} onChange={e=>setForm(f=>({...f,slotType:e.target.value}))}>
              {SLOT_TYPES.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Chief Complaint">
          <Textarea placeholder="Reason for visit, symptoms…" value={form.complaint} onChange={e=>setForm(f=>({...f,complaint:e.target.value}))} />
        </Field>
        <Field label="Internal Notes">
          <Input placeholder="Vet notes (optional)" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
        </Field>
        <div className="flex gap-3 mt-2">
          <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background:'var(--accent)' }}>
            Confirm Booking
          </button>
          <button onClick={()=>setCreating(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
