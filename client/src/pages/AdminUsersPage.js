import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [activityByUser, setActivityByUser] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    try {
      const data = await apiRequest('/api/users');
      setUsers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadActivity(userId) {
    try {
      const data = await apiRequest('/api/users/' + userId + '/activity');
      setActivityByUser({
        ...activityByUser,
        [userId]: data
      });
      setExpandedUserId(expandedUserId === userId ? null : userId);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function updateUser(userId, role, status) {
    try {
      await apiRequest('/api/users/' + userId, {
        method: 'PUT',
        body: JSON.stringify({ role: role, status: status })
      });
      toast.success('User updated');
      loadUsers();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="mb-1">Admin Users</h1>
        <p className="text-muted mb-0">Review user accounts, roles, status, and activity history.</p>
      </div>

      <div className="page-card p-3">
        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(function (user) {
                  return (
                    <React.Fragment key={user.id}>
                      <tr>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={user.role}
                            onChange={function (event) {
                              updateUser(user.id, event.target.value, user.status);
                            }}
                          >
                            <option value="customer">customer</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={user.status}
                            onChange={function (event) {
                              updateUser(user.id, user.role, event.target.value);
                            }}
                          >
                            <option value="active">active</option>
                            <option value="disabled">disabled</option>
                          </select>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary" onClick={function () { loadActivity(user.id); }}>
                            {expandedUserId === user.id ? 'Hide Activity' : 'View Activity'}
                          </button>
                        </td>
                      </tr>
                      {expandedUserId === user.id && (
                        <tr>
                          <td colSpan="6">
                            <div className="activity-list">
                              {(activityByUser[user.id] || []).length === 0 ? (
                                <div className="text-muted small">No activity recorded yet.</div>
                              ) : (
                                <ul className="list-group">
                                  {activityByUser[user.id].map(function (item) {
                                    return (
                                      <li className="list-group-item" key={item.id}>
                                        <div className="fw-semibold">{item.action}</div>
                                        <div className="small text-muted">{item.details || 'No details'}</div>
                                        <div className="small text-muted">{new Date(item.createdAt).toLocaleString()}</div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
