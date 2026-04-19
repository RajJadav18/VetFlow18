// models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['owner','vet','technician','receptionist','paramedic','ngo'], default: 'receptionist' },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  branchId: mongoose.Schema.Types.ObjectId,
  phone:    String,
  isActive: { type: Boolean, default: true },
  lastLogin:Date,
}, { timestamps: true });
UserSchema.index({ email: 1 });
UserSchema.index({ clinicId: 1, role: 1 });
module.exports = mongoose.model('User', UserSchema);
