// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { EscrowProvider } from './context/EscrowContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

import Header from './components/shared/Header.jsx';
import Footer from './components/shared/Footer.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Public Pages
import Landing from './pages/Landing.jsx';
import Products from './pages/Products.jsx';
import Vendors from './pages/Vendors.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import VendorDetail from './pages/VendorDetail.jsx';
import VendorStore from './pages/VendorStore.jsx';
import NotFound from './pages/NotFound.jsx';

// Auth Pages
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';

// Buyer Pages
import BuyerDashboard from './components/buyer/BuyerDashboard.jsx';
import Cart from './components/buyer/Cart.jsx';
import Checkout from './components/buyer/Checkout.jsx';
import OrderHistory from './components/buyer/OrderHistory.jsx';
import OrderDetail from './components/buyer/OrderDetail.jsx';
import Wishlist from './components/buyer/Wishlist.jsx';
import Profile from './components/buyer/Profile.jsx';

// Wallet Pages
import WalletOverview from './components/wallet/WalletOverview.jsx';
import Deposit from './components/wallet/Deposit.jsx';
import Withdraw from './components/wallet/Withdraw.jsx';
import TransactionHistory from './components/wallet/TransactionHistory.jsx';

// Vendor Pages
import VendorDashboard from './components/vendor/VendorDashboard.jsx';
import ProductManagement from './components/vendor/ProductManagement.jsx';
import OrdersPanel from './components/vendor/OrdersPanel.jsx';
import VendorAnalytics from './components/vendor/VendorAnalytics.jsx';
import CreateShop from './components/vendor/CreateShop.jsx';
import VendorProfile from './components/vendor/VendorProfile.jsx';
import VendorSettings from './components/vendor/VendorSettings.jsx';

// Chat Pages
import ChatPage from './pages/ChatPage.jsx';

// Notification Pages
import NotificationCenter from './components/notifications/NotificationCenter.jsx';

// Escrow & Dispute Pages
import EscrowStatus from './components/escrow/EscrowStatus.jsx';
import DisputeCenter from './components/escrow/DisputeCenter.jsx';
import DisputeDetail from './components/escrow/DisputeDetail.jsx';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import DisputeManagement from './components/admin/DisputeManagement.jsx';
import SystemSettings from './components/admin/SystemSettings.jsx';

/**
 * Scroll to top on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <EscrowProvider>
          <CartProvider>
            <div className="d-flex flex-column min-vh-100">
              <ScrollToTop />
              <Header />
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* ============================================ */}
                  {/* PUBLIC ROUTES */}
                  {/* ============================================ */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/vendors/:id" element={<VendorStore />} />
                  <Route path="/vendor/store/:slug?/:id" element={<VendorStore />} />
                  
                  {/* Static Pages */}
                  <Route path="/about" element={<div className="container py-5"><h1>About Us</h1><p>Learn more about Vendorlution and our mission.</p></div>} />
                  <Route path="/contact" element={<div className="container py-5"><h1>Contact Us</h1><p>Get in touch with our support team.</p></div>} />
                  <Route path="/help" element={<div className="container py-5"><h1>Help Center</h1><p>Find answers to frequently asked questions.</p></div>} />

                  {/* ============================================ */}
                  {/* AUTH ROUTES (Public - Redirect if logged in) */}
                  {/* ============================================ */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* ============================================ */}
                  {/* BUYER ROUTES (Protected - Any authenticated user) */}
                  {/* ============================================ */}
                  <Route path="/buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  {/* ============================================ */}
                  {/* WALLET ROUTES (Protected - Any authenticated user) */}
                  {/* ============================================ */}
                  <Route path="/wallet" element={<ProtectedRoute><WalletOverview /></ProtectedRoute>} />
                  <Route path="/wallet/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                  <Route path="/wallet/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                  <Route path="/wallet/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />

                  {/* ============================================ */}
                  {/* VENDOR ROUTES */}
                  {/* ============================================ */}
                  
                  {/* Create Shop - Any authenticated user can access */}
                  <Route path="/vendor/create-shop" element={<ProtectedRoute><CreateShop /></ProtectedRoute>} />
                  <Route path="/vendor/create" element={<Navigate to="/vendor/create-shop" replace />} />
                  
                  {/* Vendor Dashboard & Management - Requires vendor role */}
                  <Route path="/vendor/dashboard" element={<ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>} />
                  <Route path="/vendor/products" element={<ProtectedRoute role="vendor"><ProductManagement /></ProtectedRoute>} />
                  <Route path="/vendor/orders" element={<ProtectedRoute role="vendor"><OrdersPanel /></ProtectedRoute>} />
                  <Route path="/vendor/analytics" element={<ProtectedRoute role="vendor"><VendorAnalytics /></ProtectedRoute>} />
                  <Route path="/vendor/profile" element={<ProtectedRoute role="vendor"><VendorProfile /></ProtectedRoute>} />
                  <Route path="/vendor/settings" element={<ProtectedRoute role="vendor"><VendorSettings /></ProtectedRoute>} />

                  {/* ============================================ */}
                  {/* CHAT ROUTES (Protected) */}
                  {/* ============================================ */}
                  <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/chat/vendor/:vendorId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/messages" element={<Navigate to="/chat" replace />} />

                  {/* ============================================ */}
                  {/* NOTIFICATION ROUTES (Protected) */}
                  {/* ============================================ */}
                  <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />

                  {/* ============================================ */}
                  {/* ESCROW & DISPUTE ROUTES (Protected) */}
                  {/* ============================================ */}
                  <Route path="/escrow/:orderId" element={<ProtectedRoute><EscrowStatus /></ProtectedRoute>} />
                  <Route path="/disputes" element={<ProtectedRoute><DisputeCenter /></ProtectedRoute>} />
                  <Route path="/disputes/:id" element={<ProtectedRoute><DisputeDetail /></ProtectedRoute>} />

                  {/* ============================================ */}
                  {/* ADMIN ROUTES (Protected - Admin role required) */}
                  {/* ============================================ */}
                  <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
                  <Route path="/admin/disputes" element={<ProtectedRoute role="admin"><DisputeManagement /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SystemSettings /></ProtectedRoute>} />

                  {/* ============================================ */}
                  {/* CONVENIENCE REDIRECTS */}
                  {/* ============================================ */}
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/store" element={<Navigate to="/products" replace />} />
                  <Route path="/shop" element={<Navigate to="/products" replace />} />
                  <Route path="/marketplace" element={<Navigate to="/products" replace />} />
                  <Route path="/account" element={<Navigate to="/profile" replace />} />
                  <Route path="/my-account" element={<Navigate to="/profile" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/buyer" replace />} />

                  {/* ============================================ */}
                  {/* 404 FALLBACK */}
                  {/* ============================================ */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </EscrowProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}