const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bottleshop-ass2-secret';
const JWT_EXPIRES_IN = '7d';

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.created_at
  };
}

module.exports = {
  createToken,
  verifyToken,
  sanitizeUser
};
