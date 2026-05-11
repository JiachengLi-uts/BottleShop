import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    try {
      const data = await apiRequest('/api/orders');
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      await apiRequest('/api/orders/' + orderId + '/status', {
        method: 'PUT',
        body: JSON.stringify({ status: status })
      });
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="mb-1">Admin Orders</h1>
        <p className="text-muted mb-0">View all orders and update their status.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders have been placed yet.</div>
      ) : (
        <div className="d-grid gap-3">
          {orders.map(function (order) {
            return (
              <div className="page-card p-3" key={order.id}>
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h5 className="mb-1">Order #{order.id}</h5>
                    <div className="small text-muted">{order.customerName} ({order.customerEmail})</div>
                    <div className="small text-muted">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <strong>${Number(order.totalAmount).toFixed(2)}</strong>
                    <select
                      className="form-select"
                      value={order.status}
                      onChange={function (event) { updateStatus(order.id, event.target.value); }}
                    >
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="shipped">shipped</option>
                      <option value="cancelled">cancelled</option>
                    </select>
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
      )}
    </div>
  );
}

export default AdminOrdersPage;
