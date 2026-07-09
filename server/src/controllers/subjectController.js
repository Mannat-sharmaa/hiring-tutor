const asyncHandler = require('express-async-handler');
const Subject = require('../models/Subject');

// @desc    Get the full subject tree (or one branch via ?parent=<id>)
// @route   GET /api/subjects?parent=<id|null>
// @access  Public
const getSubjects = asyncHandler(async (req, res) => {
  const { parent } = req.query;
  const filter = { isActive: true };
  filter.parent = parent === undefined ? null : parent === 'null' ? null : parent;

  const subjects = await Subject.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, subjects });
});

// @desc    Create a subject node (any depth)
// @route   POST /api/subjects
// @access  Private (admin)
const createSubject = asyncHandler(async (req, res) => {
  const { name, slug, icon, depth, parent, order } = req.body;

  let path = [];
  if (parent) {
    const parentDoc = await Subject.findById(parent);
    if (!parentDoc) {
      res.status(404);
      throw new Error('Parent subject not found');
    }
    path = [...parentDoc.path, parentDoc._id];
  }

  const subject = await Subject.create({ name, slug, icon, depth, parent: parent || null, path, order });
  res.status(201).json({ success: true, subject });
});

// @desc    Update or reorder a subject node
// @route   PUT /api/subjects/:id
// @access  Private (admin)
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.json({ success: true, subject });
});

// @desc    Delete a subject node (and its descendants)
// @route   DELETE /api/subjects/:id
// @access  Private (admin)
const deleteSubject = asyncHandler(async (req, res) => {
  await Subject.deleteMany({ $or: [{ _id: req.params.id }, { path: req.params.id }] });
  res.json({ success: true, message: 'Subject and its descendants were removed' });
});

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
