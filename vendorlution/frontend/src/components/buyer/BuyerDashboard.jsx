import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";

export default function BuyerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    wallet: { balance: 0, pending: 0 },
    orders: [],
    wishlist: []
  });

  const stats = useMemo(() => {
    const orders = dashboardData.orders;
    const totalOrders = orders.length;
    const inProgress = orders.filter(order => 
      ['pending', 'paid', 'confirmed', 'processing', 'shipped', 'in_transit'].includes(order.status?.toLowerCase())
    ).length;
    const completed = orders.filter(order => 
      ['delivered', 'completed'].includes(order.status?.toLowerCase())
    ).length;

    return { totalOrders, inProgress, completed };
  }, [dashboardData.orders]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [walletRes, ordersRes, wishlistRes] = await Promise.all([
          api.get(API_ENDPOINTS.wallet.me),
          api.get(API_ENDPOINTS.orders.my),
          api.get(API_ENDPOINTS.wishlist.list)
        ]);

        const ordersData = ordersRes.data?.results || ordersRes.data || [];
        const wishlistData = wishlistRes.data?.results || wishlistRes.data || [];

        setDashboardData({
          wallet: {
            balance: Number(walletRes.data?.balance || 0),
            pending: Number(walletRes.data?.pending || 0)
          },
          orders: ordersData,
          wishlist: wishlistData
        });

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        addNotification("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, addNotification]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(Number(amount || 0));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info text-center">
          <i className="fas fa-info-circle me-2"></i>
          Please <Link to="/login" className="alert-link">sign in</Link> to view your dashboard.
        </div>
      </div>
    );
  }

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

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row align-items-center mb-5">
        <div className="col-md-8">
          <h1 className="fw-bold text-dark mb-2">
            Hi {user?.first_name || user?.username || "there"} 👋
          </h1>
          <p className="text-muted lead">
            Track orders, manage wishlist, and your wallet.
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/cart" className="btn btn-dark">
              <i className="fas fa-shopping-cart me-2"></i>
              View Cart
            </Link>
            <Link to="/wallet/deposit" className="btn btn-outline-dark">
              <i className="fas fa-wallet me-2"></i>
              Deposit
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-success mb-3">
                <i className="fas fa-wallet fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{formatCurrency(dashboardData.wallet.balance)}</h3>
              <p className="text-muted mb-0">Wallet Balance</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-warning mb-3">
                <i className="fas fa-lock fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{formatCurrency(dashboardData.wallet.pending)}</h3>
              <p className="text-muted mb-0">In Escrow</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-primary mb-3">
                <i className="fas fa-box fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{stats.totalOrders}</h3>
              <p className="text-muted mb-0">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-info mb-3">
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{stats.completed}</h3>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-clock-rotate-left me-2"></i>
                Recent Orders
              </h5>
              <Link to="/customer/orders" className="btn btn-sm btn-outline-light">
                View All
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.orders.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-2x text-muted mb-3"></i>
                  <p className="text-muted">No orders yet</p>
                  <Link to="/marketplace" className="btn btn-dark mt-2">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">Order #{order.id}</div>
                          <small className="text-muted text-capitalize">
                            {order.status} • {formatDate(order.created_at || order.created)}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">
                            {formatCurrency(order.total || order.grand_total || 0)}
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

        {/* Wishlist */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-heart me-2"></i>
                Wishlist
              </h5>
              <Link to="/customer/wishlist" className="btn btn-sm btn-outline-light">
                Manage
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.wishlist.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-heart fa-2x text-muted mb-3"></i>
                  <p className="text-muted">Your wishlist is empty</p>
                  <Link to="/marketplace" className="btn btn-outline-dark mt-2">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.wishlist.slice(0, 5).map((item) => {
                    const product = item.product || {};
                    return (
                      <div key={item.id} className="list-group-item border-0 px-0">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="flex-grow-1">
                            <div className="fw-medium text-truncate">
                              {product.title || product.name || "Product"}
                            </div>
                            <small className="text-muted">
                              {formatCurrency(product.price || 0)}
                            </small>
                          </div>
                          <Link 
                            to={`/product/${product.slug || product.id}`}
                            className="btn btn-sm btn-outline-dark ms-3"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
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
                  <Link to="/marketplace" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-store fa-2x mb-2 d-block"></i>
                    Browse Products
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/customer/orders" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-list-check fa-2x mb-2 d-block"></i>
                    View Orders
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/wallet" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-wallet fa-2x mb-2 d-block"></i>
                    Wallet
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/customer/profile" className="btn btn-outline-dark w-100 h-100 py-3">
                    <i className="fas fa-user fa-2x mb-2 d-block"></i>
                    Profile
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