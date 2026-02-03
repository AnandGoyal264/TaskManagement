const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Throw a clear, actionable error instead of the low-level "secretOrPrivateKey" message
    throw new Error('JWT_SECRET is not set. Please set JWT_SECRET in your backend .env (see .env.example).');
  }
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

module.exports = { signToken };
