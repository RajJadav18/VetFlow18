require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'vetflow', family: 4 });
  console.log('🌱 Connected — seeding...');

  const User          = require('./models/User');
  const Clinic        = require('./models/Clinic');
  const { Animal, Pet, Stray, Wildlife } = require('./models/Animal');
  const { Ambulance, ForestOfficer, Inventory, Appointment } = require('./models/index');

  await Promise.all([User, Clinic, Animal, Ambulance, ForestOfficer, Inventory, Appointment].map(M => M.deleteMany({})));
  console.log('🧹 Cleared');

  const clinic = await Clinic.create({
    name: 'VetFlow Mumbai', plan: 'ENTERPRISE', isVerified: true,
    branches: [
      { name: 'Mumbai Central', address: 'Dadar West, Mumbai 400028', location: { type:'Point', coordinates:[72.8406,19.0178] }, phone:'022-12345678', isActive:true },
      { name: 'Bandra West',    address: 'Hill Road, Mumbai 400050',   location: { type:'Point', coordinates:[72.8261,19.0606] }, phone:'022-87654321', isActive:true },
    ],
  });
  const b1 = clinic.branches[0];
  const pass = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'VetFlow2026!', 12);

  const owner = await User.create({ name:'Dr. Riya Mehta', email: process.env.ADMIN_EMAIL || 'admin@vetflow.in', password:pass, role:'owner', clinicId:clinic._id, branchId:b1._id, phone:'9876543210' });
  await User.insertMany([
    { name:'Dr. Arjun Kumar', email:'arjun@vetflow.in', password:pass, role:'vet',        clinicId:clinic._id, branchId:b1._id, phone:'9876543211' },
    { name:'Priya Patel',     email:'priya@vetflow.in', password:pass, role:'technician', clinicId:clinic._id, branchId:b1._id, phone:'9876543212' },
    { name:'Rahul Verma',     email:'rahul@vetflow.in', password:pass, role:'paramedic',  clinicId:clinic._id, branchId:b1._id, phone:'9876543213' },
  ]);
  await Clinic.findByIdAndUpdate(clinic._id, { ownerUserId: owner._id });
  console.log('✅ Users (4)');

  await Ambulance.insertMany([
    { vehicleId:'VF-AMB-001', vehicleNo:'MH01AB1234', clinicId:clinic._id, branchId:b1._id, status:'IDLE', isOperational:true, location:{type:'Point',coordinates:[72.8406,19.0178]} },
    { vehicleId:'VF-AMB-002', vehicleNo:'MH01AB5678', clinicId:clinic._id, branchId:b1._id, status:'IDLE', isOperational:true, location:{type:'Point',coordinates:[72.8320,19.0200]} },
    { vehicleId:'VF-AMB-003', vehicleNo:'MH01CD9012', clinicId:clinic._id, branchId:clinic.branches[1]._id, status:'IDLE', isOperational:true, location:{type:'Point',coordinates:[72.8261,19.0606]} },
  ]);
  console.log('✅ Ambulances (3)');

  await ForestOfficer.insertMany([
    { name:'RFO Suresh Patil',  badgeNo:'MH/SGNP/001', phone:'9876512345', rangeOffice:'Aarey Range',   state:'MH', location:{type:'Point',coordinates:[72.9157,19.1765]}, isAvailable:true, specializations:['Reptile','BigCat'] },
    { name:'RFO Ramesh Sharma', badgeNo:'MH/SGNP/002', phone:'8765498765', rangeOffice:'Borivali Range', state:'MH', location:{type:'Point',coordinates:[72.8777,19.2183]}, isAvailable:true, specializations:['Primate','Avian'] },
    { name:'RFO Anita Kumar',   badgeNo:'MH/SGNP/003', phone:'7654321098', rangeOffice:'Powai Range',    state:'MH', location:{type:'Point',coordinates:[72.9019,19.1222]}, isAvailable:true, specializations:['Reptile'] },
  ]);
  console.log('✅ Forest Officers (3)');

  await Inventory.insertMany([
    { clinicId:clinic._id, branchId:b1._id, name:'Amoxicillin 250mg',  category:'ANTIBIOTIC',    quantity:148, unit:'TABLETS', minThreshold:50,  expiryDate:new Date('2026-09-01'), costPerUnit:8   },
    { clinicId:clinic._id, branchId:b1._id, name:'Rabies Vaccine',     category:'VACCINE',        quantity:12,  unit:'VIALS',   minThreshold:20,  expiryDate:new Date('2026-06-01'), costPerUnit:120 },
    { clinicId:clinic._id, branchId:b1._id, name:'Ketamine HCl',       category:'SEDATIVE',       quantity:3,   unit:'VIALS',   minThreshold:10,  expiryDate:new Date('2026-12-01'), costPerUnit:450, isScheduled:true, schedClass:'H' },
    { clinicId:clinic._id, branchId:b1._id, name:'Ivermectin 1%',      category:'ANTIPARASITIC',  quantity:34,  unit:'VIALS',   minThreshold:10,  expiryDate:new Date('2027-03-01'), costPerUnit:95  },
    { clinicId:clinic._id, branchId:b1._id, name:'Metronidazole 400mg',category:'ANTIBIOTIC',    quantity:220, unit:'TABLETS', minThreshold:50,  expiryDate:new Date('2027-01-01'), costPerUnit:5   },
    { clinicId:clinic._id, branchId:b1._id, name:'Dexamethasone Inj',  category:'ANALGESIC',      quantity:8,   unit:'VIALS',   minThreshold:15,  expiryDate:new Date('2026-04-30'), costPerUnit:65  },
    { clinicId:clinic._id, branchId:b1._id, name:'Atropine Sulphate',  category:'ANALGESIC',      quantity:45,  unit:'VIALS',   minThreshold:10,  expiryDate:new Date('2027-08-01'), costPerUnit:42  },
  ]);
  console.log('✅ Inventory (7)');

  await Pet.create([
    { name:'Bruno',  species:'Canine', breed:'Labrador',  ageMonths:36, weightKg:28, sex:'Male',   clinicId:clinic._id, branchId:b1._id, ownerName:'Mr. Ravi Sharma', ownerPhone:'9812345678', microchipId:'985141001234567', urgency:'OBSERVATION' },
    { name:'Shadow', species:'Feline', breed:'Siamese',   ageMonths:60, weightKg:4,  sex:'Male',   clinicId:clinic._id, branchId:b1._id, ownerName:'Ms. Iyer',       ownerPhone:'9823456789', urgency:'OBSERVATION' },
  ]);
  await Stray.create([
    { name:'Mochi', species:'Feline', breed:'Persian', ageMonths:24, sex:'Female', clinicId:clinic._id, branchId:b1._id, foundAt:{type:'Point',coordinates:[72.835,19.12],address:'Andheri Metro Station'}, adoptionStatus:'AVAILABLE', urgency:'MEDIUM' },
    { name:'Rex',   species:'Canine', breed:'GSD',     ageMonths:12, sex:'Male',   clinicId:clinic._id, branchId:b1._id, foundAt:{type:'Point',coordinates:[72.857,18.995],address:'Dharavi Sector 7'}, adoptionStatus:'AVAILABLE', urgency:'HIGH' },
  ]);
  console.log('✅ Animals (4)');

  console.log(`
🎉 ══════════════════════════════
   SEED COMPLETE
══════════════════════════════
   Clinic ID : ${clinic._id}
   Email     : ${process.env.ADMIN_EMAIL || 'admin@vetflow.in'}
   Password  : ${process.env.ADMIN_PASSWORD || 'VetFlow2026!'}
══════════════════════════════
  `);
  await mongoose.disconnect();
}

seed().catch(e => { console.error('❌', e); process.exit(1); });
