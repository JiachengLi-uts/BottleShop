import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  NavLink,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';
import { apiRequest } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout() {
  const { user, logout, loading } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  async function refreshCartCount() {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const items = await apiRequest('/api/cart');
      const total = items.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0);
      setCartCount(total);
    } catch (error) {
      setCartCount(0);
    }
  }

  useEffect(function () {
    refreshCartCount();
  }, [user]);

  function handleLogout() {
    logout();
    setCartCount(0);
    toast.success('Logged out');
  }

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-shell">
        <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
          <div className="container">
            <NavLink className="navbar-brand" to="/products">
              Bottle Shop
            </NavLink>

            <div className="app-nav-content">
              <div className="navbar-nav me-auto flex-wrap">
                <NavLink className="nav-link" to="/products">
                  Products
                </NavLink>
                {user && (
                  <NavLink className="nav-link" to="/orders">
                    My Orders
                  </NavLink>
                )}
                {user && user.role === 'admin' && (
                  <>
                    <NavLink className="nav-link" to="/admin/products">
                      Admin Products
                    </NavLink>
                    <NavLink className="nav-link" to="/admin/orders">
                      Admin Orders
                    </NavLink>
                    <NavLink className="nav-link" to="/admin/users">
                      Admin Users
                    </NavLink>
                  </>
                )}
              </div>

              <div className="navbar-nav align-items-start align-items-lg-center gap-lg-2 flex-wrap">
                {user ? (
                  <>
                    <NavLink className="nav-link" to="/cart">
                      Cart ({cartCount})
                    </NavLink>
                    <NavLink className="nav-link" to="/profile">
                      {user.name}
                    </NavLink>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink className="nav-link" to="/login">
                      Login
                    </NavLink>
                    <NavLink className="btn btn-warning btn-sm" to="/register">
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/products"
              element={<ProductsPage user={user} onCartChange={refreshCartCount} />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetailPage user={user} onCartChange={refreshCartCount} />}
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage onCartChange={refreshCartCount} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage onCartChange={refreshCartCount} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <AdminProductFormPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <AdminRoute>
                  <AdminProductFormPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrdersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <ToastContainer position="top-center" autoClose={1800} />
      </div>
    </Router>
  );
}

function App() {
  return <AppLayout />;
}

export default App;
