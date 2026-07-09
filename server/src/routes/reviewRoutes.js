const express = require('express');
const { submitReview, getTutorReviews, getReviewByBooking } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitReview);
router.get('/tutor/:tutorId', getTutorReviews);
router.get('/booking/:bookingId', protect, getReviewByBooking);

module.exports = router;
