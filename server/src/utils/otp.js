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
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for 587 (TLS)
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendOtpEmail = async (toEmail, otp) => {
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'smannat401@gmail.com';
  await transporter.sendMail({
    from: `"EduConnect" <${fromEmail}>`,
    to: toEmail,
    subject: 'Your EduConnect verification code',
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};

module.exports = { generateOtp, sendOtpEmail };
