const asyncHandler = require('express-async-handler');
const StudyRoom = require('../models/StudyRoom');

// @desc    Get all study rooms
// @route   GET /api/study-rooms
// @access  Public
const getStudyRooms = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const filter = { isLive: true };
  if (subject && subject !== 'All') {
    filter.subject = subject;
  }
  const rooms = await StudyRoom.find(filter)
    .populate('host', 'fullName avatar')
    .populate('participants', 'fullName avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

// @desc    Create a study room
// @route   POST /api/study-rooms
// @access  Private
const createStudyRoom = asyncHandler(async (req, res) => {
  const { name, subject, maxPeople, isPrivate, tags } = req.body;

  if (!name || !subject) {
    res.status(400);
    throw new Error('Please provide name and subject');
  }

  const room = await StudyRoom.create({
    name,
    subject,
    maxPeople: maxPeople || 8,
    isPrivate: !!isPrivate,
    tags: tags || [],
    host: req.user._id,
    hostName: req.user.fullName,
    participants: [req.user._id],
  });

  res.status(201).json({ success: true, data: room });
});

// @desc    Join a study room
// @route   PATCH /api/study-rooms/:id/join
// @access  Private
const joinStudyRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  if (room.participants.length >= room.maxPeople) {
    res.status(400);
    throw new Error('Room is full');
  }

  if (!room.participants.includes(req.user._id)) {
    room.participants.push(req.user._id);
    await room.save();
  }

  res.status(200).json({ success: true, data: room });
});

// @desc    Leave a study room
// @route   PATCH /api/study-rooms/:id/leave
// @access  Private
const leaveStudyRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  room.participants = room.participants.filter(
    (pId) => pId.toString() !== req.user._id.toString()
  );

  // If host leaves and no participants remain, close the room
  if (room.host.toString() === req.user._id.toString() && room.participants.length === 0) {
    room.isLive = false;
  }

  await room.save();

  res.status(200).json({ success: true, data: room });
});

module.exports = {
  getStudyRooms,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
};
