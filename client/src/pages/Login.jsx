import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { authAPI } from '../api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

// ── Mini animated globe (same style as dashboard) ────────────────
function MiniGlobe() {
  const globeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  // Grid texture
  const gridTex = useMemo(() => {
    const c   = document.createElement('canvas');
    c.width   = 1024;
    c.height  = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = 'rgba(0,200,150,0.18)';
    ctx.lineWidth   = 0.8;
    for (let i = 0; i <= 18; i++) {
      const y = (i / 18) * 1024;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }
    for (let i = 0; i <= 36; i++) {
      const x = (i / 36) * 1024;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (globeRef.current) globeRef.current.rotation.y = t * 0.18;
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.08;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.06;
  });

  // Ping positions on globe surface
  const pings = useMemo(() => [
    { lat: 19.1, lng: 72.9 },
    { lat: 28.6, lng: 77.2 },
    { lat: 13.0, lng: 80.2 },
    { lat: 22.5, lng: 88.4 },
    { lat: 18.5, lng: 73.8 },
  ].map(({ lat, lng }) => {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(Math.sin(phi) * Math.cos(theta)) * 1.02,
       Math.cos(phi) * 1.02,
       Math.sin(phi) * Math.sin(theta) * 1.02
    );
  }), []);

  return (
    <group>
      {/* Globe sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={gridTex}
          transparent
          opacity={0.88}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00C896"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Equator ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.14, 0.004, 8, 128]} />
        <meshBasicMaterial color="#00C896" transparent opacity={0.35} />
      </mesh>

      {/* Tilted orbit ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[1.22, 0.003, 8, 128]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.25} />
      </mesh>

      {/* City pings */}
      {pings.map((pos, i) => (
        <PingDot key={i} position={pos} delay={i * 0.6} />
      ))}
    </group>
  );
}

function PingDot({ position, delay }) {
  const coreRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() + delay) % 2;
    if (ringRef.current) {
      const s = 1 + t * 2.5;
      ringRef.current.scale.setScalar(s);
      ringRef.current.material.opacity = Math.max(0, 0.7 - t / 2);
    }
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity =
        1.5 + Math.sin((clock.getElapsedTime() + delay) * 3) * 0.6;
    }
  });

  // Orient toward globe surface normal
  const quat = useMemo(() => {
    const m = new THREE.Matrix4();
    m.lookAt(position, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion();
    q.setFromRotationMatrix(m);
    return q;
  }, [position]);

  return (
    <group position={position} quaternion={quat}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color="#00C896"
          emissive="#00C896"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.024, 0.038, 32]} />
        <meshBasicMaterial
          color="#00C896"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function BgScene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[4, 4, 4]}   intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -3, -4]} intensity={0.5} color="#00C896" />
      <Stars radius={80} depth={50} count={2500} factor={2.8} fade speed={0.4} />
      <MiniGlobe />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </>
  );
}

// ── Login page ───────────────────────────────────────────────────
export default function Login() {
  const navigate  = useNavigate();
  const loginStore = useAuthStore(s => s.login);
  const [form,    setForm]    = useState({ email: 'admin@vetflow.in', password: 'VetFlow2026!' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.login(form);
      loginStore(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}! 🌊`);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left: 3D Globe ──────────────────────────────────── */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        {/* Three.js canvas */}
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <BgScene />
        </Canvas>

        {/* Gradient fade toward form */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 55%, var(--bg-base) 100%)' }} />

        {/* Overlay text */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9 }}
        >
          <div className="text-center">
            <div className="font-head text-5xl font-black mb-3 tracking-tight"
              style={{ letterSpacing: '-2px' }}>
              Vet<span style={{ color: 'var(--accent)' }}>Flow</span>
            </div>
            <div className="text-base font-medium mb-8" style={{ color: 'var(--text-2)' }}>
              Veterinary &amp; Wildlife Management Platform
            </div>
            <div className="flex gap-10 justify-center">
              {[
                ['2,847', 'Animals Treated'],
                ['98.2%', 'AI Accuracy'],
                ['312',   'Strays Rescued'],
              ].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="font-head text-2xl font-black" style={{ color: 'var(--accent)' }}>{v}</div>
                  <div className="text-xs font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-3)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Login Form ────────────────────────────────── */}
      <div className="w-full lg:w-[420px] flex items-center justify-center p-8 flex-shrink-0"
        style={{ background: 'var(--bg-base)' }}>
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#0F6E56,#00C896)', boxShadow: '0 0 24px rgba(0,200,150,0.4)' }}>
              🌊
            </div>
            <div>
              <div className="font-head text-xl font-extrabold" style={{ letterSpacing: '-0.5px' }}>
                Vet<span style={{ color: 'var(--accent)' }}>Flow</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                Clinic Dashboard
              </div>
            </div>
          </div>

          <div className="font-head text-2xl font-bold mb-1">Welcome back</div>
          <div className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>
            Sign in to your clinic account
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@vetflow.in"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-head font-bold text-sm text-black"
              style={{ background: loading ? 'rgba(0,200,150,0.5)' : 'var(--accent)' }}
              whileHover={!loading ? { scale: 1.01, boxShadow: '0 6px 20px rgba(0,200,150,0.3)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl text-center"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>
              Demo Credentials
            </div>
            <div className="text-xs" style={{ color: 'var(--text-2)' }}>
              admin@vetflow.in
            </div>
            <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-3)' }}>
              Password: VetFlow2026!
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
