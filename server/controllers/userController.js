const pool = require('../db/pool');
const { logActivity } = require('../utils/activity');
const { sanitizeUser } = require('../utils/jwt');

function mapUser(row) {
  return sanitizeUser(row);
}

async function getProfile(req, res) {
  res.json({ user: mapUser(req.user) });
}

async function updateProfile(req, res) {
  const name = String(req.body.name || '').trim();

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    await logActivity(req.user.id, 'update_profile', 'Updated profile name');

    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    res.json({ user: mapUser(rows[0]) });
  } catch (error) {
    console.error('Failed to update profile', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

async function listUsers(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(rows.map(mapUser));
  } catch (error) {
    console.error('Failed to load users', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
}

async function getUserActivity(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, action, details, created_at FROM user_activity WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json(rows.map(function (row) {
      return {
        id: row.id,
        action: row.action,
        details: row.details,
        createdAt: row.created_at
      };
    }));
  } catch (error) {
    console.error('Failed to load user activity', error);
    res.status(500).json({ error: 'Failed to load user activity' });
  }
}

async function updateUser(req, res) {
  const role = String(req.body.role || '').trim();
  const status = String(req.body.status || '').trim();
  const allowedRoles = ['customer', 'admin'];
  const allowedStatuses = ['active', 'disabled'];

  if (allowedRoles.indexOf(role) === -1 || allowedStatuses.indexOf(status) === -1) {
    return res.status(400).json({ error: 'Invalid user role or status' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET role = ?, status = ? WHERE id = ?',
      [role, status, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logActivity(req.user.id, 'update_user', 'Updated user #' + req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update user', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

async function deleteUser(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logActivity(req.user.id, 'delete_user', 'Deleted user #' + req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  listUsers,
  getUserActivity,
  updateUser,
  deleteUser
};
