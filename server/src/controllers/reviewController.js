const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const notify = require('../utils/notify');
const getIo = () => require('../server').io;

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
// @access  Private (student)
const submitReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    res.status(400);
    throw new Error('bookingId and rating are required');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the student of this booking can leave a review');
  }

  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review a completed class');
  }

  // One review per booking (unique index on booking field)
  const existing = await Review.findOne({ booking: bookingId });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this class');
  }

  const review = await Review.create({
    booking: bookingId,
    student: req.user._id,
    tutor: booking.tutor,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: comment || '',
  });

  // 🔔 Notify tutor: new review received
  await notify(getIo(), booking.tutor, {
    type: 'new_review',
    title: '⭐ New Review Received',
    body: `${req.user.fullName || 'A student'} gave you a ${rating}-star rating. Check your profile!`,
    link: '/tutor/profile',
  });

  res.status(201).json({ success: true, review });
});

// @desc    Get all reviews for a tutor
// @route   GET /api/reviews/tutor/:tutorId
// @access  Public
const getTutorReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ tutor: req.params.tutorId, isFlagged: false })
    .populate('student', 'fullName avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, reviews });
});

// @desc    Check if student already reviewed a booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
const getReviewByBooking = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ booking: req.params.bookingId });
  res.json({ success: true, review: review || null });
});

module.exports = { submitReview, getTutorReviews, getReviewByBooking };
