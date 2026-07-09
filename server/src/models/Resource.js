const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
  },
  type: {
    type: String,
    default: 'PDF',
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tutorName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  pages: {
    type: Number,
    default: 1,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  tags: [
    {
      type: String,
      trim: true,
    }
  ],
  preview: {
    type: String,
    required: [true, 'Please provide a preview/description'],
  },
  fileUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resource', resourceSchema);
