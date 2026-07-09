const jwt = require('jsonwebtoken');

// Signs a JWT and sets it as an httpOnly cookie (protects against XSS token theft).
// Also returns the raw token in case a mobile client needs it in the response body.
const generateTokenAndSetCookie = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
