// routes/staff.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const auth    = require('../middleware/auth');
const User    = require('../models/User');
const r = express.Router();
r.use(auth);

r.get('/',    async (req, res) => { try { res.json(await User.find({ clinicId: req.user.clinicId, isActive: true }).select('-password').sort({ name: 1 }).lean()); } catch(e) { res.status(500).json({ error: e.message }); } });
r.post('/',   async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email exists' });
    const u = await User.create({ name, email: email.toLowerCase(), password: await bcrypt.hash(password || 'VetFlow2026!', 12), role, phone, clinicId: req.user.clinicId, branchId: req.user.branchId });
    res.status(201).json({ id: u._id, name: u.name, email: u.email, role: u.role });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
r.patch('/:id',  async (req, res) => {
  try {
    const { password, ...upd } = req.body;
    if (password) upd.password = await bcrypt.hash(password, 12);
    const u = await User.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: upd }, { new: true }).select('-password');
    res.json(u);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
r.delete('/:id', async (req, res) => {
  try { await User.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: { isActive: false } }); res.json({ message: 'Deactivated' }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
module.exports = r;
