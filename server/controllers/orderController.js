const pool = require('../db/pool');
const { logActivity } = require('../utils/activity');

function mapOrderRows(rows) {
  const orderMap = new Map();

  rows.forEach(function (row) {
    if (!orderMap.has(row.order_id)) {
      orderMap.set(row.order_id, {
        id: row.order_id,
        totalAmount: Number(row.total_amount),
        status: row.status,
        createdAt: row.created_at,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        items: []
      });
    }

    if (row.order_item_id) {
      orderMap.get(row.order_id).items.push({
        id: row.order_item_id,
        productId: row.product_id,
        name: row.product_name_snapshot,
        price: Number(row.price_snapshot),
        quantity: row.quantity
      });
    }
  });

  return Array.from(orderMap.values());
}

async function createOrder(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [cartRows] = await connection.query(
      'SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock ' +
      'FROM cart_items ci JOIN products p ON p.id = ci.product_id ' +
      'WHERE ci.user_id = ? ORDER BY ci.id ASC FOR UPDATE',
      [req.user.id]
    );

    if (!cartRows.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;

    for (const item of cartRows) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ error: item.name + ' does not have enough stock' });
      }

      totalAmount += Number(item.price) * item.quantity;
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.id, totalAmount, 'pending']
    );

    for (const item of cartRows) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_name_snapshot, price_snapshot, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.name, item.price, item.quantity]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await logActivity(req.user.id, 'checkout', 'Created order #' + orderResult.insertId, connection);

    await connection.commit();

    res.status(201).json({ success: true, orderId: orderResult.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create order', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
}

async function listMyOrders(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT o.id AS order_id, o.total_amount, o.status, o.created_at, ' +
      'u.name AS customer_name, u.email AS customer_email, ' +
      'oi.id AS order_item_id, oi.product_id, oi.product_name_snapshot, oi.price_snapshot, oi.quantity ' +
      'FROM orders o ' +
      'JOIN users u ON u.id = o.user_id ' +
      'LEFT JOIN order_items oi ON oi.order_id = o.id ' +
      'WHERE o.user_id = ? ' +
      'ORDER BY o.created_at DESC, oi.id ASC',
      [req.user.id]
    );

    res.json(mapOrderRows(rows));
  } catch (error) {
    console.error('Failed to load orders', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
}

async function listAllOrders(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT o.id AS order_id, o.total_amount, o.status, o.created_at, ' +
      'u.name AS customer_name, u.email AS customer_email, ' +
      'oi.id AS order_item_id, oi.product_id, oi.product_name_snapshot, oi.price_snapshot, oi.quantity ' +
      'FROM orders o ' +
      'JOIN users u ON u.id = o.user_id ' +
      'LEFT JOIN order_items oi ON oi.order_id = o.id ' +
      'ORDER BY o.created_at DESC, oi.id ASC'
    );

    res.json(mapOrderRows(rows));
  } catch (error) {
    console.error('Failed to load all orders', error);
    res.status(500).json({ error: 'Failed to load all orders' });
  }
}

async function updateOrderStatus(req, res) {
  const status = String(req.body.status || '').trim();
  const allowedStatuses = ['pending', 'paid', 'shipped', 'cancelled'];

  if (allowedStatuses.indexOf(status) === -1) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await logActivity(req.user.id, 'update_order_status', 'Updated order #' + req.params.id + ' to ' + status);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update order status', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

async function deleteOrder(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await logActivity(req.user.id, 'delete_order', 'Deleted order #' + req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}

module.exports = {
  createOrder,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
  deleteOrder
};
