const mongoose = require('mongoose');

const studyRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a room name'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hostName: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  maxPeople: {
    type: Number,
    default: 8,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  tags: [
    {
      type: String,
      trim: true,
    }
  ],
  isLive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
