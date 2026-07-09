const express = require('express');
const {
  getAnalytics,
  getPendingTutors,
  verifyTutor,
  getUsers,
  updateUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin')); // every route below requires an authenticated admin

router.get('/analytics', getAnalytics);
router.get('/tutors/pending', getPendingTutors);
router.patch('/tutors/:id/verify', verifyTutor);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
