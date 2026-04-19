const express = require('express');
const auth    = require('../middleware/auth');
const { Inventory } = require('../models/index');
const r = express.Router();
r.use(auth);

r.get('/', async (req, res) => {
  try {
    const { category, lowStock, expiring, page = 1, limit = 50 } = req.query;
    const f = { clinicId: req.user.clinicId };
    if (category) f.category = category;
    if (lowStock === 'true') f.$expr = { $lte: ['$quantity','$minThreshold'] };
    if (expiring === 'true') { const d = new Date(); d.setDate(d.getDate()+30); f.expiryDate = { $lte: d, $gte: new Date() }; }
    const items = await Inventory.find(f).sort({ quantity: 1 }).skip((page-1)*limit).limit(+limit).lean();
    res.json(items);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

r.post('/', async (req, res) => {
  try { const i = await Inventory.create({ ...req.body, clinicId: req.user.clinicId, branchId: req.user.branchId }); res.status(201).json(i); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

r.patch('/:id', async (req, res) => {
  try { const i = await Inventory.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: req.body }, { new: true }); res.json(i); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

r.post('/:id/use', async (req, res) => {
  try {
    const { qty } = req.body;
    const i = await Inventory.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId, quantity: { $gte: qty } }, { $inc: { quantity: -qty } }, { new: true });
    if (!i) return res.status(400).json({ error: 'Insufficient stock' });
    res.json(i);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

r.delete('/:id', async (req, res) => {
  try { await Inventory.findOneAndDelete({ _id: req.params.id, clinicId: req.user.clinicId }); res.json({ message: 'Deleted' }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = r;
