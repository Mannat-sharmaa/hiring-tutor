const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'booking_requested', 'booking_confirmed', 'booking_cancelled',
        'payment_received', 'class_reminder', 'new_review',
        'tutor_verified', 'tutor_rejected', 'message', 'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    link: { type: String, default: '' }, // frontend route to deep-link to
    isRead: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
