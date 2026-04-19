import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ambAPI } from '../api';
import { Spinner } from '../components/NotifPanel';
import toast from 'react-hot-toast';

// ── 3D Map scene (simplified top-down city grid) ──────────────────
function CityGrid() {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
  });

  const blocks = [];
  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      if (Math.random() > 0.3) {
        const h = Math.random() * 0.4 + 0.05;
        blocks.push({ x: x * 0.6, z: z * 0.6, h, color: x===0&&z===0 ? '#00C896' : `hsl(${200+Math.random()*40},40%,${15+Math.random()*15}%)` });
      }
    }
  }

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,-0.05,0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#0A1520" />
      </mesh>
      {/* Grid lines */}
      {[-3,-2,-1,0,1,2,3].map(i => (
        <group key={i}>
          <mesh rotation={[-Math.PI/2,0,0]} position={[i*0.6,-0.04,0]}>
            <planeGeometry args={[0.01, 6]} />
            <meshBasicMaterial color="rgba(0,200,150,0.15)" />
          </mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.04,i*0.6]}>
            <planeGeometry args={[6, 0.01]} />
            <meshBasicMaterial color="rgba(0,200,150,0.15)" />
          </mesh>
        </group>
      ))}
      {/* Buildings */}
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h/2, b.z]}>
          <boxGeometry args={[0.4, b.h, 0.4]} />
          <meshStandardMaterial color={b.color} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function AmbulanceMesh({ x, z, active }) {
  const ref = useRef();
  const targetX = useRef(x);
  const targetZ = useRef(z);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Smooth movement
    ref.current.position.x += (targetX.current - ref.current.position.x) * 0.08;
    ref.current.position.z += (targetZ.current - ref.current.position.z) * 0.08;
    if (active) {
      const t = clock.getElapsedTime();
      targetX.current = Math.sin(t * 0.3) * 1.5;
      targetZ.current = Math.cos(t * 0.25) * 1.5;
      ref.current.material.emissiveIntensity = 1 + Math.sin(t * 4) * 0.5;
    }
  });

  return (
    <group ref={ref} position={[x, 0.15, z]}>
      <mesh>
        <boxGeometry args={[0.12, 0.06, 0.18]} />
        <meshStandardMaterial color="#fff" emissive={active ? '#FF4444' : '#00C896'} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      {/* Siren ring */}
      {active && (
        <mesh position={[0, 0.06, 0]}>
          <torusGeometry args={[0.1, 0.01, 8, 32]} />
          <meshBasicMaterial color="#FF3B3B" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function PingDot({ x, z, color }) {
  const ref  = useRef();
  const ref2 = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) { const s = 1 + (t%1.5)/1.5*2; ref.current.scale.setScalar(s); ref.current.material.opacity = Math.max(0,0.7-(t%1.5)/1.5); }
    if (ref2.current) { const s = 1 + ((t+0.5)%1.5)/1.5*2; ref2.current.scale.setScalar(s); ref2.current.material.opacity = Math.max(0,0.7-((t+0.5)%1.5)/1.5); }
  });
  return (
    <group position={[x, 0.01, z]}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh ref={ref} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[0.04, 0.06, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ref2} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[0.04, 0.06, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MapScene({ ambulances }) {
  const active = ambulances.filter(a => ['DISPATCHED','EN_ROUTE','ON_SCENE'].includes(a.status));
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={1.5} color="#00C896" />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#3B82F6" />
      <Stars radius={50} count={1000} factor={2} fade />
      <CityGrid />
      {/* Ambulances */}
      {(ambulances.length ? ambulances : [{vehicleId:'VF-AMB-001',status:'EN_ROUTE'},{vehicleId:'VF-AMB-002',status:'IDLE'}]).map((a, i) => (
        <AmbulanceMesh key={a.vehicleId} x={(i-1)*1.2} z={0} active={['DISPATCHED','EN_ROUTE','ON_SCENE'].includes(a.status)} />
      ))}
      {/* Incident pings */}
      <PingDot x={1.8}  z={1.2}  color="#FF3B3B" />
      <PingDot x={-1.5} z={-1.0} color="#7EE8A2" />
      <PingDot x={0.5}  z={2.0}  color="#3B82F6" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} maxPolarAngle={Math.PI/2.5} minPolarAngle={Math.PI/6} />
    </>
  );
}

export default function Ambulance() {
  const [ambs,    setAmbs]   = useState([]);
  const [loading, setLoading]= useState(true);

  useEffect(() => {
    ambAPI.list().then(a => setAmbs(Array.isArray(a)?a:[])).catch(e=>toast.error(e.message)).finally(()=>setLoading(false));
  }, []);

  const changeStatus = async (vid, status) => {
    try { await ambAPI.status(vid, status); toast.success(`${vid} → ${status}`); ambAPI.list().then(a=>setAmbs(Array.isArray(a)?a:[])); }
    catch(e) { toast.error(e.message); }
  };

  const STATUS_BADGE = { IDLE:'badge-idle', DISPATCHED:'badge-high', EN_ROUTE:'badge-crit', ON_SCENE:'badge-crit', RETURNING:'badge-blue' };

  return (
    <div className="space-y-4">
      <div className="font-head text-xl font-bold">Ambulance Tracker</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Map */}
        <div className="lg:col-span-2 card p-0 overflow-hidden" style={{ height:320 }}>
          <div className="p-3 flex items-center gap-2" style={{ borderBottom:'1px solid var(--border)' }}>
            <div className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color:'var(--text-3)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background:'var(--accent)' }} />Live 3D GPS Map — Mumbai
            </div>
          </div>
          <Canvas camera={{ position:[0,3.5,3.5], fov:50 }} style={{ height:270 }}>
            <MapScene ambulances={ambs} />
          </Canvas>
        </div>

        {/* Fleet */}
        <div className="card">
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Fleet Status
          </div>
          {loading ? <Spinner /> : (
            <div className="space-y-0 divide-y" style={{ borderColor:'var(--border)' }}>
              {(ambs.length ? ambs : [
                { vehicleId:'VF-AMB-001', vehicleNo:'MH01AB1234', status:'EN_ROUTE',   isOperational:true },
                { vehicleId:'VF-AMB-002', vehicleNo:'MH01AB5678', status:'IDLE',       isOperational:true },
                { vehicleId:'VF-AMB-003', vehicleNo:'MH01CD9012', status:'DISPATCHED', isOperational:true },
              ]).map(a => {
                const active = ['DISPATCHED','EN_ROUTE','ON_SCENE'].includes(a.status);
                return (
                  <div key={a.vehicleId} className="py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background:active?'rgba(255,59,59,0.1)':'var(--bg-elevated)', border:`1px solid ${active?'rgba(255,59,59,0.2)':'var(--border)'}` }}>
                      {active?'🚑':'🅿️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-head font-bold text-xs">{a.vehicleId}</div>
                      <div className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{a.vehicleNo || '—'}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`badge ${STATUS_BADGE[a.status]||'badge-idle'}`}>{a.status}</span>
                      {a.status === 'IDLE' && a.isOperational && (
                        <div>
                          <button onClick={() => changeStatus(a.vehicleId,'DISPATCHED')}
                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                            style={{ background:'var(--crit-dim)', color:'var(--crit)', border:'1px solid rgba(255,59,59,0.2)' }}>
                            Dispatch
                          </button>
                        </div>
                      )}
                      {active && (
                        <div>
                          <button onClick={() => changeStatus(a.vehicleId,'RETURNING')}
                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                            style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>
                            Return
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dispatch log */}
      <div className="card">
        <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Today's Dispatch Log
        </div>
        <table className="data-table">
          <thead><tr><th>Case</th><th>Animal</th><th>Pickup Location</th><th>Vehicle</th><th>Dispatched</th><th>Status</th></tr></thead>
          <tbody>
            {[
              { id:'TG-00491', animal:'King Cobra', loc:'Aarey Forest Colony', veh:'VF-AMB-003', time:'09:41 AM', status:'EN_ROUTE' },
              { id:'TG-00485', animal:'Rex · GSD Stray', loc:'Dharavi Sector 7', veh:'VF-AMB-001', time:'08:55 AM', status:'RETURNING' },
              { id:'TG-00479', animal:'Bruno · Labrador', loc:'Bandra West Hill Rd', veh:'VF-AMB-002', time:'07:15 AM', status:'COMPLETED' },
            ].map(r => (
              <tr key={r.id}>
                <td className="font-mono text-xs" style={{ color:'var(--text-3)' }}>{r.id}</td>
                <td className="text-xs">{r.animal}</td>
                <td className="text-xs" style={{ color:'var(--text-2)' }}>{r.loc}</td>
                <td className="font-mono text-xs">{r.veh}</td>
                <td className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{r.time}</td>
                <td><span className={`badge ${r.status==='COMPLETED'?'badge-low':r.status==='EN_ROUTE'?'badge-crit':'badge-blue'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
