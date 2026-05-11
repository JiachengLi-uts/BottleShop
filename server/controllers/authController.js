const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { logActivity } = require('../utils/activity');
const { createToken, sanitizeUser } = require('../utils/jwt');

async function register(req, res) {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);

    if (existing.length) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, 'customer', 'active']
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    await logActivity(result.insertId, 'register', 'Created a new account');

    const user = rows[0];

    res.status(201).json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Failed to register user', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await logActivity(user.id, 'login', 'User logged in');

    res.json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Failed to login user', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
}

function getCurrentUser(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = {
  register,
  login,
  getCurrentUser
};
