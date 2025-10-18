// src/components/vendor/VendorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

export default function VendorDashboard() {
  const { user, vendorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    wallet: { balance: 0, pending: 0 },
    productsCount: 0,
    orders: [],
    vendor: null
  });

  const stats = useMemo(() => {
    const orders = dashboardData.orders || [];
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed', 'processing'].includes(order.status?.toLowerCase())
    ).length;
    const completedOrders = orders.filter(order => 
      ['delivered', 'completed'].includes(order.status?.toLowerCase())
    );
    const totalRevenue = completedOrders.reduce((sum, order) => 
      sum + Number(order.total || order.grand_total || 0), 0
    );

    return { totalOrders, pendingOrders, completedOrders: completedOrders.length, totalRevenue };
  }, [dashboardData.orders]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has vendor_id
        const currentVendorId = vendorId || user?.vendor_id;
        
        if (!currentVendorId) {
          setError("No vendor profile found. Please create a shop first.");
          setLoading(false);
          return;
        }

        console.log("Loading dashboard for vendor:", currentVendorId);

        // Load data with error handling for each request
        const results = await Promise.allSettled([
          api.get(API_ENDPOINTS.wallet.me).catch(err => {
            console.warn("Wallet fetch failed:", err);
            return { data: { balance: 0, pending: 0 } };
          }),
          api.get(API_ENDPOINTS.vendorProducts.list).catch(err => {
            console.warn("Products fetch failed:", err);
            return { data: [] };
          }),
          api.get(API_ENDPOINTS.orders.vendorOrders).catch(err => {
            console.warn("Orders fetch failed:", err);
            return { data: [] };
          }),
          api.get(API_ENDPOINTS.vendors.detail(currentVendorId)).catch(err => {
            console.warn("Vendor details fetch failed:", err);
            return { data: null };
          })
        ]);

        const [walletRes, productsRes, ordersRes, vendorRes] = results.map(r => 
          r.status === 'fulfilled' ? r.value : { data: null }
        );

        const productsData = productsRes.data?.results || productsRes.data || [];
        const ordersData = ordersRes.data?.results || ordersRes.data || [];

        setDashboardData({
          wallet: {
            balance: Number(walletRes.data?.balance || 0),
            pending: Number(walletRes.data?.pending || 0)
          },
          productsCount: Array.isArray(productsData) ? productsData.length : productsRes.data?.count || 0,
          orders: ordersData,
          vendor: vendorRes.data
        });

      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, vendorId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error Loading Dashboard</h4>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <button className="btn btn-danger" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <Link to="/vendor/create-shop" className="btn btn-primary">
              Create Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row align-items-center mb-5">
        <div className="col-md-8">
          <h1 className="fw-bold text-dark mb-2">
            Welcome back, {dashboardData.vendor?.shop_name || user?.first_name || "Vendor"}!
          </h1>
          <p className="text-muted lead">
            Here's what's happening with your shop today.
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/vendor/products" className="btn btn-dark">
              <i className="fas fa-box me-2"></i>
              Manage Products
            </Link>
            <Link to="/vendor/orders" className="btn btn-outline-dark">
              <i className="fas fa-list-check me-2"></i>
              View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-primary mb-3">
                <i className="fas fa-box fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{dashboardData.productsCount}</h3>
              <p className="text-muted mb-0">Total Products</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-success mb-3">
                <i className="fas fa-shopping-bag fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{stats.totalOrders}</h3>
              <p className="text-muted mb-0">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-warning mb-3">
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{stats.pendingOrders}</h3>
              <p className="text-muted mb-0">Pending Orders</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-info mb-3">
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">R {stats.totalRevenue.toFixed(2)}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Wallet Section */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-wallet me-2"></i>
                Wallet Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Available Balance</span>
                  <strong className="text-success fs-5">
                    R {dashboardData.wallet.balance.toFixed(2)}
                  </strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">In Escrow</span>
                  <strong className="text-warning fs-5">
                    R {dashboardData.wallet.pending.toFixed(2)}
                  </strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ 
                      width: dashboardData.wallet.balance + dashboardData.wallet.pending > 0 
                        ? `${(dashboardData.wallet.pending / (dashboardData.wallet.balance + dashboardData.wallet.pending)) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex">
                <Link to="/wallet/deposit" className="btn btn-outline-dark flex-fill">
                  <i className="fas fa-arrow-down me-2"></i>
                  Deposit
                </Link>
                <Link to="/wallet/withdraw" className="btn btn-dark flex-fill">
                  <i className="fas fa-arrow-up me-2"></i>
                  Withdraw
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-clock-rotate-left me-2"></i>
                Recent Orders
              </h5>
              <Link to="/vendor/orders" className="btn btn-sm btn-outline-light">
                View All
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.orders.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-2x text-muted mb-3"></i>
                  <p className="text-muted">No orders yet</p>
                  <small className="text-muted">Orders will appear here once customers purchase your products</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="list-group-item px-0 border-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">Order #{order.id}</div>
                          <small className="text-muted text-capitalize">
                            {order.status} • {new Date(order.created_at || order.created).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">
                            R {Number(order.total || order.grand_total || 0).toFixed(2)}
                          </div>
                          <small className="text-muted">
                            {order.items_count || order.items?.length || 0} items
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <Link to="/vendor/products" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-plus-circle fa-2x mb-2 d-block"></i>
                    Add Product
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/vendor/analytics" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-chart-bar fa-2x mb-2 d-block"></i>
                    Analytics
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/vendor/profile" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-store fa-2x mb-2 d-block"></i>
                    Shop Settings
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/vendor/orders" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-list-check fa-2x mb-2 d-block"></i>
                    Manage Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}