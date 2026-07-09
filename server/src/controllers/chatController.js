const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');

// @desc    Get or create a conversation thread with a tutor/student
// @route   POST /api/chats
// @access  Private
const createOrGetChat = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    res.status(400);
    throw new Error('Participant ID is required');
  }

  // Find chat thread containing both participants
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, participantId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      messages: [],
    });
  }

  const populatedChat = await Chat.findById(chat._id).populate(
    'participants',
    'fullName avatar role'
  );

  res.status(200).json({ success: true, chat: populatedChat });
});

// @desc    Get all conversation threads for the logged-in user
// @route   GET /api/chats
// @access  Private
const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
  })
    .populate('participants', 'fullName avatar role')
    .sort({ lastMessageAt: -1 });

  res.status(200).json({ success: true, chats });
});

// @desc    Get one chat thread by conversation ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate(
    'participants',
    'fullName avatar role'
  );

  if (!chat || !chat.participants.some((p) => String(p._id) === String(req.user._id))) {
    res.status(404);
    throw new Error('Chat thread not found');
  }

  res.status(200).json({ success: true, chat });
});

// @desc    Send a message in a conversation thread
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { text, attachmentUrl } = req.body;
  const chat = await Chat.findById(req.params.id);

  if (!chat || !chat.participants.map(String).includes(String(req.user._id))) {
    res.status(404);
    throw new Error('Chat thread not found');
  }

  const message = { sender: req.user._id, text, attachmentUrl: attachmentUrl || '' };
  chat.messages.push(message);
  chat.lastMessageAt = new Date();
  await chat.save();

  const saved = chat.messages[chat.messages.length - 1];
  res.status(201).json({ success: true, message: saved });
});

module.exports = {
  createOrGetChat,
  getMyChats,
  getChatById,
  sendMessage,
};
