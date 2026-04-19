// routes/animals.js
const express = require('express');
const auth    = require('../middleware/auth');
const { Animal, Pet, Stray, Wildlife } = require('../models/Animal');

const r = express.Router();
r.use(auth);

r.get('/', async (req, res) => {
  try {
    const { kind, species, urgency, search, page = 1, limit = 20 } = req.query;
    const f = { clinicId: req.user.clinicId };
    if (kind)    f.kind = kind;
    if (species) f.species = species;
    if (urgency) f.urgency = urgency;
    if (search)  f.name = { $regex: search, $options: 'i' };
    const [animals, total] = await Promise.all([
      Animal.find(f).sort({ updatedAt: -1 }).skip((page-1)*limit).limit(+limit).lean(),
      Animal.countDocuments(f),
    ]);
    res.json({ animals, total, page: +page });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post('/', async (req, res) => {
  try {
    const { kind, ...data } = req.body;
    if (!kind) return res.status(400).json({ error: 'kind required' });
    const Model = kind === 'Pet' ? Pet : kind === 'Stray' ? Stray : Wildlife;
    const animal = await Model.create({ kind, ...data, clinicId: req.user.clinicId, branchId: req.user.branchId });
    res.status(201).json(animal);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.get('/:id', async (req, res) => {
  try {
    const a = await Animal.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).lean();
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.patch('/:id', async (req, res) => {
  try {
    const a = await Animal.findOneAndUpdate({ _id: req.params.id, clinicId: req.user.clinicId }, { $set: req.body }, { new: true });
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.delete('/:id', auth, require('../middleware/auth').role('owner','vet'), async (req, res) => {
  try {
    await Animal.findOneAndDelete({ _id: req.params.id, clinicId: req.user.clinicId });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post('/:id/history', async (req, res) => {
  try {
    const a = await Animal.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId },
      { $push: { medicalHistory: { date: new Date(), ...req.body, vetId: req.user.id } } },
      { new: true }
    );
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = r;
