/**
 * notify(io, userId, payload)
 * Creates a Notification document and pushes it to the user's socket room.
 * 
 * @param {Server}  io     - Socket.io server instance
 * @param {string}  userId - Recipient user ObjectId
 * @param {object}  payload - { type, title, body, link, meta }
 */
const Notification = require('../models/Notification');

const notify = async (io, userId, { type, title, body = '', link = '', meta = {} }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      body,
      link,
      meta,
    });
    if (io) {
      io.to(String(userId)).emit('notification:new', notification);
    }
    return notification;
  } catch (err) {
    console.error('notify() error:', err.message);
  }
};

module.exports = notify;
