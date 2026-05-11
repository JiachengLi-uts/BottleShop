import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product, onAddToCart, isLoggedIn }) {
  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="p-3 d-flex flex-column product-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h5 className="mb-1">{product.name}</h5>
          <span className="badge badge-soft">{product.category}</span>
        </div>
        <p className="product-meta mb-2">Stock: {product.stock}</p>
        <p className="small product-description">{product.description}</p>
        <p className="fw-bold mb-3">${Number(product.price).toFixed(2)}</p>
        <div className="d-grid gap-2 mt-auto">
          <button className="btn btn-primary" onClick={onAddToCart}>
            {isLoggedIn ? 'Add to Cart' : 'Login to Add'}
          </button>
          <Link className="btn btn-outline-secondary btn-sm" to={'/products/' + product.id}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
