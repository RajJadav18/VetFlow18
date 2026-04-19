const mongoose = require('mongoose');
const BranchSchema = new mongoose.Schema({
  name:     String,
  address:  String,
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [72.84, 19.01] } },
  phone:    String,
  isActive: { type: Boolean, default: true },
});
const ClinicSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branches:    [BranchSchema],
  plan:        { type: String, enum: ['NGO_FREE','STARTER','PRO','ENTERPRISE'], default: 'STARTER' },
  isVerified:  { type: Boolean, default: false },
}, { timestamps: true });
ClinicSchema.index({ 'branches.location': '2dsphere' });
module.exports = mongoose.model('Clinic', ClinicSchema);
