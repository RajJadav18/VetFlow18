// ── Triage model ──────────────────────────────────────────────
const mongoose = require('mongoose');

const TriageSchema = new mongoose.Schema({
  clinicId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  branchId:      mongoose.Schema.Types.ObjectId,
  animalId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' },
  reportedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterPhone: String,
  chiefComplaint:{ type: String, required: true },
  symptoms:      [String],
  photos:        [String],
  urgency:       { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW','OBSERVATION'], default: 'MEDIUM' },
  urgencyScore:  { type: Number, min: 0, max: 100, default: 50 },
  species:       String,
  animalName:    String,
  isWildlife:    { type: Boolean, default: false },
  isVenomous:    { type: Boolean, default: false },
  escalation: {
    ambulanceDispatched: { type: Boolean, default: false },
    ambulanceId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
    forestNotified:      { type: Boolean, default: false },
    officerId:           { type: mongoose.Schema.Types.ObjectId, ref: 'ForestOfficer' },
    vetAssigned:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  vetNotes:  String,
  status:    { type: String, enum: ['PENDING','IN_REVIEW','DISPATCHED','RESOLVED','CLOSED'], default: 'PENDING' },
  resolvedAt:Date,
  location:  { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] },
  channel:   { type: String, enum: ['WEB','MOBILE','NGO','WALK_IN'], default: 'WEB' },
}, { timestamps: true });

TriageSchema.index({ clinicId: 1, urgency: 1, createdAt: -1 });
TriageSchema.index({ status: 1, createdAt: -1 });
TriageSchema.index({ location: '2dsphere' });
const Triage = mongoose.model('Triage', TriageSchema);

// ── Ambulance model ───────────────────────────────────────────
const AmbSchema = new mongoose.Schema({
  vehicleId:   { type: String, required: true, unique: true },
  vehicleNo:   String,
  clinicId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  branchId:    mongoose.Schema.Types.ObjectId,
  driverId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['IDLE','DISPATCHED','EN_ROUTE','ON_SCENE','RETURNING'], default: 'IDLE' },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [72.8406, 19.0178] },
    heading:     { type: Number, default: 0 },
    speed:       { type: Number, default: 0 },
    updatedAt:   Date,
  },
  trail:       [{ coordinates: [Number], at: Date }],
  dispatch: {
    triageId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Triage' },
    pickupAddress: String,
    pickupCoords:  [Number],
    dispatchedAt:  Date, arrivedAt: Date, completedAt: Date,
  },
  isOperational:{ type: Boolean, default: true },
  totalTrips:   { type: Number, default: 0 },
}, { timestamps: true });
AmbSchema.index({ location: '2dsphere' });
AmbSchema.index({ clinicId: 1, status: 1 });
const Ambulance = mongoose.model('Ambulance', AmbSchema);

// ── ForestOfficer model ───────────────────────────────────────
const FOSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  badgeNo:     { type: String, unique: true },
  phone:       { type: String, required: true },
  email:       String,
  rangeOffice: String,
  division:    String,
  state:       String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  specializations:[{ type: String, enum: ['Reptile','BigCat','Elephant','Primate','Avian','Marine'] }],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });
FOSchema.index({ location: '2dsphere' });
const ForestOfficer = mongoose.model('ForestOfficer', FOSchema);

// ── Inventory model ───────────────────────────────────────────
const InvSchema = new mongoose.Schema({
  clinicId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  branchId:    mongoose.Schema.Types.ObjectId,
  name:        { type: String, required: true },
  genericName: String,
  category:    { type: String, enum: ['VACCINE','ANTIBIOTIC','ANTIPARASITIC','ANALGESIC','SEDATIVE','SUPPLEMENT','CONSUMABLE','EQUIPMENT'] },
  sku:         String,
  quantity:    { type: Number, required: true, min: 0 },
  unit:        { type: String, enum: ['VIALS','TABLETS','ML','STRIPS','PIECES','KG','BOXES'] },
  minThreshold:Number,
  expiryDate:  Date,
  costPerUnit: Number,
  supplier:    String,
  isScheduled: { type: Boolean, default: false },
  schedClass:  String,
  notes:       String,
}, { timestamps: true });
InvSchema.index({ clinicId: 1, branchId: 1 });
InvSchema.index({ expiryDate: 1 });
const Inventory = mongoose.model('Inventory', InvSchema);

// ── Appointment model ─────────────────────────────────────────
const ApptSchema = new mongoose.Schema({
  clinicId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  branchId:      mongoose.Schema.Types.ObjectId,
  vetId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animalId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' },
  ownerName:     String, ownerPhone: String,
  slotStart:     { type: Date, required: true },
  slotEnd:       Date,
  slotType:      { type: String, enum: ['GENERAL','EMERGENCY','SURGERY','GROOMING'], default: 'GENERAL' },
  complaint:     String,
  status:        { type: String, enum: ['PENDING','CONFIRMED','COMPLETED','CANCELLED'], default: 'CONFIRMED' },
  confirmationNo:String,
  notes:         String,
}, { timestamps: true });
ApptSchema.index({ clinicId: 1, vetId: 1, slotStart: 1 });
const Appointment = mongoose.model('Appointment', ApptSchema);

module.exports = { Triage, Ambulance, ForestOfficer, Inventory, Appointment };
