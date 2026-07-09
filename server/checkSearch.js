const mongoose = require('mongoose');
require('./src/models/Subject');
const Tutor = require('./src/models/Tutor');
require('dotenv').config({ path: './.env' });

const checkSearch = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');

  // Let's copy the search filter logic exactly
  const q = 'math';
  const filter = { 
    role: 'tutor', 
    'verification.overallStatus': { $in: ['verified', 'pending'] } 
  };

  if (q) {
    const regex = new RegExp(q, 'i');
    filter.$or = [
      { fullName: regex },
      { headline: regex },
      { bio: regex }
    ];
  }

  console.log('Query Filter:', JSON.stringify(filter, null, 2));

  const tutors = await Tutor.find(filter)
    .select('fullName avatar headline hourlyRate ratingAverage ratingCount subjects teachingMode experienceYears verification.overallStatus isFeatured')
    .populate('subjects.subject', 'name slug')
    .lean();

  console.log('Found Tutors count:', tutors.length);
  console.log('Found Tutors:', tutors.map(t => ({
    id: t._id,
    fullName: t.fullName,
    verification: t.verification?.overallStatus
  })));

  await mongoose.disconnect();
};

checkSearch().catch(err => {
  console.error(err);
  process.exit(1);
});
