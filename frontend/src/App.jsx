import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import api from './utils/api';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';

import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import ShippingDelivery from './pages/policies/ShippingDelivery';
import RefundCancellation from './pages/policies/RefundCancellation';
import TermsConditions from './pages/policies/TermsConditions';
import ContactUs from './pages/policies/ContactUs';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLanding from './pages/admin/AdminLanding';
import AdminBranches from './pages/admin/AdminBranches';
import AdminCategories from './pages/admin/AdminCategories';

const MainLayout = () => (
  <>
    <Navbar />
    <CartSidebar />
    <main style={{ paddingTop: 72, minHeight: '80vh' }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    api.get('/api/settings').then(({ data }) => {
      document.documentElement.setAttribute('data-theme', data.theme || 'gold-white');
    }).catch(() => {
      document.documentElement.setAttribute('data-theme', 'gold-white');
    });
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="landing" element={<AdminLanding />} />
          <Route path="branches" element={<AdminBranches />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shipping-delivery" element={<ShippingDelivery />} />
          <Route path="/refund-cancellation" element={<RefundCancellation />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/contactus" element={<ContactUs />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </>
  );
}

const AppWithProviders = () => (
  <Router>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </Router>
);

export default AppWithProviders;
