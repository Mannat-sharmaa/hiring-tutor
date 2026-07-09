const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generates a 6-digit numeric OTP and its expiry (10 minutes from now).
const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, expires };
};

const transporter = nodemailer.createTransport({
  pool: true, // Keep connection warm and open to ensure instant OTP email delivery (under 20 seconds)
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for 587 (TLS)
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendCustomEmail = async (toEmail, subject, htmlContent) => {
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'smannat401@gmail.com';
  const apiKey = process.env.SMTP_PASS;

  // Render blocks all SMTP ports (587, 465, etc.).
  // If a Brevo REST API key is provided (starts with 'xkeysib-'), we send via HTTPS Web API on port 443 (which is never blocked!).
  if (apiKey && apiKey.startsWith('xkeysib-')) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'EduConnect', email: fromEmail },
          to: [{ email: toEmail }],
          subject,
          htmlContent,
        }),
      });

      if (response.ok) {
        return; // Success!
      }
      const errData = await response.json();
      console.warn('Brevo HTTP API failed, falling back to SMTP:', errData);
    } catch (err) {
      console.warn('Brevo HTTP API fetch error, falling back to SMTP:', err.message);
    }
  }

  // Fallback to standard SMTP (works on localhost / local development)
  await transporter.sendMail({
    from: `"EduConnect" <${fromEmail}>`,
    to: toEmail,
    subject,
    html: htmlContent,
  });
};

const sendOtpEmail = async (toEmail, otp) => {
  await sendCustomEmail(
    toEmail,
    'Your EduConnect verification code',
    `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`
  );
};

module.exports = { generateOtp, sendOtpEmail, sendCustomEmail };
