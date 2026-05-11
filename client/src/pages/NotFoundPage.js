import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="empty-state">
      <h2>Page not found</h2>
      <p className="mb-3">The page you requested does not exist.</p>
      <Link className="btn btn-primary" to="/products">
        Return to Products
      </Link>
    </div>
  );
}

export default NotFoundPage;
