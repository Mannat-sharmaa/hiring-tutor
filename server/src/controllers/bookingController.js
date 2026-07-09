const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const notify = require('../utils/notify');

// Lazily get the io instance to avoid circular-require issues at startup
const getIo = () => require('../server').io;

const PLATFORM_COMMISSION_RATE = 0.1;

// @desc    Create a booking (pending until payment is confirmed)
// @route   POST /api/bookings
// @access  Private (student)
const createBooking = asyncHandler(async (req, res) => {
  const { tutorId, subjectId, classType, isDemoClass, scheduledDate, startTime, durationMinutes } = req.body;

  const tutor = await Tutor.findOne({ _id: tutorId, role: 'tutor' });
  if (!tutor) {
    res.status(404);
    throw new Error('Tutor not found');
  }

  const hourlyRate = isDemoClass ? tutor.demoClassPrice : tutor.hourlyRate;
  const tutorFee = hourlyRate;
  const platformFee = Math.round(tutorFee * PLATFORM_COMMISSION_RATE);
  const total = tutorFee + platformFee;

  const booking = await Booking.create({
    student: req.user._id,
    tutor: tutorId,
    subject: subjectId,
    classType,
    isDemoClass: !!isDemoClass,
    scheduledDate,
    startTime,
    durationMinutes,
    pricing: { tutorFee, platformFee, total },
    status: 'pending',
  });

  // 🔔 Notify tutor: new booking request
  await notify(getIo(), tutorId, {
    type: 'booking_requested',
    title: 'New Booking Request',
    body: `${req.user.fullName || 'A student'} has requested a class on ${new Date(scheduledDate).toDateString()}.`,
    link: '/tutor/bookings',
  });

  res.status(201).json({ success: true, booking });
});

// @desc    List bookings for the logged-in user (student or tutor)
// @route   GET /api/bookings/me?status=upcoming|completed|cancelled
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const roleField = req.user.role === 'tutor' ? 'tutor' : 'student';

  const filter = { [roleField]: req.user._id };
  if (status === 'upcoming') filter.status = { $in: ['pending', 'confirmed'] };
  if (status === 'completed') filter.status = 'completed';
  if (status === 'cancelled') filter.status = { $in: ['cancelled', 'rejected'] };

  const bookings = await Booking.find(filter)
    .populate('student', 'fullName avatar')
    .populate('tutor', 'fullName avatar')
    .populate('subject', 'name')
    .sort({ scheduledDate: -1 });

  res.json({ success: true, bookings });
});

// @desc    Tutor accepts or rejects a pending booking request
// @route   PATCH /api/bookings/:id/respond
// @access  Private (tutor)
const respondToBooking = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'accept' | 'reject'

  const booking = await Booking.findOne({ _id: req.params.id, tutor: req.user._id })
    .populate('student', 'fullName')
    .populate('subject', 'name');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending bookings can be responded to');
  }

  booking.status = action === 'accept' ? 'confirmed' : 'rejected';
  await booking.save();

  const subjectName = booking.subject?.name || 'your class';
  const tutorName = req.user.fullName || 'Your tutor';

  if (action === 'accept') {
    // 🔔 Notify student: booking confirmed
    await notify(getIo(), booking.student._id, {
      type: 'booking_confirmed',
      title: '🎉 Booking Confirmed!',
      body: `${tutorName} has accepted your booking for ${subjectName}.`,
      link: '/student/bookings',
    });
  } else {
    // 🔔 Notify student: booking rejected
    await notify(getIo(), booking.student._id, {
      type: 'booking_cancelled',
      title: 'Booking Not Accepted',
      body: `${tutorName} was unable to accept your booking for ${subjectName}.`,
      link: '/student/bookings',
    });
  }

  res.json({ success: true, booking });
});

// @desc    Cancel a booking (student or tutor)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id)
    .populate('student', 'fullName')
    .populate('tutor', 'fullName')
    .populate('subject', 'name');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isParticipant =
    booking.student._id.toString() === req.user._id.toString() ||
    booking.tutor._id.toString() === req.user._id.toString();
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  if (['completed', 'cancelled'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }

  booking.status = 'cancelled';
  booking.cancellationReason = reason || '';
  booking.cancelledBy = req.user.role;
  await booking.save();

  const subjectName = booking.subject?.name || 'a class';
  const cancellerName = req.user.fullName || 'The other party';
  const scheduledDate = new Date(booking.scheduledDate).toDateString();

  if (req.user.role === 'student') {
    // 🔔 Notify tutor: student cancelled
    await notify(getIo(), booking.tutor._id, {
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      body: `${cancellerName} has cancelled the ${subjectName} class scheduled on ${scheduledDate}.`,
      link: '/tutor/bookings',
    });
  } else {
    // 🔔 Notify student: tutor cancelled
    await notify(getIo(), booking.student._id, {
      type: 'booking_cancelled',
      title: 'Booking Cancelled by Tutor',
      body: `Your ${subjectName} class on ${scheduledDate} was cancelled by the tutor.`,
      link: '/student/bookings',
    });
  }

  res.json({ success: true, booking });
});

// @desc    Save AI notes & complete the class booking
// @route   POST /api/bookings/:id/notes
// @access  Private (tutor)
const saveBookingNotes = asyncHandler(async (req, res) => {
  const { coreConcepts, homework } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('student', 'fullName')
    .populate('subject', 'name');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.aiNotes = {
    coreConcepts: coreConcepts || [],
    homework: homework || [],
    syncedAt: new Date(),
  };
  booking.status = 'completed';
  await booking.save();

  // 🔔 Notify student: AI notes ready
  await notify(getIo(), booking.student._id, {
    type: 'system',
    title: '📝 Class Notes Ready',
    body: `Your tutor has shared AI notes for the ${booking.subject?.name || 'class'}. Check your bookings!`,
    link: '/student/bookings',
  });

  res.json({ success: true, booking });
});

// @desc    Mark a booking as completed (called when classroom session ends)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (tutor or student participant)
const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('student', 'fullName')
    .populate('tutor', 'fullName')
    .populate('subject', 'name');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isParticipant =
    booking.student._id.toString() === req.user._id.toString() ||
    booking.tutor._id.toString() === req.user._id.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (booking.status === 'completed') {
    return res.json({ success: true, booking });
  }

  booking.status = 'completed';
  await booking.save();

  const subjectName = booking.subject?.name || 'your class';

  // 🔔 Notify both parties that the class ended
  if (req.user.role === 'tutor') {
    await notify(getIo(), booking.student._id, {
      type: 'system',
      title: '✅ Class Completed',
      body: `Your ${subjectName} session has ended. Don't forget to leave a review!`,
      link: '/student/bookings',
    });
  } else {
    await notify(getIo(), booking.tutor._id, {
      type: 'system',
      title: '✅ Class Completed',
      body: `The ${subjectName} session with ${booking.student?.fullName || 'student'} has ended.`,
      link: '/tutor/bookings',
    });
  }

  res.json({ success: true, booking });
});

module.exports = {
  createBooking,
  getMyBookings,
  respondToBooking,
  cancelBooking,
  saveBookingNotes,
  completeBooking,
};
