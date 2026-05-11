const pool = require('../db/pool');
const { logActivity } = require('../utils/activity');

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    image: row.image_url,
    stock: row.stock,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listProducts(req, res) {
  const search = String(req.query.q || '').trim().toLowerCase();
  const category = String(req.query.category || '').trim();
  const sort = String(req.query.sort || 'name_asc').trim();
  const includeInactive = req.user && req.user.role === 'admin' && req.query.includeInactive === 'true';
  const conditions = [];
  const params = [];

  if (!includeInactive) {
    conditions.push('is_active = 1');
  }

  if (search) {
    conditions.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)');
    params.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  let orderBy = 'name ASC';

  if (sort === 'price_asc') {
    orderBy = 'price ASC';
  } else if (sort === 'price_desc') {
    orderBy = 'price DESC';
  } else if (sort === 'newest') {
    orderBy = 'created_at DESC';
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const [rows] = await pool.query(
      'SELECT * FROM products ' + whereClause + ' ORDER BY ' + orderBy,
      params
    );

    res.json(rows.map(mapProduct));
  } catch (error) {
    console.error('Failed to load products', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
}

async function getProduct(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(mapProduct(rows[0]));
  } catch (error) {
    console.error('Failed to load product', error);
    res.status(500).json({ error: 'Failed to load product' });
  }
}

async function createProduct(req, res) {
  const name = String(req.body.name || '').trim();
  const category = String(req.body.category || '').trim();
  const price = Number(req.body.price);
  const description = String(req.body.description || '').trim();
  const imageUrl = String(req.body.image || '').trim();
  const stock = Number(req.body.stock);
  const isActive = req.body.isActive === false ? 0 : 1;

  if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
    return res.status(400).json({ error: 'Name, category, price, and stock are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, description, image_url, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, description, imageUrl, stock, isActive]
    );

    await logActivity(req.user.id, 'create_product', 'Created product #' + result.insertId);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [result.insertId]);

    res.status(201).json(mapProduct(rows[0]));
  } catch (error) {
    console.error('Failed to create product', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProduct(req, res) {
  const name = String(req.body.name || '').trim();
  const category = String(req.body.category || '').trim();
  const price = Number(req.body.price);
  const description = String(req.body.description || '').trim();
  const imageUrl = String(req.body.image || '').trim();
  const stock = Number(req.body.stock);
  const isActive = req.body.isActive ? 1 : 0;

  if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
    return res.status(400).json({ error: 'Name, category, price, and stock are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, image_url = ?, stock = ?, is_active = ? WHERE id = ?',
      [name, category, price, description, imageUrl, stock, isActive, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await logActivity(req.user.id, 'update_product', 'Updated product #' + req.params.id);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [req.params.id]);

    res.json(mapProduct(rows[0]));
  } catch (error) {
    console.error('Failed to update product', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function deleteProduct(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await logActivity(req.user.id, 'delete_product', 'Deleted product #' + req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
