const express = require('express');
const {
  searchTutors,
  getTutorProfile,
  updateMyProfile,
  updateAvailability,
} = require('../controllers/tutorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchTutors);
router.put('/me', protect, authorize('tutor'), updateMyProfile);
router.put('/me/availability', protect, authorize('tutor'), updateAvailability);
router.get('/:id', getTutorProfile);

module.exports = router;
