const mongoose = require('mongoose');

// One Chat doc per (student, tutor) pair; messages are embedded since
// per-conversation volume is small and we always fetch the whole thread.
const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
