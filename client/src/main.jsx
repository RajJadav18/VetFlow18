// ─── client/src/main.jsx ────────────────────────────────────────
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#131920', color: '#F0F4F8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' },
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
