const express = require('express');
const {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', getCart);
router.post('/items', addCartItem);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', deleteCartItem);
router.delete('/', clearCart);

module.exports = router;
