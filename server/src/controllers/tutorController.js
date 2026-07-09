const asyncHandler = require('express-async-handler');
const Tutor = require('../models/Tutor');

// @desc    Search & filter tutors (the core discovery endpoint)
// @route   GET /api/tutors/search
// @access  Public
// Supports every filter axis from the design doc: subject, student level,
// board, tutor type, teaching mode, budget range, rating, languages,
// availability, verification, and free-text search — all combinable, with
// pagination and sorting for the infinite-scroll results grid.
const searchTutors = asyncHandler(async (req, res) => {
  const {
    q,                    // free-text search
    subject,              // Subject ObjectId
    studentLevel,         // comma-separated
    board,                // comma-separated
    tutorType,
    teachingMode,
    minPrice,
    maxPrice,
    minRating,
    language,             // comma-separated
    idVerified,
    degreeVerified,
    day,                  // 'mon', 'tue', ...
    sortBy = 'best_match', // best_match | price_low | price_high | rating | most_booked
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { 
    role: 'tutor', 
    'verification.overallStatus': { $in: ['verified', 'pending'] } 
  };

  if (q) {
    const regex = new RegExp(q, 'i');
    filter.$or = [
      { fullName: regex },
      { headline: regex },
      { bio: regex }
    ];
  }
  if (subject) {
    filter['subjects.subject'] = subject;
  }
  if (studentLevel) {
    filter.studentLevels = { $in: studentLevel.split(',') };
  }
  if (board) {
    filter.boards = { $in: board.split(',') };
  }
  if (tutorType) {
    filter.tutorType = tutorType;
  }
  if (teachingMode) {
    filter.teachingMode = teachingMode;
  }
  if (minPrice || maxPrice) {
    filter.hourlyRate = {};
    if (minPrice) filter.hourlyRate.$gte = Number(minPrice);
    if (maxPrice) filter.hourlyRate.$lte = Number(maxPrice);
  }
  if (minRating) {
    filter.ratingAverage = { $gte: Number(minRating) };
  }
  if (language) {
    filter.languages = { $in: language.split(',') };
  }
  if (idVerified === 'true') {
    filter['verification.idVerified'] = true;
  }
  if (degreeVerified === 'true') {
    filter['verification.degreeVerified'] = true;
  }
  if (day) {
    filter['availability.day'] = day;
  }

  const sortMap = {
    best_match: { isFeatured: -1, ratingAverage: -1 },
    price_low: { hourlyRate: 1 },
    price_high: { hourlyRate: -1 },
    rating: { ratingAverage: -1 },
    most_booked: { classesCompleted: -1 },
  };
  const sort = sortMap[sortBy] || sortMap.best_match;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [tutors, total] = await Promise.all([
    Tutor.find(filter)
      .select('fullName avatar headline hourlyRate ratingAverage ratingCount subjects teachingMode experienceYears verification.overallStatus isFeatured')
      .populate('subjects.subject', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Tutor.countDocuments(filter),
  ]);

  res.json({
    success: true,
    results: tutors,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + tutors.length < total,
    },
  });
});

// @desc    Get one tutor's full public profile
// @route   GET /api/tutors/:id
// @access  Public
const getTutorProfile = asyncHandler(async (req, res) => {
  const tutor = await Tutor.findOne({ _id: req.params.id, role: 'tutor' })
    .select('-password -otp -otpExpires -earnings')
    .populate('subjects.subject', 'name slug icon');

  if (!tutor) {
    res.status(404);
    throw new Error('Tutor not found');
  }

  res.json({ success: true, tutor });
});

// @desc    Update the logged-in tutor's own profile
// @route   PUT /api/tutors/me
// @access  Private (tutor)
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'fullName', 'bio', 'headline', 'introVideoUrl', 'subjects', 'studentLevels',
    'boards', 'tutorType', 'teachingMode', 'location', 'languages', 'hourlyRate',
    'demoClassPrice', 'verification', 'avatar', 'experienceYears'
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const tutor = await Tutor.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, tutor });
});

// @desc    Update the logged-in tutor's weekly availability
// @route   PUT /api/tutors/me/availability
// @access  Private (tutor)
const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body; // array of { day, slots: [{ start, end }] }

  const tutor = await Tutor.findByIdAndUpdate(
    req.user._id,
    { availability },
    { new: true, runValidators: true }
  );

  res.json({ success: true, availability: tutor.availability });
});

module.exports = { searchTutors, getTutorProfile, updateMyProfile, updateAvailability };
