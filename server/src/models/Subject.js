const mongoose = require('mongoose');

// Self-referencing tree so the entire hierarchy (Education Level -> Category ->
// Subject -> Topic -> Subtopic) lives in a single collection. `depth` makes it
// cheap to query a single tier without walking parent chains, and `path`
// (array of ancestor ids) makes "give me everything under Mathematics" a
// single indexed query instead of a recursive one.
const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: '' },
    depth: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4], // 0=Level, 1=Category, 2=Subject, 3=Topic, 4=Subtopic
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    path: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // full ancestor chain
    order: { type: Number, default: 0 }, // for drag-and-drop ordering in admin
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectSchema.index({ parent: 1, order: 1 });
subjectSchema.index({ path: 1 });
subjectSchema.index({ depth: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
