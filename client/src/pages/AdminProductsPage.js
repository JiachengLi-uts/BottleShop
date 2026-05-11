import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    try {
      const data = await apiRequest('/api/products?includeInactive=true');
      setProducts(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    try {
      await apiRequest('/api/products/' + id, {
        method: 'DELETE'
      });
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="mb-1">Admin Product Management</h1>
          <p className="text-muted mb-0">Create, edit, and delete products from the catalog.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/products/new">
          Add Product
        </Link>
      </div>

      <div className="page-card p-3">
        {loading ? (
          <div className="text-center py-4">Loading products...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map(function (product) {
                  return (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>{product.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link className="btn btn-outline-secondary" to={'/admin/products/' + product.id + '/edit'}>
                            Edit
                          </Link>
                          <button className="btn btn-outline-danger" onClick={function () { handleDelete(product.id); }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
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

export default AdminProductsPage;
