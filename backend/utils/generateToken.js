const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents XSS attacks
    secure: isProduction, // Required for HTTPS & SameSite=None
    sameSite: isProduction ? 'none' : 'lax', // 'none' allows cookies across deployed frontend & backend domains
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

module.exports = generateTokenAndSetCookie;