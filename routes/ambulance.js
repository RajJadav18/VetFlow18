// routes/ambulance.js
const express = require('express');
const auth    = require('../middleware/auth');
const { Ambulance } = require('../models/index');

const r = express.Router();
r.use(auth);

r.get('/', async (req, res) => {
  try { res.json(await Ambulance.find({ clinicId: req.user.clinicId }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

r.get('/nearest', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat lng required' });
    const amb = await Ambulance.findOne({
      clinicId: req.user.clinicId, status: 'IDLE', isOperational: true,
      location: { $near: { $geometry: { type: 'Point', coordinates: [+lng, +lat] }, $maxDistance: 30000 } },
    }).lean();
    res.json(amb);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post('/:vid/dispatch', async (req, res) => {
  try {
    const { pickupAddress, pickupLat, pickupLng, triageId, urgency } = req.body;
    const amb = await Ambulance.findOne({ vehicleId: req.params.vid, clinicId: req.user.clinicId });
    if (!amb) return res.status(404).json({ error: 'Not found' });
    if (amb.status !== 'IDLE') return res.status(409).json({ error: `Ambulance is ${amb.status}` });
    amb.status = 'DISPATCHED';
    amb.dispatch = { triageId, pickupAddress, pickupCoords: [+pickupLng || 0, +pickupLat || 0], dispatchedAt: new Date() };
    await amb.save();
    if (urgency === 'CRITICAL' && global.io) {
      global.io.emit('triage:critical', { clinicId: req.user.clinicId, vehicleId: amb.vehicleId, pickupAddress });
    }
    res.json({ dispatched: true, ambulance: amb });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.patch('/:vid/status', async (req, res) => {
  try {
    const amb = await Ambulance.findOneAndUpdate({ vehicleId: req.params.vid, clinicId: req.user.clinicId }, { $set: { status: req.body.status } }, { new: true });
    if (global.io) global.io.emit(`amb:status:${req.params.vid}`, { status: req.body.status });
    res.json(amb);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post('/', auth, async (req, res) => {
  try {
    const amb = await Ambulance.create({ ...req.body, clinicId: req.user.clinicId, branchId: req.user.branchId });
    res.status(201).json(amb);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = r;
