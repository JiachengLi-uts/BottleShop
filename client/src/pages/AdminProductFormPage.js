import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

const emptyProduct = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '',
  stock: '',
  isActive: true
};

function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(function () {
    if (editing) {
      loadProduct();
    }
  }, [id]);

  async function loadProduct() {
    setLoading(true);

    try {
      const product = await apiRequest('/api/products/' + id);
      setForm({
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description || '',
        image: product.image || '',
        stock: product.stock,
        isActive: product.isActive
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateField(event) {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm({
      ...form,
      [event.target.name]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await apiRequest('/api/products' + (editing ? '/' + id : ''), {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form)
      });
      toast.success(editing ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5">Loading product form...</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="page-card p-4">
          <h2 className="mb-3">{editing ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={updateField} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input className="form-control" name="category" value={form.category} onChange={updateField} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Price</label>
                <input className="form-control" name="price" type="number" step="0.01" value={form.price} onChange={updateField} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input className="form-control" name="stock" type="number" value={form.stock} onChange={updateField} required />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" id="isActive" name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} />
                  <label className="form-check-label" htmlFor="isActive">
                    Product is active
                  </label>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Image URL</label>
                <input className="form-control" name="image" value={form.image} onChange={updateField} />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="4" name="description" value={form.description} onChange={updateField} />
              </div>
            </div>
            <button className="btn btn-primary mt-4" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Save Product' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProductFormPage;
