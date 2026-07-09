const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tutor = require('./src/models/Tutor');
require('dotenv').config({ path: './.env' });

const checkDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
  
  const tutors = await Tutor.find({ role: 'tutor' });
  console.log('All Tutors in Database:', tutors.map(t => ({
    id: t._id,
    fullName: t.fullName,
    email: t.email,
    verification: t.verification
  })));

  const subjects = await mongoose.model('Subject').find({});
  console.log('All Subjects:', subjects.map(s => ({ id: s._id, name: s.name })));
  
  await mongoose.disconnect();
};

checkDb().catch(err => {
  console.error(err);
  process.exit(1);
});
