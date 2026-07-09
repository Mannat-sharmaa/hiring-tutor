const mongoose = require('mongoose');
require('./src/models/Subject');
const Tutor = require('./src/models/Tutor');
require('dotenv').config({ path: './.env' });

const checkManav = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
  
  const manav = await Tutor.findOne({ fullName: 'manav' });
  console.log('Manav Details:', JSON.stringify(manav, null, 2));

  await mongoose.disconnect();
};

checkManav().catch(err => {
  console.error(err);
  process.exit(1);
});
