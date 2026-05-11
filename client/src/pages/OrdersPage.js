import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    try {
      const data = await apiRequest('/api/orders/me');
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5">Loading orders...</div>;
  }

  if (!orders.length) {
    return <div className="empty-state">You have not placed any orders yet.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="mb-1">My Orders</h1>
        <p className="text-muted mb-0">Review your previous checkouts and order status.</p>
      </div>

      <div className="d-grid gap-3">
        {orders.map(function (order) {
          return (
            <div className="page-card p-3 order-card" key={order.id}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-1">Order #{order.id}</h5>
                  <div className="text-muted small">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-secondary text-uppercase">{order.status}</span>
                  <div className="fw-semibold mt-2">${Number(order.totalAmount).toFixed(2)}</div>
                </div>
              </div>
              <ul className="list-group">
                {order.items.map(function (item) {
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersPage;
