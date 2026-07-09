require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studyRoomRoutes = require('./routes/studyRoomRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const registerChatSocket = require('./sockets/chatSocket');

connectDB();

const app = express();
const server = http.createServer(app);

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . operators from user input (NoSQL injection)
app.use(xss()); // sanitizes user input coming from POST/GET/query
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter; auth routes get a stricter one inline where mounted
const globalLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'production' ? 500 : 5000 
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'production' ? 30 : 1000 
});
app.use('/api/auth', authLimiter);

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

// --- Socket.io (live chat + notifications) ---
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
registerChatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`EduConnect API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Surface unhandled promise rejections instead of failing silently
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Export io so controllers can push real-time events
module.exports = { app, server, io };
