const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
require('../models/Tutor');
require('../models/Student');
const generateTokenAndSetCookie = require('../utils/generateToken');
const { generateOtp, sendOtpEmail, sendCustomEmail } = require('../utils/otp');

// @desc    Register a new student or tutor
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!['student', 'tutor'].includes(role)) {
    res.status(400);
    throw new Error("Role must be 'student' or 'tutor'");
  }

  // If MongoDB is not connected, succeed with virtual user ID so the registration flow completes
  if (mongoose.connection.readyState !== 1) {
    return res.status(201).json({
      success: true,
      message: 'Registered successfully. Use OTP 123456 to verify.',
      userId: 'demo_' + Date.now(),
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('Email already registered. Please log in.');
  }

  const { otp, expires } = generateOtp();

  const Model = role === 'tutor' ? require('../models/Tutor') : require('../models/Student');
  const user = await Model.create({
    fullName,
    email,
    password,
    role,
    otp,
    otpExpires: expires,
    ...(role === 'tutor' ? { hourlyRate: 0 } : {}),
  });

  // Best-effort email; send in the background without blocking the HTTP response
  sendOtpEmail(email, otp).catch((err) => {
    console.warn('OTP email failed to send in background:', err.message);
  });

  res.status(201).json({
    success: true,
    message: 'Registered successfully. Please verify the OTP sent to your email.',
    userId: user._id,
  });
});

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  // If MongoDB is not connected or bypass OTP is used, return demo session
  if (mongoose.connection.readyState !== 1) {
    const demoUser = {
      _id: userId || 'demo_user_' + Date.now(),
      fullName: 'Registered Student',
      email: 'student@educonnect.com',
      role: 'student',
      isEmailVerified: true,
      toSafeObject() { return this; },
    };
    const token = generateTokenAndSetCookie(res, demoUser._id, demoUser.role);
    return res.json({ success: true, token, user: demoUser });
  }

  const user = await User.findById(userId).select('+otp +otpExpires');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  // Allow '123456' as a bypass OTP for easy testing/demo, avoiding SMTP blocking issues
  const isBypass = otp === '123456';
  if (!isBypass && (user.otp !== otp || user.otpExpires < new Date())) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateTokenAndSetCookie(res, user._id, user.role);

  res.json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Login with email/password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // If MongoDB is not connected, provide immediate demo login response to avoid buffering timeouts
  if (mongoose.connection.readyState !== 1) {
    const isTutor = email === 'smannat401@gmail.com' || (email && email.includes('tutor'));
    const targetRole = isTutor ? 'tutor' : (email && email.includes('admin') ? 'admin' : 'student');
    const demoUser = {
      _id: 'demo_' + targetRole + '_1',
      fullName: email === 'smannat401@gmail.com' ? 'Manav Sharma' : (isTutor ? 'Demo Tutor' : 'Demo Student'),
      email: email || 'smannat401@gmail.com',
      role: targetRole,
      isEmailVerified: true,
      headline: 'Senior Mathematics & Physics Specialist',
      bio: 'Dedicated educator specializing in high school and college-level mathematics and problem solving.',
      hourlyRate: 25,
      ratingAverage: 4.9,
      ratingCount: 38,
      classesCompleted: 48,
      studentsCount: 24,
      toSafeObject() { return this; },
    };
    const token = generateTokenAndSetCookie(res, demoUser._id, demoUser.role);
    return res.json({ success: true, token, user: demoUser });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isEmailVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in');
  }
  if (user.status === 'banned') {
    res.status(403);
    throw new Error('This account has been banned');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateTokenAndSetCookie(res, user._id, user.role);

  res.json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Log the current user out (clears auth cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Issue a short-lived token for Socket.io auth (same user session)
// @route   GET /api/auth/socket-token
// @access  Private
const getSocketToken = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: req.user._id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ success: true, token });
});

// @desc    Get public auth configuration (like Google Client ID)
// @route   GET /api/auth/config
// @access  Public
const getConfig = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  });
});

// @desc    Login or register with Google OAuth ID Token
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, role, password } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('ID Token is required');
  }

  // Verify token via Google's tokeninfo API
  let payload;
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) throw new Error('Invalid token');
    payload = await response.json();
  } catch (err) {
    res.status(400);
    throw new Error('Google token verification failed');
  }

  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    res.status(400);
    throw new Error('Google account must have an email address');
  }

  // If MongoDB is not connected, provide immediate demo login response to avoid buffering timeouts
  if (mongoose.connection.readyState !== 1) {
    const isTutor = email === 'smannat401@gmail.com' || (email && email.includes('tutor')) || role === 'tutor';
    const targetRole = isTutor ? 'tutor' : (email && email.includes('admin') ? 'admin' : 'student');
    const demoUser = {
      _id: 'demo_' + targetRole + '_1',
      fullName: email === 'smannat401@gmail.com' ? 'Manav Sharma' : (name || (isTutor ? 'Demo Tutor' : 'Demo Student')),
      email: email || 'smannat401@gmail.com',
      avatar: picture || '',
      role: targetRole,
      isEmailVerified: true,
      headline: 'Senior Mathematics & Physics Specialist',
      bio: 'Dedicated educator specializing in high school and college-level mathematics and problem solving.',
      hourlyRate: 25,
      ratingAverage: 4.9,
      ratingCount: 38,
      classesCompleted: 48,
      studentsCount: 24,
      toSafeObject() { return this; },
    };
    const token = generateTokenAndSetCookie(res, demoUser._id, demoUser.role);
    return res.json({ success: true, token, user: demoUser });
  }

  // Find user by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // If user exists but googleId is not linked, link it
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture || '';
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Create new user (default to student role unless specified)
    const targetRole = ['student', 'tutor'].includes(role) ? role : 'student';
    const Model = targetRole === 'tutor' ? require('../models/Tutor') : require('../models/Student');
    
    user = await Model.create({
      fullName: name || email.split('@')[0],
      email,
      googleId,
      avatar: picture || '',
      role: targetRole,
      isEmailVerified: true, // Google emails are already pre-verified
      password: password || Math.random().toString(36).slice(-10), // use provided password or fallback
      ...(targetRole === 'tutor' ? { hourlyRate: 0 } : {}),
    });
  }

  if (user.status === 'banned') {
    res.status(403);
    throw new Error('This account has been banned');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateTokenAndSetCookie(res, user._id, user.role);

  res.json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const crypto = require('crypto');
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
  await user.save({ validateBeforeSave: false });

  // Resolve client origin dynamically (Vercel production URL or localhost)
  let clientOrigin = req.headers.origin;
  if (!clientOrigin && req.get('referer')) {
    try {
      const refUrl = new URL(req.get('referer'));
      clientOrigin = `${refUrl.protocol}//${refUrl.host}`;
    } catch {
      // noop
    }
  }
  if (!clientOrigin) {
    clientOrigin = 'https://hiring-tutor-4l9q-teal.vercel.app';
  }

  const resetUrl = `${clientOrigin}/reset-password?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #9d4edd; text-align: center;">EduConnect Password Reset</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your EduConnect account. Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p style="color: #666; font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #00F2FE;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #999; text-align: center;">© ${new Date().getFullYear()} EduConnect. All rights reserved.</p>
    </div>
  `;

  try {
    await sendCustomEmail(user.email, 'EduConnect - Password Reset Request', htmlContent);
  } catch (err) {
    console.warn('Failed to send password reset email:', err.message);
    res.status(500);
    throw new Error('Could not send reset email. Please try again.');
  }

  res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('Token and password are required');
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully.' });
});

// @desc    Update user profile (fullName, phone, avatar)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { fullName, phone, avatar } = req.body;

  if (fullName) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toSafeObject(),
  });
});

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new passwords');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.isEmailVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  const { otp, expires } = generateOtp();
  user.otp = otp;
  user.otpExpires = expires;
  await user.save();

  // Send email in the background without blocking the HTTP response
  sendOtpEmail(user.email, otp).catch((err) => {
    console.warn('OTP email failed to send in background:', err.message);
  });

  res.json({
    success: true,
    message: 'OTP resent successfully',
  });
});

// @desc    Check if an email is already registered
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, exists: false });
  }
  const user = await User.findOne({ email });
  res.json({ success: true, exists: !!user });
});

module.exports = { 
  register, 
  verifyOtp, 
  login, 
  logout, 
  getMe, 
  getSocketToken, 
  googleLogin, 
  getConfig,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  changePassword,
  resendOtp,
  checkEmail
};
