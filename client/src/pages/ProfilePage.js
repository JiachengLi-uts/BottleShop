import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user ? user.name : '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiRequest('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: name })
      });
      setUser(response.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="page-card p-4">
          <h2 className="mb-3">My Profile</h2>
          <p className="form-help">Role: {user.role}</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={name} onChange={function (event) { setName(event.target.value); }} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={user.email} disabled />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
