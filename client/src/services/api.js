import axios from 'axios';

// Single axios instance for the whole app. withCredentials sends the
// httpOnly auth cookie automatically; baseURL is proxied to the API in dev
// (see vite.config.js) and should point at the real API host in production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('educonnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchTutors = (params) => api.get('/tutors/search', { params }).then((r) => r.data);
export const getSubjects = (parent = null) =>
  api.get('/subjects', { params: { parent: parent ?? 'null' } }).then((r) => r.data);
export const getTutorProfile = (id) => api.get(`/tutors/${id}`).then((r) => r.data);
export const updateTutorAvailability = (availability) =>
  api.put('/tutors/me/availability', { availability }).then((r) => r.data);
export const updateTutorProfile = (payload) => api.put('/tutors/me', payload).then((r) => r.data);

// Bookings
export const createBooking = (payload) => api.post('/bookings', payload).then((r) => r.data);
export const getMyBookings = (status) =>
  api.get('/bookings/me', { params: { status } }).then((r) => r.data);
export const respondToBooking = (id, action) =>
  api.patch(`/bookings/${id}/respond`, { action }).then((r) => r.data);
export const cancelBooking = (id, reason) =>
  api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data);
export const syncBookingNotes = (id, payload) =>
  api.post(`/bookings/${id}/notes`, payload).then((r) => r.data);
export const completeBooking = (id) =>
  api.patch(`/bookings/${id}/complete`).then((r) => r.data);

// Reviews
export const submitReview = (payload) => api.post('/reviews', payload).then((r) => r.data);
export const getReviewByBooking = (bookingId) => api.get(`/reviews/booking/${bookingId}`).then((r) => r.data);
export const getTutorReviews = (tutorId) => api.get(`/reviews/tutor/${tutorId}`).then((r) => r.data);

// Admin
export const getAnalytics = () => api.get('/admin/analytics').then((r) => r.data);
export const getPendingTutors = () => api.get('/admin/tutors/pending').then((r) => r.data);
export const verifyTutor = (id, decision, reason) =>
  api.patch(`/admin/tutors/${id}/verify`, { decision, reason }).then((r) => r.data);
export const getUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);
export const updateUserStatus = (id, status) =>
  api.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data);

// Chats
export const getMyChats = () => api.get('/chats').then((r) => r.data);
export const createOrGetChat = (participantId) => api.post('/chats', { participantId }).then((r) => r.data);
export const getChatById = (id) => api.get(`/chats/${id}`).then((r) => r.data);
export const sendChatMessage = (id, text) => api.post(`/chats/${id}/messages`, { text }).then((r) => r.data);

export default api;
