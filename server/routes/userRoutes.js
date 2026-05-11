const express = require('express');
const {
  getProfile,
  updateProfile,
  listUsers,
  getUserActivity,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.use(requireAuth);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/', requireAdmin, listUsers);
router.get('/:id/activity', requireAdmin, getUserActivity);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
