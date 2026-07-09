const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    High-level platform analytics for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalTutors, pendingTutors, totalBookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Tutor.countDocuments({ role: 'tutor' }),
    Tutor.countDocuments({ role: 'tutor', 'verification.overallStatus': 'pending' }),
    Booking.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$platformCommission' } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalTutors,
      pendingTutors,
      totalBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

// @desc    List tutors awaiting verification
// @route   GET /api/admin/tutors/pending
// @access  Private (admin)
const getPendingTutors = asyncHandler(async (req, res) => {
  const tutors = await Tutor.find({ 'verification.overallStatus': 'pending' }).select(
    'fullName email verification createdAt'
  );
  res.json({ success: true, tutors });
});

// @desc    Approve or reject a tutor's verification
// @route   PATCH /api/admin/tutors/:id/verify
// @access  Private (admin)
const verifyTutor = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body; // 'approve' | 'reject'

  const tutor = await Tutor.findById(req.params.id);
  if (!tutor) {
    res.status(404);
    throw new Error('Tutor not found');
  }

  tutor.verification.overallStatus = decision === 'approve' ? 'verified' : 'rejected';
  tutor.verification.rejectionReason = decision === 'approve' ? '' : reason || '';
  await tutor.save();

  res.json({ success: true, tutor });
});

// @desc    Paginated, searchable list of all users
// @route   GET /api/admin/users?role=&status=&q=
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, q, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) filter.$or = [{ fullName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('fullName email role status createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) } });
});

// @desc    Ban, unban, or otherwise change a user's status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'active' | 'banned' | 'suspended'

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user: user.toSafeObject() });
});

module.exports = { getAnalytics, getPendingTutors, verifyTutor, getUsers, updateUserStatus };
