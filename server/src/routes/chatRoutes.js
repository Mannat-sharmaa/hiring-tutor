const express = require('express');
const {
  createOrGetChat,
  getMyChats,
  getChatById,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createOrGetChat)
  .get(protect, getMyChats);

router.route('/:id')
  .get(protect, getChatById);

router.route('/:id/messages')
  .post(protect, sendMessage);

module.exports = router;
