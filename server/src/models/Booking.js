const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

    classType: { type: String, enum: ['one_to_one', 'group'], default: 'one_to_one' },
    isDemoClass: { type: Boolean, default: false },

    scheduledDate: { type: String, required: true }, // "2026-07-10"
    startTime: { type: String, required: true }, // "17:00"
    durationMinutes: { type: Number, required: true, enum: [30, 60, 90, 120] },

    pricing: {
      tutorFee: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      total: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: String, enum: ['student', 'tutor', 'admin', null], default: null },

    meetingLink: { type: String, default: '' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },

    aiNotes: {
      coreConcepts: [{ type: String }],
      homework: [{ type: String }],
      syncedAt: { type: Date }
    },
  },
  { timestamps: true }
);

bookingSchema.index({ student: 1, status: 1 });
bookingSchema.index({ tutor: 1, status: 1 });
bookingSchema.index({ tutor: 1, scheduledDate: 1, startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
