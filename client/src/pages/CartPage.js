import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function CartPage({ onCartChange }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);

    try {
      const data = await apiRequest('/api/cart');
      setItems(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(itemId, quantity) {
    try {
      await apiRequest('/api/cart/items/' + itemId, {
        method: 'PUT',
        body: JSON.stringify({ quantity: quantity })
      });
      await loadCart();
      await onCartChange();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function removeItem(itemId) {
    try {
      await apiRequest('/api/cart/items/' + itemId, {
        method: 'DELETE'
      });
      await loadCart();
      await onCartChange();
      toast.success('Item removed');
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function clearCart() {
    try {
      await apiRequest('/api/cart', {
        method: 'DELETE'
      });
      setItems([]);
      await onCartChange();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(error.message);
    }
  }

  const total = items.reduce(function (sum, item) {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  if (loading) {
    return <div className="text-center py-5">Loading cart...</div>;
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p className="mb-3">Add some products before checking out.</p>
        <Link className="btn btn-primary" to="/products">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="mb-1">Shopping Cart</h1>
          <p className="text-muted mb-0">Update quantities before creating an order.</p>
        </div>
        <button className="btn btn-outline-danger" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="page-card p-3">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(function (item) {
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold">{item.name}</div>
                      <div className="small text-muted">{item.category}</div>
                    </td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td style={{ maxWidth: '120px' }}>
                      <input
                        className="form-control"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={function (event) {
                          updateQuantity(item.id, Math.max(1, Number(event.target.value) || 1));
                        }}
                      />
                    </td>
                    <td>${(Number(item.price) * item.quantity).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={function () { removeItem(item.id); }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <h4 className="mb-0">Total: ${total.toFixed(2)}</h4>
          <button className="btn btn-primary" onClick={function () { navigate('/checkout'); }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
