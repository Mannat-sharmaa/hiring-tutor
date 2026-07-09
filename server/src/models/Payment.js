const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    platformCommission: { type: Number, required: true },
    tutorPayout: { type: Number, required: true },

    method: { type: String, enum: ['card', 'paypal', 'wallet'], required: true },
    provider: { type: String, enum: ['stripe', 'razorpay', 'wallet'], required: true },
    providerPaymentId: { type: String, default: '' }, // e.g. Stripe PaymentIntent id

    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    refund: {
      amount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      processedAt: { type: Date },
    },
    invoiceUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
