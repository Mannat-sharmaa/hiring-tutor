const mongoose = require('mongoose');
const User = require('./User');

const studentSchema = new mongoose.Schema({
  currentLevel: {
    type: String,
    enum: [
      'nursery', 'lkg', 'ukg', 'grade_1_5', 'grade_6_8', 'grade_9_10',
      'grade_11_12', 'diploma', 'undergrad', 'postgrad', 'phd', 'competitive_exams',
    ],
  },
  board: { type: String, default: '' },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  favoriteTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalClassesAttended: { type: Number, default: 0 },
  totalHoursLearned: { type: Number, default: 0 },
  wallet: {
    balance: { type: Number, default: 0 },
  },
});

module.exports = User.discriminator('student', studentSchema);
