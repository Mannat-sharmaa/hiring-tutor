const express = require('express');
const {
  createBooking,
  getMyBookings,
  respondToBooking,
  cancelBooking,
  saveBookingNotes,
  completeBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('student'), createBooking);
router.get('/me', protect, getMyBookings);
router.patch('/:id/respond', protect, authorize('tutor'), respondToBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/complete', protect, completeBooking);
router.post('/:id/notes', protect, authorize('tutor'), saveBookingNotes);

module.exports = router;
