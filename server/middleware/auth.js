const pool = require('../db/pool');
const { verifyToken } = require('../utils/jwt');

async function attachUserFromToken(req, required) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    if (required) {
      return { error: { status: 401, message: 'Authentication required' } };
    }
    return { user: null };
  }

  try {
    const payload = verifyToken(token);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );

    if (!rows.length || rows[0].status !== 'active') {
      return { error: { status: 401, message: 'User is not available' } };
    }

    return { user: rows[0] };
  } catch (error) {
    return { error: { status: 401, message: 'Invalid or expired token' } };
  }
}

async function requireAuth(req, res, next) {
  const result = await attachUserFromToken(req, true);

  if (result.error) {
    return res.status(result.error.status).json({ error: result.error.message });
  }

  req.user = result.user;
  next();
}

async function optionalAuth(req, res, next) {
  const result = await attachUserFromToken(req, false);

  req.user = result.user || null;
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
