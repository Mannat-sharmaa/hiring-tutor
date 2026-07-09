const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc  Get all notifications for logged-in user
// @route GET /api/notifications
// @access Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.json({ success: true, notifications, unreadCount });
});

// @desc  Mark one notification as read
// @route PATCH /api/notifications/:id/read
// @access Private
const markOneRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
});

// @desc  Mark all notifications as read
// @route PATCH /api/notifications/read-all
// @access Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

module.exports = { getNotifications, markOneRead, markAllRead };
