const pool = require('../db/pool');
const { logActivity } = require('../utils/activity');

function mapCartRow(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    image: row.image_url,
    stock: row.stock,
    quantity: row.quantity
  };
}

async function getCart(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT ci.id, ci.product_id, ci.quantity, p.name, p.category, p.price, p.description, p.image_url, p.stock ' +
      'FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ? ORDER BY ci.id DESC',
      [req.user.id]
    );

    res.json(rows.map(mapCartRow));
  } catch (error) {
    console.error('Failed to load cart', error);
    res.status(500).json({ error: 'Failed to load cart' });
  }
}

async function addCartItem(req, res) {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity || 1);

  if (Number.isNaN(productId) || Number.isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Valid productId and quantity are required' });
  }

  try {
    const [products] = await pool.query(
      'SELECT id, stock, is_active FROM products WHERE id = ? LIMIT 1',
      [productId]
    );

    if (!products.length || !products[0].is_active) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1',
      [req.user.id, productId]
    );

    if (existing.length) {
      const newQuantity = existing[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    await logActivity(req.user.id, 'add_to_cart', 'Added product #' + productId + ' to cart');

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Failed to add item to cart', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

async function updateCartItem(req, res) {
  const cartItemId = Number(req.params.id);
  const quantity = Number(req.body.quantity);

  if (Number.isNaN(cartItemId) || Number.isNaN(quantity)) {
    return res.status(400).json({ error: 'Valid cart item id and quantity are required' });
  }

  try {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, req.user.id]);
      await logActivity(req.user.id, 'remove_cart_item', 'Removed cart item #' + cartItemId);
      return res.json({ success: true });
    }

    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartItemId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await logActivity(req.user.id, 'update_cart', 'Updated cart item #' + cartItemId);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update cart item', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
}

async function deleteCartItem(req, res) {
  try {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await logActivity(req.user.id, 'remove_cart_item', 'Removed cart item #' + req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cart item', error);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
}

async function clearCart(req, res) {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await logActivity(req.user.id, 'clear_cart', 'Cleared cart');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear cart', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart
};
