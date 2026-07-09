const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = asyncHandler(async (req, res) => {
  const { subject, search, freeOnly } = req.query;
  const filter = {};

  if (subject && subject !== 'All') {
    filter.subject = subject;
  }

  if (freeOnly === 'true') {
    filter.price = 0;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const resources = await Resource.find(filter)
    .populate('tutor', 'fullName avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: resources.length, data: resources });
});

// @desc    Upload a study resource
// @route   POST /api/resources
// @access  Private (Tutor only)
const uploadResource = asyncHandler(async (req, res) => {
  // Ensure user is tutor or admin
  if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only tutors and admins are permitted to upload resources');
  }

  const { title, subject, type, price, pages, tags, preview, fileUrl } = req.body;

  if (!title || !subject || !preview) {
    res.status(400);
    throw new Error('Please provide title, subject, and preview/description');
  }

  const resource = await Resource.create({
    title,
    subject,
    type: type || 'PDF',
    price: price || 0,
    pages: pages || 1,
    tags: tags || [],
    preview,
    fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // default fallback dummy pdf
    tutor: req.user._id,
    tutorName: req.user.fullName,
  });

  res.status(201).json({ success: true, data: resource });
});

module.exports = {
  getResources,
  uploadResource,
};
