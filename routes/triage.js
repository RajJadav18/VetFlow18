const express = require('express');
const auth    = require('../middleware/auth');
const { Triage } = require('../models/index');

const r = express.Router();
r.use(auth);

r.get('/', async (req, res) => {
  try {
    const { status, urgency, page = 1, limit = 20 } = req.query;
    const f = { clinicId: req.user.clinicId };
    if (status) f.status = status;
    if (urgency) f.urgency = urgency;
    const [logs, total] = await Promise.all([
      Triage.find(f).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit).populate('animalId','name species').populate('escalation.vetAssigned','name').lean(),
      Triage.countDocuments(f),
    ]);
    res.json({ logs, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post('/', async (req, res) => {
  try {
    const { chiefComplaint, urgency, urgencyScore, species, animalName, isWildlife, isVenomous, reporterPhone, location, channel, animalId } = req.body;
    if (!chiefComplaint) return res.status(400).json({ error: 'chiefComplaint required' });
    const t = await Triage.create({
      clinicId: req.user.clinicId, branchId: req.user.branchId,
      reportedBy: req.user.id, chiefComplaint, urgency: urgency || 'MEDIUM',
      urgencyScore: urgencyScore || 50, species, animalName, isWildlife, isVenomous,
      reporterPhone, animalId,
      location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
      channel: channel || 'WEB',
    });
    // Real-time broadcast
    if (global.io) {
      global.io.to(`clinic:${req.user.clinicId}`).emit('triage:new', { id: t._id, urgency: t.urgency, chiefComplaint: t.chiefComplaint });
      if (urgency === 'CRITICAL') global.io.emit('triage:critical', { clinicId: req.user.clinicId, triageId: t._id, complaint: chiefComplaint });
    }
    res.status(201).json(t);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.get('/:id', async (req, res) => {
  try {
    const t = await Triage.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).populate('animalId').populate('escalation.vetAssigned','name phone').lean();
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.patch('/:id', async (req, res) => {
  try {
    const t = await Triage.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: req.body }, { new: true });
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.patch('/:id/resolve', async (req, res) => {
  try {
    const t = await Triage.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId },
      { $set: { status: 'RESOLVED', resolvedAt: new Date(), vetNotes: req.body.notes } },
      { new: true }
    );
    res.json(t);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = r;
