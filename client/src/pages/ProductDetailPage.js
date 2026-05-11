import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function ProductDetailPage({ user, onCartChange }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);

    try {
      const data = await apiRequest('/api/products/' + id);
      setProduct(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
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
          quantity: quantity
        })
      });
      await onCartChange();
      toast.success('Added item to cart');
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <div className="text-center py-5">Loading product...</div>;
  }

  if (!product) {
    return <div className="empty-state">Product not found.</div>;
  }

  return (
    <div className="page-card p-4">
      <div className="row g-4">
        <div className="col-md-5">
          <div className="product-detail-image-wrap">
            <img className="img-fluid rounded" src={product.image} alt={product.name} />
          </div>
        </div>
        <div className="col-md-7">
          <Link to="/products" className="btn btn-link px-0">
            Back to Products
          </Link>
          <h2>{product.name}</h2>
          <p className="text-muted mb-2">{product.category}</p>
          <p>{product.description}</p>
          <p className="fw-bold fs-4">${Number(product.price).toFixed(2)}</p>
          <p className="mb-3">Stock available: {product.stock}</p>
          <div className="d-flex gap-3 align-items-end flex-wrap">
            <div>
              <label className="form-label">Quantity</label>
              <input
                className="form-control"
                type="number"
                min="1"
                value={quantity}
                onChange={function (event) {
                  setQuantity(Math.max(1, Number(event.target.value) || 1));
                }}
              />
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
              {user ? 'Add to Cart' : 'Login to Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
