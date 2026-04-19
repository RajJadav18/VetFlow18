// routes/schedule.js
const express = require('express');
const auth    = require('../middleware/auth');
const { Appointment } = require('../models/index');
const r = express.Router();
r.use(auth);

r.get('/', async (req, res) => {
  try {
    const { date, vetId, status } = req.query;
    const f = { clinicId: req.user.clinicId };
    if (vetId)  f.vetId = vetId;
    if (status) f.status = status;
    if (date) {
      const s = new Date(date); s.setHours(0,0,0,0);
      const e = new Date(date); e.setHours(23,59,59,999);
      f.slotStart = { $gte: s, $lte: e };
    }
    const appts = await Appointment.find(f).sort({ slotStart: 1 }).populate('vetId','name').populate('animalId','name species').lean();
    res.json(appts);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

r.post('/', async (req, res) => {
  try {
    const a = await Appointment.create({
      ...req.body,
      clinicId: req.user.clinicId, branchId: req.user.branchId,
      confirmationNo: `VF-${Date.now().toString().slice(-6)}`,
    });
    if (global.io) global.io.to(`clinic:${req.user.clinicId}`).emit('appt:new', { id: a._id, ownerName: a.ownerName, slotStart: a.slotStart });
    res.status(201).json(a);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

r.patch('/:id', async (req, res) => {
  try {
    const a = await Appointment.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: req.body }, { new: true });
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

r.delete('/:id', async (req, res) => {
  try { await Appointment.findOneAndDelete({ _id: req.params.id, clinicId: req.user.clinicId }); res.json({ message: 'Deleted' }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = r;
