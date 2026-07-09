const mongoose = require('mongoose');
require('./src/models/Subject'); // Register Subject model first
const User = require('./src/models/User');
const Tutor = require('./src/models/Tutor');
require('dotenv').config({ path: './.env' });

const checkDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
  
  const tutors = await Tutor.find({ role: 'tutor' }).populate('subjects.subject');
  console.log('All Tutors in Database:');
  tutors.forEach(t => {
    console.log({
      id: t._id,
      fullName: t.fullName,
      email: t.email,
      subjects: t.subjects.map(s => ({
        subjectName: s.subject?.name,
        subjectId: s.subject?._id
      })),
      verification: t.verification?.overallStatus
    });
  });

  await mongoose.disconnect();
};

checkDb().catch(err => {
  console.error(err);
  process.exit(1);
});
