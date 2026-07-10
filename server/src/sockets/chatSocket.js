const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

// Registers all Socket.io event handlers for real-time chat and notifications.
// Each connected socket authenticates itself with the same JWT used by the
// REST API, then joins a room named after its own user id so the server can
// push events (new message, notification) directly to that user from
// anywhere else in the app (e.g. after a booking is confirmed).
const registerChatSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId);

    // Join a specific conversation room to receive its live messages
    socket.on('chat:join', (chatId) => socket.join(`chat:${chatId}`));

    // Join a classroom room to sync whiteboard and classroom state
    socket.on('classroom:join', (bookingId) => {
      socket.join(`classroom:${bookingId}`);
      socket.to(`classroom:${bookingId}`).emit('classroom:joined', { userId: socket.userId });
    });

    // Broadcast whiteboard drawings
    socket.on('whiteboard:draw', (data) => {
      const { bookingId, prevX, prevY, x, y, color, width, tool } = data;
      socket.to(`classroom:${bookingId}`).emit('whiteboard:draw', { prevX, prevY, x, y, color, width, tool });
    });

    // Broadcast whiteboard clear
    socket.on('whiteboard:clear', ({ bookingId }) => {
      socket.to(`classroom:${bookingId}`).emit('whiteboard:clear');
    });

    // Broadcast whiteboard image presentation
    socket.on('whiteboard:image', ({ bookingId, imageSrc }) => {
      socket.to(`classroom:${bookingId}`).emit('whiteboard:image', { imageSrc });
    });

    // Forward WebRTC signaling messages
    socket.on('webrtc:signal', ({ bookingId, signal }) => {
      socket.to(`classroom:${bookingId}`).emit('webrtc:signal', { signal });
    });

    // Forward classroom ready signal from student to tutor
    socket.on('classroom:ready', ({ bookingId }) => {
      socket.to(`classroom:${bookingId}`).emit('classroom:ready');
    });

    // Forward class termination request from tutor to student
    socket.on('classroom:end-request', ({ bookingId }) => {
      socket.to(`classroom:${bookingId}`).emit('classroom:end-request');
    });

    // Forward student termination agreement to tutor
    socket.on('classroom:student-ended', ({ bookingId }) => {
      socket.to(`classroom:${bookingId}`).emit('classroom:student-ended');
    });

    socket.on('chat:typing', ({ chatId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', { userId: socket.userId, isTyping });
    });

    socket.on('chat:send-message', async ({ chatId, text, attachmentUrl }) => {
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.map(String).includes(socket.userId)) return;

      const message = { sender: socket.userId, text, attachmentUrl: attachmentUrl || '' };
      chat.messages.push(message);
      chat.lastMessageAt = new Date();
      await chat.save();

      const saved = chat.messages[chat.messages.length - 1];
      io.to(`chat:${chatId}`).emit('chat:receive-message', saved);

      // Notify the other participant even if they aren't in the chat room right now
      const recipient = chat.participants.find((p) => String(p) !== socket.userId);
      if (recipient) {
        const notification = await Notification.create({
          user: recipient,
          type: 'message',
          title: 'New message',
          body: text?.slice(0, 100) || 'Sent an attachment',
          link: `/chat/${chatId}`,
        });
        io.to(String(recipient)).emit('notification:new', notification);
      }
    });

    socket.on('disconnect', () => {
      socket.leave(socket.userId);
    });
  });
};

module.exports = registerChatSocket;
