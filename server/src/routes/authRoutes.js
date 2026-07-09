const express = require('express');
const { body } = require('express-validator');
const { register, verifyOtp, login, logout, getMe, getSocketToken, googleLogin, getConfig, forgotPassword, resetPassword, updateUserProfile, changePassword, resendOtp, checkEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();
const { sendOtpEmail } = require('../utils/otp');

router.get('/test-email', async (req, res) => {
  try {
    const testEmail = req.query.email || 'smannat401@gmail.com';
    await sendOtpEmail(testEmail, '999999');
    res.json({ success: true, message: `Test email sent successfully to ${testEmail}` });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'SMTP Email failed to send',
      error: err.message,
      stack: err.stack,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM_EMAIL
      }
    });
  }
});

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['student', 'tutor']).withMessage("Role must be 'student' or 'tutor'"),
  ],
  validate,
  register
);

router.post(
  '/verify-otp',
  [body('userId').notEmpty(), body('otp').isLength({ min: 6, max: 6 })],
  validate,
  verifyOtp
);

router.post(
  '/resend-otp',
  [body('userId').notEmpty()],
  validate,
  resendOtp
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/socket-token', protect, getSocketToken);
router.post('/google-login', googleLogin);
router.get('/config', getConfig);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.post('/check-email', checkEmail);

module.exports = router;
