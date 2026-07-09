const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000, default: '' },
    tutorReply: { type: String, maxlength: 500, default: '' },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Recalculate the tutor's aggregate rating whenever a review is saved.
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const Tutor = mongoose.model('tutor');
  const stats = await Review.aggregate([
    { $match: { tutor: this.tutor } },
    { $group: { _id: '$tutor', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Tutor.findByIdAndUpdate(this.tutor, {
      ratingAverage: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
