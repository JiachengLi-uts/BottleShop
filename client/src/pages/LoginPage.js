import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = await login({ email: email, password: password });
      toast.success('Welcome back, ' + user.name);
      navigate(location.state && location.state.from ? location.state.from : '/products');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="page-card p-4">
          <h2 className="mb-3">Login</h2>
          <p className="form-help mb-4">Admin demo account: admin@bottleshop.com / admin123</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={function (event) { setEmail(event.target.value); }}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={function (event) { setPassword(event.target.value); }}
                required
              />
            </div>
            <button className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-3 mb-0">
            Need an account? <Link to="/register">Register here</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
