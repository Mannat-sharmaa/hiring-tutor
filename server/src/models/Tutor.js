const mongoose = require('mongoose');
const User = require('./User');

// Tutor-specific fields, layered onto the base User schema via a discriminator.
// This is the document the search/filter page queries against most heavily,
// so several fields carry indexes tuned for that use case.
const tutorSchema = new mongoose.Schema({
  bio: { type: String, maxlength: 2000, default: '' },
  headline: { type: String, maxlength: 150, default: '' }, // e.g. "IIT Grad | 8 Years Experience"
  introVideoUrl: { type: String, default: '' },

  subjects: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
      proficiencyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
      },
    },
  ],

  studentLevels: [
    {
      type: String,
      enum: [
        'nursery', 'lkg', 'ukg', 'grade_1_5', 'grade_6_8', 'grade_9_10',
        'grade_11_12', 'diploma', 'undergrad', 'postgrad', 'phd', 'competitive_exams',
      ],
    },
  ],

  boards: [
    { type: String, enum: ['cbse', 'icse', 'ib', 'igcse', 'cambridge', 'nios', 'jee', 'neet', 'gate', 'upsc', 'ielts', 'toefl', 'gre', 'sat'] },
  ],

  tutorType: {
    type: String,
    enum: ['school_teacher', 'college_professor', 'industry_expert', 'student_tutor', 'retired_teacher', 'corporate_trainer', 'language_expert', 'sports_music_coach', 'special_educator'],
  },

  teachingMode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online',
  },

  location: {
    address: { type: String, default: '' },
    pincode: { type: String, default: '' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },

  languages: [{ type: String }],

  hourlyRate: { type: Number, required: true, min: 0, index: true },
  demoClassPrice: { type: Number, default: 0 }, // 0 = free demo

  experienceYears: { type: Number, default: 0, min: 0 },
  studentsCount: { type: Number, default: 0 },
  classesCompleted: { type: Number, default: 0 },
  responseTimeMinutes: { type: Number, default: 60 },

  ratingAverage: { type: Number, default: 0, min: 0, max: 5, index: true },
  ratingCount: { type: Number, default: 0 },

  availability: [
    {
      day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
      slots: [
        {
          start: { type: String, required: true }, // "17:00"
          end: { type: String, required: true },   // "19:00"
          isBooked: { type: Boolean, default: false },
        },
      ],
    },
  ],

  verification: {
    idVerified: { type: Boolean, default: false },
    idDocumentUrl: { type: String, default: '' },
    degreeVerified: { type: Boolean, default: false },
    degreeDocumentUrl: { type: String, default: '' },
    backgroundCheckStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'passed', 'failed'],
      default: 'not_submitted',
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
  },

  earnings: {
    totalEarned: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    withdrawableBalance: { type: Number, default: 0 },
  },

  isFeatured: { type: Boolean, default: false },
});

// Compound + text indexes to support the Search & Filter page:
// text search across bio/headline, plus common filter combinations.
tutorSchema.index({ headline: 'text', bio: 'text' });
tutorSchema.index({ hourlyRate: 1, ratingAverage: -1 });
tutorSchema.index({ 'location.coordinates': '2dsphere' });
tutorSchema.index({ 'verification.overallStatus': 1, teachingMode: 1 });

module.exports = User.discriminator('tutor', tutorSchema);
