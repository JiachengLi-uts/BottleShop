import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function CheckoutPage({ onCartChange }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCheckout() {
    setSubmitting(true);

    try {
      const response = await apiRequest('/api/orders', {
        method: 'POST'
      });
      await onCartChange();
      toast.success('Order #' + response.orderId + ' created');
      navigate('/orders');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const total = items.reduce(function (sum, item) {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  if (loading) {
    return <div className="text-center py-5">Loading checkout...</div>;
  }

  if (!items.length) {
    return <div className="empty-state">Your cart is empty, so there is nothing to checkout.</div>;
  }

  return (
    <div className="page-card p-4">
      <h1 className="mb-3">Checkout</h1>
      <p className="text-muted">Review your order below and create it when ready.</p>
      <ul className="list-group mb-4">
        {items.map(function (item) {
          return (
            <li className="list-group-item d-flex justify-content-between" key={item.id}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </li>
          );
        })}
      </ul>
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Order Total: ${total.toFixed(2)}</h4>
        <button className="btn btn-success" onClick={handleCheckout} disabled={submitting}>
          {submitting ? 'Creating Order...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;
