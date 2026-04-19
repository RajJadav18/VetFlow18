// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server:  { proxy: { '/api': 'http://localhost:5000', '/socket.io': { target: 'http://localhost:5000', ws: true } } },
  build:   { outDir: 'dist', chunkSizeWarningLimit: 2000,
    rollupOptions: { output: { manualChunks: { three: ['three','@react-three/fiber','@react-three/drei'], vendor: ['react','react-dom','react-router-dom','zustand','axios'] } } }
  },
});
