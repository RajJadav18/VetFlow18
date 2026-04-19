const mongoose = require('mongoose');

const medHistSchema = new mongoose.Schema({ date: Date, diagnosis: String, treatment: String, vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, notes: String }, { _id: false });
const vaccSchema    = new mongoose.Schema({ vaccine: String, date: Date, nextDue: Date, batchNo: String }, { _id: false });

const AnimalBase = new mongoose.Schema({
  kind:           { type: String, required: true, enum: ['Pet','Stray','Wildlife'] },
  name:           { type: String, default: 'Unknown' },
  species:        { type: String, enum: ['Canine','Feline','Bovine','Equine','Avian','Reptile','Exotic','Other'], required: true },
  breed:          String,
  ageMonths:      Number,
  weightKg:       Number,
  sex:            { type: String, enum: ['Male','Female','Unknown'], default: 'Unknown' },
  colorMarkings:  String,
  photos:         [String],
  clinicId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  branchId:       mongoose.Schema.Types.ObjectId,
  medicalHistory: [medHistSchema],
  vaccinations:   [vaccSchema],
  urgency:        { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW','OBSERVATION'], default: 'OBSERVATION' },
  isDeceased:     { type: Boolean, default: false },
  deceasedAt:     Date,
  notes:          String,
}, { timestamps: true, discriminatorKey: 'kind' });

AnimalBase.index({ clinicId: 1, kind: 1 });
AnimalBase.index({ urgency: 1, createdAt: -1 });

const Animal = mongoose.model('Animal', AnimalBase);

// Pet discriminator
const Pet = Animal.discriminator('Pet', new mongoose.Schema({
  ownerName:  String, ownerPhone: String, ownerEmail: String,
  microchipId:{ type: String, sparse: true },
  insuranceNo:String, nextVisit: Date,
}));

// Stray discriminator
const Stray = Animal.discriminator('Stray', new mongoose.Schema({
  reportedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterPhone: String,
  foundAt: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    address: String,
  },
  rescuedAt:     Date,
  adoptionStatus:{ type: String, enum: ['AVAILABLE','IN_FOSTER','ADOPTED','RELEASED'], default: 'AVAILABLE' },
}));

// Wildlife discriminator
const Wildlife = Animal.discriminator('Wildlife', new mongoose.Schema({
  commonName:     String,
  scientificName: String,
  iucnStatus:     { type: String, enum: ['LC','NT','VU','EN','CR','EW','EX'] },
  isVenomous:     { type: Boolean, default: false },
  sightingAt: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    forestBlock: String, nearestVillage: String,
  },
  forestCaseNo:   String,
  officerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ForestOfficer' },
  releasedToWild: { type: Boolean, default: false },
  releasedAt:     Date,
  threatLevel:    { type: String, enum: ['SAFE','INJURED','AGGRESSIVE','DECEASED'], default: 'SAFE' },
}));

module.exports = { Animal, Pet, Stray, Wildlife };
