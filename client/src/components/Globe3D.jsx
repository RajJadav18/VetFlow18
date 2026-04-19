import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../stores/appStore';

// Convert lat/lng to 3D sphere coords
function latLngToVec3(lat, lng, r = 1.02) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(Math.sin(phi) * Math.cos(theta)) * r,
     Math.cos(phi) * r,
     Math.sin(phi) * Math.sin(theta) * r
  );
}

// Single animated ping on globe surface
function GlobePing({ lat, lng, color = '#FF3B3B', size = 0.018 }) {
  const meshRef  = useRef();
  const ringRef  = useRef();
  const ring2Ref = useRef();
  const pos      = useMemo(() => latLngToVec3(lat, lng), [lat, lng]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + (t % 1.5) * 2;
      ringRef.current.scale.setScalar(s);
      ringRef.current.material.opacity = Math.max(0, 0.8 - (t % 1.5) / 1.5);
    }
    if (ring2Ref.current) {
      const s = 1 + ((t + 0.5) % 1.5) * 2;
      ring2Ref.current.scale.setScalar(s);
      ring2Ref.current.material.opacity = Math.max(0, 0.8 - ((t + 0.5) % 1.5) / 1.5);
    }
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.5;
    }
  });

  // Orient ping to face outward from globe center
  const lookAt = useMemo(() => {
    const m = new THREE.Matrix4();
    m.lookAt(pos, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion();
    q.setFromRotationMatrix(m);
    return q;
  }, [pos]);

  return (
    <group position={pos} quaternion={lookAt}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[size * 1.2, size * 1.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[size * 1.2, size * 1.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Animated globe mesh
function GlobeMesh() {
  const globeRef = useRef();
  const linesRef = useRef();

  // Grid texture via canvas
  const gridTexture = useMemo(() => {
    const c   = document.createElement('canvas');
    c.width = c.height = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#070A0F';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = 'rgba(0,200,150,0.15)';
    ctx.lineWidth = 0.8;
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
    if (globeRef.current) globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={globeRef}>
      {/* Main globe */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={gridTexture}
          transparent opacity={0.92}
          roughness={1} metalness={0}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#00C896" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.12}>
        <torusGeometry args={[1, 0.003, 8, 128]} />
        <meshBasicMaterial color="#00C896" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Floating ambulance dot
function AmbulanceDot({ lat, lng }) {
  const ref = useRef();
  const pos = useMemo(() => latLngToVec3(lat, lng, 1.06), [lat, lng]);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.lerp(pos, 0.05);
      ref.current.material.emissiveIntensity = 1.5 + Math.sin(clock.getElapsedTime() * 4) * 0.8;
    }
  });
  return (
    <mesh ref={ref} position={pos}>
      <boxGeometry args={[0.022, 0.011, 0.032]} />
      <meshStandardMaterial color="#fff" emissive="#FF4444" emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
  );
}

// Main scene
function Scene() {
  const pings = useAppStore(s => s.realtimePings);

  const staticPings = [
    { lat: 19.18, lng: 72.91, color: '#FF3B3B' },
    { lat: 19.06, lng: 72.83, color: '#7EE8A2' },
    { lat: 19.10, lng: 72.87, color: '#3B82F6' },
    { lat: 18.99, lng: 72.85, color: '#FF8C42' },
    { lat: 19.22, lng: 72.88, color: '#FF3B3B' },
  ];

  const PING_COLORS = { CRITICAL: '#FF3B3B', HIGH: '#FF8C42', MEDIUM: '#FFCC00', WILDLIFE: '#7EE8A2', STRAY: '#3B82F6', TRIAGE: '#FF3B3B' };

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.4} color="#00C896" />
      <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />

      <GlobeMesh />

      {/* Static demo pings */}
      {staticPings.map((p, i) => <GlobePing key={`static-${i}`} {...p} />)}

      {/* Real-time pings from socket */}
      {pings.map(p => (
        <GlobePing key={p.id} lat={p.lat} lng={p.lng} color={PING_COLORS[p.type] || '#FF3B3B'} />
      ))}

      {/* Demo ambulance */}
      <AmbulanceDot lat={19.05} lng={72.84} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </>
  );
}

export default function Globe3D() {
  return (
    <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} style={{ background: 'transparent' }}>
      <Scene />
    </Canvas>
  );
}
