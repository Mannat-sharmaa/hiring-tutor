const express = require('express');
const router = express.Router();
const { getResources, uploadResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getResources)
  .post(protect, uploadResource);

module.exports = router;
