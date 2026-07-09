const express = require('express');
const router = express.Router();
const {
  getStudyRooms,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
} = require('../controllers/studyRoomController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getStudyRooms)
  .post(protect, createStudyRoom);

router.patch('/:id/join', protect, joinStudyRoom);
router.patch('/:id/leave', protect, leaveStudyRoom);

module.exports = router;
