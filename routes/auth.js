// ═══════════════════════════════════════════════════════════════
// routes/auth.js
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authRouter = express.Router();
const limiter = rateLimit({ windowMs: 60000, max: 10 });

authRouter.post('/login', limiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).lean();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, clinicId: user.clinicId, branchId: user.branchId, name: user.name },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, clinicId, branchId, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role: role || 'receptionist', clinicId, branchId, phone });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

authRouter.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('clinicId', 'name plan branches').lean();
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

authRouter.post('/change-password', auth, async (req, res) => {
  try {
    const { old: oldPw, new: newPw } = req.body;
    const user = await User.findById(req.user.id);
    if (!await bcrypt.compare(oldPw, user.password)) return res.status(400).json({ error: 'Wrong current password' });
    user.password = await bcrypt.hash(newPw, 12);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = authRouter;
