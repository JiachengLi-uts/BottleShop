import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import { apiRequest } from '../services/api';

function ProductsPage({ user, onCartChange }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    sort: 'name_asc'
  });
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadProducts();
  }, [filters]);

  async function loadProducts() {
    setLoading(true);

    try {
      const query = new URLSearchParams();

      if (filters.q) {
        query.set('q', filters.q);
      }

      if (filters.category) {
        query.set('category', filters.category);
      }

      if (filters.sort) {
        query.set('sort', filters.sort);
      }

      const data = await apiRequest('/api/products?' + query.toString());
      setProducts(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(event) {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  }

  async function handleAddToCart(product) {
    if (!user) {
      toast.info('Please login before adding items to your cart');
      navigate('/login');
      return;
    }

    try {
      await apiRequest('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      });
      await onCartChange();
      toast.success('Added ' + product.name + ' to cart');
    } catch (error) {
      toast.error(error.message);
    }
  }

  const categories = Array.from(new Set(products.map(function (product) {
    return product.category;
  }))).sort();

  return (
    <div>
      <div className="page-header">
        <h1 className="mb-2">Bottle Shop Catalog</h1>
        <p className="text-muted mb-0">
          Browse products, search in real time, and login to build your order.
        </p>
      </div>

      <div className="page-card p-3 mb-4">
        <div className="toolbar">
          <div>
            <label className="form-label">Search</label>
            <input
              className="form-control"
              name="q"
              value={filters.q}
              onChange={updateFilter}
              placeholder="Search by name or category"
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-select" name="category" value={filters.category} onChange={updateFilter}>
              <option value="">All Categories</option>
              {categories.map(function (category) {
                return (
                  <option key={category} value={category}>
                    {category}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="form-label">Sort</label>
            <select className="form-select" name="sort" value={filters.sort} onChange={updateFilter}>
              <option value="name_asc">Name A-Z</option>
              <option value="price_asc">Price Low to High</option>
              <option value="price_desc">Price High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products match your current search.</div>
      ) : (
        <div className="row g-4">
          {products.map(function (product) {
            return (
              <div className="col-md-6 col-xl-4" key={product.id}>
                <ProductCard
                  product={product}
                  isLoggedIn={!!user}
                  onAddToCart={function () { handleAddToCart(product); }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
