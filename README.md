<<<<<<< HEAD
# 🌊 VetFlow — Veterinary & Wildlife Management Platform

Full-stack MERN app with 3D Three.js globe, real-time Socket.io GPS, and complete clinic management.

## Quick Start

```bash
# 1. Install all dependencies
npm run install-all

# 2. Create .env from .env.example and fill in your values
cp .env.example .env

# 3. Run the seed script (creates clinic, users, inventory)
node seed.js

# 4. Run dev mode (backend only)
npm run dev

# 5. In a new terminal, run React frontend
cd client && npm run dev
```

## Deploy to Render

1. Push to GitHub
2. Create Web Service on Render → connect your repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add env vars from `.env.example` in Render dashboard
6. After deploy, run seed: open Render Shell → `node seed.js`

## Demo Login
- Email: `admin@vetflow.in`
- Password: `VetFlow2026!`

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io
- **Frontend**: React 18, Three.js (React Three Fiber), Framer Motion, Recharts, Tailwind CSS
- **Database**: MongoDB Atlas with Discriminator schema pattern
- **Real-time**: Socket.io for GPS ambulance tracking and emergency alerts

## Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | 3D animated login |
| Dashboard | `/` | 3D globe hero + live stats |
| Triage | `/triage` | Case management + urgency scoring |
| Ambulance | `/ambulance` | 3D city map with GPS tracking |
| Wildlife | `/wildlife` | Forest module + officer contacts |
| Animals | `/animals` | Full medical records + discriminators |
| Inventory | `/inventory` | Medicine stock management |
| Schedule | `/schedule` | Appointment booking |
| Staff | `/staff` | Team management + duty roster |
| Adoption | `/adoption` | Animal adoption board |
| Analytics | `/analytics` | Charts + branch performance |
=======
# VetFlow
>>>>>>> 42990cb762797c90ed6cd76d87e9d9d0e28acbb2
