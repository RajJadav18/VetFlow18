// ─── client/src/hooks/useSocket.js ───────────────────────────────
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useAppStore }  from '../stores/appStore';
import toast from 'react-hot-toast';

let socket = null;

export function useSocket() {
  const token    = useAuthStore(s => s.token);
  const user     = useAuthStore(s => s.user);
  const setCrit  = useAppStore(s  => s.setCritical);
  const addPing  = useAppStore(s  => s.addPing);

  useEffect(() => {
    if (!token || socket) return;

    socket = io('/', {
      auth:       { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('📡 Socket connected');
      if (user?.clinicId) socket.emit('clinic:join', user.clinicId);
    });

    socket.on('triage:new', data => {
      toast(`🚨 New triage: ${data.chiefComplaint?.slice(0,40)}`, { icon: '🔔' });
      addPing({ id: data.id || Date.now().toString(), type: 'TRIAGE', lat: 19.0178, lng: 72.8406, label: 'New Triage', timestamp: Date.now() });
    });

    socket.on('triage:critical', data => {
      setCrit(data);
      toast.error(`🚨 CRITICAL ALERT — ${data.complaint || 'Emergency reported'}`, { duration: 8000 });
      addPing({ id: data.triageId || Date.now().toString(), type: 'CRITICAL', lat: 19.0178, lng: 72.8406, label: '🚨 Critical', timestamp: Date.now() });
    });

    socket.on('wildlife:sighting', data => {
      toast(`🐍 Wildlife alert: ${data.animalType || 'Unknown'}${data.isVenomous ? ' — VENOMOUS' : ''}`, { icon: '🌿', duration: 6000 });
      addPing({ id: Date.now().toString(), type: 'WILDLIFE', lat: 19.17, lng: 72.91, label: `🐍 ${data.animalType}`, timestamp: Date.now() });
    });

    socket.on('appt:new', data => {
      toast.success(`📅 New appointment — ${data.ownerName}`);
    });

    socket.on('disconnect', reason => {
      console.warn('Socket disconnected:', reason);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token]);

  return socket;
}

export function trackAmbulance(vehicleId, onUpdate) {
  if (!socket) return;
  socket.on(`gps:${vehicleId}`, onUpdate);
  return () => socket?.off(`gps:${vehicleId}`, onUpdate);
}

export function sendGPS(vehicleId, lat, lng, heading = 0, speed = 0) {
  socket?.emit('ambulance:gps', { vehicleId, lat, lng, heading, speed });
}
