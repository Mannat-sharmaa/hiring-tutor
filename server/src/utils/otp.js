const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generates a 6-digit numeric OTP and its expiry (10 minutes from now).
const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, expires };
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
   from: `"EduConnect" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your EduConnect verification code',
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};

module.exports = { generateOtp, sendOtpEmail };
