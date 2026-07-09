const express = require('express');
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSubjects);
router.post('/', protect, authorize('admin'), createSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

module.exports = router;
