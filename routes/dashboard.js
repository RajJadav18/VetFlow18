const express = require('express');
const auth    = require('../middleware/auth');
const { Animal } = require('../models/Animal');
const { Triage, Ambulance, Inventory } = require('../models/index');
const r = express.Router();
r.use(auth);

r.get('/stats', async (req, res) => {
  try {
    const clinicId = req.user.clinicId;
    const today = new Date(); today.setHours(0,0,0,0);

    const [
      totalAnimals, totalTriages, criticalTriages, activeAmbs,
      lowStock, todayAppts, wildlifeCases,
    ] = await Promise.all([
      Animal.countDocuments({ clinicId }),
      Triage.countDocuments({ clinicId }),
      Triage.countDocuments({ clinicId, urgency: 'CRITICAL', status: { $in: ['PENDING','IN_REVIEW','DISPATCHED'] } }),
      Ambulance.countDocuments({ clinicId, status: { $in: ['DISPATCHED','EN_ROUTE','ON_SCENE'] } }),
      Inventory.countDocuments({ clinicId, $expr: { $lte: ['$quantity','$minThreshold'] } }),
      Triage.countDocuments({ clinicId, createdAt: { $gte: today } }),
      Animal.countDocuments({ clinicId, kind: 'Wildlife' }),
    ]);

    // Weekly triage counts
    const weekly = await Triage.aggregate([
      { $match: { clinicId: require('mongoose').Types.ObjectId.createFromHexString ? require('mongoose').Types.ObjectId(clinicId?.toString()) : clinicId } },
      { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]).catch(() => []);

    // Species breakdown
    const speciesBreak = await Animal.aggregate([
      { $match: { clinicId } },
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).catch(() => []);

    // Recent activity
    const recentTriage = await Triage.find({ clinicId }).sort({ createdAt: -1 }).limit(5).lean();

    res.json({ totalAnimals, totalTriages, criticalTriages, activeAmbs, lowStock, todayAppts, wildlifeCases, weekly, speciesBreak, recentTriage });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = r;
