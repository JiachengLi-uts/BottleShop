const pool = require('../db/pool');

async function logActivity(userId, action, details, connection) {
  const executor = connection || pool;

  try {
    await executor.query(
      'INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details || null]
    );
  } catch (error) {
    console.error('Failed to log activity', error);
  }
}

module.exports = {
  logActivity
};
