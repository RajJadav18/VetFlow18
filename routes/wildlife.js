// routes/wildlife.js
const express = require('express');
const auth    = require('../middleware/auth');
const { Wildlife }      = require('../models/Animal');
const { ForestOfficer } = require('../models/index');
const r = express.Router();
r.use(auth);

r.get('/',         async (req, res) => { try { res.json(await Wildlife.find({ clinicId: req.user.clinicId }).sort({ createdAt: -1 }).lean()); } catch(e) { res.status(500).json({ error: e.message }); } });
r.get('/officers', async (req, res) => { try { res.json(await ForestOfficer.find({}).lean()); } catch(e) { res.status(500).json({ error: e.message }); } });
r.get('/officers/nearest', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat||!lng) return res.status(400).json({ error: 'lat lng required' });
    const officers = await ForestOfficer.find({ isAvailable: true, location: { $near: { $geometry: { type:'Point', coordinates:[+lng,+lat] }, $maxDistance:50000 } } }).limit(3).lean();
    res.json({ officers, helpline: '9871963535' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
r.post('/', async (req, res) => {
  try {
    const wl = await Wildlife.create({ kind:'Wildlife', ...req.body, clinicId: req.user.clinicId, branchId: req.user.branchId });
    if ((req.body.isVenomous) && global.io) global.io.emit('wildlife:sighting', { animalType: req.body.commonName, isVenomous: true });
    res.status(201).json(wl);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
r.patch('/:id', async (req, res) => {
  try {
    const wl = await Wildlife.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: req.body }, { new: true });
    res.json(wl);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
module.exports = r;
