require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const compression= require('compression');
const morgan     = require('morgan');
const path       = require('path');

const authRouter      = require('./routes/auth');
const animalsRouter   = require('./routes/animals');
const triageRouter    = require('./routes/triage');
const ambulanceRouter = require('./routes/ambulance');
const wildlifeRouter  = require('./routes/wildlife');
const inventoryRouter = require('./routes/inventory');
const scheduleRouter  = require('./routes/schedule');
const staffRouter     = require('./routes/staff');
const dashRouter      = require('./routes/dashboard');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET','POST'] },
  transports: ['websocket','polling'],
});

// ── MongoDB ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB_NAME || 'vetflow',
  maxPoolSize: 10, family: 4,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// ── Middleware ───────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: [process.env.FRONTEND_URL || '', 'http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(compression());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// ── Socket.io ────────────────────────────────────────────────
global.io = io;
io.on('connection', socket => {
  socket.on('clinic:join', clinicId => socket.join(`clinic:${clinicId}`));
  socket.on('ambulance:register', vehicleId => { socket.join(`amb:${vehicleId}`); console.log(`🚑 ${vehicleId} online`); });
  socket.on('ambulance:gps', async data => {
    try {
      const Ambulance = require('./models/Ambulance');
      await Ambulance.findOneAndUpdate({ vehicleId: data.vehicleId }, {
        $set: { 'location.coordinates': [data.lng, data.lat], 'location.heading': data.heading, 'location.speed': data.speed, 'location.updatedAt': new Date() },
        $push: { trail: { $each: [{ coordinates: [data.lng, data.lat], at: new Date() }], $slice: -300 } },
      });
      io.emit(`gps:${data.vehicleId}`, { lat: data.lat, lng: data.lng, heading: data.heading });
    } catch(e) { console.error('GPS error:', e.message); }
  });
  socket.on('disconnect', () => {});
});

// ── API Routes ───────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '1.0.0', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth',      authRouter);
app.use('/api/dashboard', dashRouter);
app.use('/api/animals',   animalsRouter);
app.use('/api/triage',    triageRouter);
app.use('/api/ambulance', ambulanceRouter);
app.use('/api/wildlife',  wildlifeRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/schedule',  scheduleRouter);
app.use('/api/staff',     staffRouter);

// ── Serve React in production ────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html')));
}

// ── Error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = parseInt(process.env.PORT || '5000');
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 VetFlow running on port ${PORT}`));
