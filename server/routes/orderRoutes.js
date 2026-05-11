const express = require('express');
const {
  createOrder,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.use(requireAuth);
router.post('/', createOrder);
router.get('/me', listMyOrders);
router.get('/', requireAdmin, listAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.delete('/:id', requireAdmin, deleteOrder);

module.exports = router;
