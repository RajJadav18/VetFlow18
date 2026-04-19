import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PETS = [
  { id:1,  emoji:'🐕', name:'Tiger',    species:'Indie Dog, Male, ~2yr',  tags:['Vaccinated','Neutered','Kid-friendly'], color:'#FF8C42', desc:'Playful and energetic. Great with children. House-trained.',       status:'AVAILABLE' },
  { id:2,  emoji:'🐱', name:'Mochi',    species:'Persian Cat, F, ~2yr',   tags:['Vaccinated','Eye Tx ongoing'],          color:'#A78BFA', desc:'Sweet and calm. Needs eye drops for 2 more weeks.',                status:'AVAILABLE' },
  { id:3,  emoji:'🐕', name:'Buddy',    species:'Labrador Mix, M, ~1yr',  tags:['Vaccinated','Playful','Trained'],       color:'#3B82F6', desc:'Very friendly. Knows sit, shake, and stay.',                        status:'AVAILABLE' },
  { id:4,  emoji:'🐱', name:'Whiskers', species:'Tabby Cat, M, 3yr',      tags:['Vaccinated','Calm','Indoor'],           color:'#00C896', desc:'Quiet indoor cat. Perfect for apartment living.',                  status:'FOSTER'    },
  { id:5,  emoji:'🐕', name:'Rani',     species:'Indian Spitz, F, ~3yr',  tags:['Vaccinated','Trained'],                 color:'#FF3B3B', desc:'Well-behaved and loyal. Great companion for singles.',              status:'AVAILABLE' },
  { id:6,  emoji:'🦜', name:'Mango',    species:'Ringneck, M, 4yr',       tags:['Healthy','Rescued'],                    color:'#FFCC00', desc:'Talks a little. Rescued from illegal pet trade.',                   status:'AVAILABLE' },
  { id:7,  emoji:'🐕', name:'Kalu',     species:'Mutt, M, ~4yr',          tags:['Vaccinated','Senior-friendly'],         color:'#7EE8A2', desc:'Gentle giant. Perfect for quiet households.',                       status:'PENDING'   },
  { id:8,  emoji:'🐱', name:'Nala',     species:'Siamese Mix, F, 2yr',    tags:['Vaccinated','Affectionate'],            color:'#A78BFA', desc:'Loves cuddles and lap time. Very social.',                          status:'AVAILABLE' },
  { id:9,  emoji:'🐕', name:'Chotu',    species:'Beagle Mix, M, 8mo',     tags:['Vaccinated','Puppy','Energetic'],       color:'#FF8C42', desc:'Adorable puppy. Needs training — lots of love to give!',            status:'AVAILABLE' },
  { id:10, emoji:'🐱', name:'Luna',     species:'Maine Coon, F, 1yr',     tags:['Vaccinated','Fluffy','Gentle'],         color:'#3B82F6', desc:'Large fluffy cat. Very gentle and sociable.',                       status:'FOSTER'    },
  { id:11, emoji:'🦔', name:'Babu',     species:'Hedgehog, M, 2yr',       tags:['Healthy','Exotic','Gentle'],            color:'#F59E0B', desc:'Rescued exotic. Handles well. Needs experienced owner.',            status:'AVAILABLE' },
  { id:12, emoji:'🐕', name:'Golu',     species:'Golden Retriever, M, 5yr',tags:['Senior-friendly','Trained','Gentle'], color:'#00C896', desc:'Older dog, very calm and loving. Perfect for families.',             status:'AVAILABLE' },
];

const STATUS_BADGE = { AVAILABLE:'badge-low', FOSTER:'badge-blue', PENDING:'badge-med', ADOPTED:'badge-purple' };

export default function Adoption() {
  const [filter, setFilter]   = useState('all');
  const [species,setSpecies]  = useState('all');
  const [selected,setSelected]= useState(null);

  const filtered = PETS.filter(p => {
    const matchFilter  = filter  === 'all' || p.status === filter;
    const matchSpecies = species === 'all' || (species==='dogs'&&p.emoji==='🐕') || (species==='cats'&&p.emoji==='🐱') || (species==='others'&&!['🐕','🐱'].includes(p.emoji));
    return matchFilter && matchSpecies;
  });

  const adopt = (pet) => {
    toast.success(`🐾 Adoption request sent for ${pet.name}! Our team will contact you within 24 hours.`);
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="font-head text-xl font-bold">Adoption Board 🐾</div>
        <div className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>
          {PETS.filter(p=>p.status==='AVAILABLE').length} animals ready for loving homes
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [PETS.filter(p=>p.status==='AVAILABLE').length, 'Available',       'var(--accent)', '🐾'],
          [PETS.filter(p=>p.status==='FOSTER').length,    'In Foster Care',  'var(--blue)',   '🏠'],
          [PETS.filter(p=>p.status==='PENDING').length,   'Pending Requests','var(--warn)',   '⏳'],
          [12,                                            'Adopted This Month','var(--purple)','🎉'],
        ].map(([v,l,c,i]) => (
          <div key={l} className="card">
            <div className="font-head text-2xl font-black mb-1" style={{ color:c }}>{v}</div>
            <div className="text-xs" style={{ color:'var(--text-2)' }}>{i} {l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1.5">
          {[['all','All Status'],['AVAILABLE','Available'],['FOSTER','In Foster'],['PENDING','Pending']].map(([v,l]) => (
            <button key={v} onClick={()=>setFilter(v)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{ background:filter===v?'var(--accent-dim)':'var(--bg-elevated)', border:`1px solid ${filter===v?'var(--accent-glow)':'var(--border)'}`, color:filter===v?'var(--accent)':'var(--text-2)' }}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-4" style={{ borderLeft:'1px solid var(--border)', paddingLeft:'14px' }}>
          {[['all','All'],['dogs','🐕 Dogs'],['cats','🐱 Cats'],['others','Others']].map(([v,l]) => (
            <button key={v} onClick={()=>setSpecies(v)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{ background:species===v?'rgba(59,130,246,0.1)':'var(--bg-elevated)', border:`1px solid ${species===v?'rgba(59,130,246,0.3)':'var(--border)'}`, color:species===v?'var(--blue)':'var(--text-2)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((pet, i) => (
          <motion.div key={pet.id} className="card p-0 overflow-hidden cursor-pointer"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            whileHover={{ y:-4, borderColor:`${pet.color}50`, boxShadow:`0 8px 24px ${pet.color}15` }}
            onClick={() => setSelected(pet)}>
            {/* Photo area */}
            <div className="h-28 flex items-center justify-center text-6xl relative" style={{ background:`${pet.color}15` }}>
              {pet.emoji}
              {pet.status !== 'AVAILABLE' && (
                <div className="absolute top-2 right-2">
                  <span className={`badge ${STATUS_BADGE[pet.status]}`} style={{ fontSize:'8px' }}>{pet.status}</span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="font-head font-bold text-sm mb-0.5">{pet.name}</div>
              <div className="font-mono text-[9px] mb-2" style={{ color:'var(--text-3)' }}>{pet.species}</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {pet.tags.map(t => <span key={t} className="badge badge-idle" style={{ fontSize:'8px' }}>{t}</span>)}
              </div>
              <p className="text-[10px] leading-relaxed mb-3" style={{ color:'var(--text-2)' }}>{pet.desc}</p>
              <div className="flex items-center justify-between">
                <span className={`badge ${STATUS_BADGE[pet.status]||'badge-idle'}`} style={{ fontSize:'8px' }}>{pet.status}</span>
                {pet.status === 'AVAILABLE' && (
                  <button onClick={e=>{e.stopPropagation();adopt(pet)}}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-black"
                    style={{ background:'var(--accent)' }}>
                    Adopt →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }}
          onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
          <motion.div className="w-full max-w-md"
            style={{ background:'var(--bg-surface)', border:'1px solid var(--border2)', borderRadius:'20px', overflow:'hidden' }}
            initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ type:'spring', damping:20 }}>
            <div className="h-36 flex items-center justify-center text-7xl" style={{ background:`${selected.color}18` }}>{selected.emoji}</div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-head text-2xl font-black">{selected.name}</div>
                  <div className="font-mono text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{selected.species}</div>
                </div>
                <button onClick={()=>setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ border:'1px solid var(--border)', color:'var(--text-2)', background:'var(--bg-elevated)' }}>✕</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selected.tags.map(t => <span key={t} className="badge badge-low">{t}</span>)}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color:'var(--text-2)' }}>{selected.desc}</p>
              <div className="flex gap-3">
                {selected.status === 'AVAILABLE' ? (
                  <button onClick={()=>adopt(selected)} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background:'var(--accent)' }}>
                    🐾 Send Adoption Request
                  </button>
                ) : (
                  <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold" style={{ background:'var(--bg-elevated)', color:'var(--text-3)' }}>
                    Currently {selected.status}
                  </div>
                )}
                <button onClick={()=>setSelected(null)} className="px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ border:'1px solid var(--border2)', color:'var(--text-1)' }}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
