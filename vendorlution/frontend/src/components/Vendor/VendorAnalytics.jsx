import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";

export default function VendorAnalytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [ordersRes, productsRes] = await Promise.all([
        api.get(API_ENDPOINTS.orders.vendorOrders),
        api.get(API_ENDPOINTS.vendorProducts.list)
      ]);

      const ordersData = ordersRes.data?.results || ordersRes.data || [];
      const productsData = productsRes.data?.results || productsRes.data || [];

      setOrders(ordersData);
      setProducts(productsData);
      
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      addNotification("Failed to load analytics data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const analytics = useMemo(() => {
    const statusCounts = {};
    let totalRevenue = 0;
    let totalItemsSold = 0;
    const completedOrders = [];

    // Process orders
    orders.forEach(order => {
      const status = order.status?.toLowerCase() || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (['delivered', 'completed'].includes(status)) {
        totalRevenue += Number(order.total || order.grand_total || 0);
        totalItemsSold += order.items_count || order.items?.length || 0;
        completedOrders.push(order);
      }
    });

    // Calculate product statistics
    const totalProducts = products.length;
    const outOfStockProducts = products.filter(p => (p.stock_quantity || 0) <= 0).length;
    const lowStockProducts = products.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 5).length;

    // Calculate average order value
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = completedOrders
      .filter(order => new Date(order.created_at || order.created) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + Number(order.total || order.grand_total || 0), 0);

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalItemsSold,
      totalProducts,
      outOfStockProducts,
      lowStockProducts,
      averageOrderValue,
      monthlyRevenue,
      statusCounts,
      completedOrders: completedOrders.length
    };
  }, [orders, products]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(Number(amount || 0));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      paid: 'primary',
      processing: 'secondary',
      shipped: 'dark',
      delivered: 'success',
      completed: 'success',
      cancelled: 'danger',
      refunded: 'light'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading analytics...</p>
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
            <i className="fas fa-chart-line me-2 text-primary"></i>
            Shop Analytics
          </h1>
          <p className="text-muted lead">
            Track your shop performance and sales metrics
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-outline-dark"
            onClick={loadAnalyticsData}
            disabled={loading}
          >
            <i className="fas fa-refresh me-2"></i>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-4 mb-5">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-primary mb-3">
                <i className="fas fa-shopping-bag fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{analytics.totalOrders}</h3>
              <p className="text-muted mb-0">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-success mb-3">
                <i className="fas fa-money-bill-wave fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{formatCurrency(analytics.totalRevenue)}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-info mb-3">
                <i className="fas fa-cube fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{analytics.totalItemsSold}</h3>
              <p className="text-muted mb-0">Items Sold</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="text-warning mb-3">
                <i className="fas fa-chart-bar fa-2x"></i>
              </div>
              <h3 className="fw-bold text-dark">{formatCurrency(analytics.averageOrderValue)}</h3>
              <p className="text-muted mb-0">Avg Order Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Products Summary */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-boxes me-2"></i>
                Products Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div className="text-primary fw-bold fs-3">{analytics.totalProducts}</div>
                  <small className="text-muted">Total Products</small>
                </div>
                <div className="col-4">
                  <div className="text-warning fw-bold fs-3">{analytics.lowStockProducts}</div>
                  <small className="text-muted">Low Stock</small>
                </div>
                <div className="col-4">
                  <div className="text-danger fw-bold fs-3">{analytics.outOfStockProducts}</div>
                  <small className="text-muted">Out of Stock</small>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Stock Health</span>
                  <span className="fw-semibold">
                    {analytics.totalProducts - analytics.outOfStockProducts} / {analytics.totalProducts}
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ 
                      width: `${((analytics.totalProducts - analytics.outOfStockProducts) / analytics.totalProducts) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Revenue Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center mb-4">
                <div className="col-6">
                  <div className="text-success fw-bold fs-4">{formatCurrency(analytics.monthlyRevenue)}</div>
                  <small className="text-muted">Last 30 Days</small>
                </div>
                <div className="col-6">
                  <div className="text-primary fw-bold fs-4">{formatCurrency(analytics.totalRevenue)}</div>
                  <small className="text-muted">All Time</small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Completed Orders</small>
                  <small className="fw-semibold">{analytics.completedOrders}</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ 
                      width: analytics.totalOrders > 0 ? `${(analytics.completedOrders / analytics.totalOrders) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Orders by Status
              </h5>
            </div>
            <div className="card-body">
              {Object.keys(analytics.statusCounts).length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-chart-pie fa-2x text-muted mb-3"></i>
                  <p className="text-muted">No order data available</p>
                </div>
              ) : (
                <div className="row">
                  {Object.entries(analytics.statusCounts).map(([status, count]) => (
                    <div className="col-6 col-md-4 col-lg-3 mb-3" key={status}>
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body text-center p-3">
                          <div className={`text-${getStatusColor(status)} mb-2`}>
                            <i className="fas fa-circle fa-lg"></i>
                          </div>
                          <div className="h4 fw-bold text-dark mb-1">{count}</div>
                          <div className="text-capitalize small text-muted">
                            {status.replace('_', ' ')}
                          </div>
                          <div className="small text-muted">
                            {((count / analytics.totalOrders) * 100).toFixed(1)}%
                          </div>
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

      {/* Performance Indicators */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-tachometer-alt me-2"></i>
                Performance Indicators
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 col-6 mb-3">
                  <div className={`fw-bold fs-4 ${analytics.averageOrderValue > 100 ? 'text-success' : 'text-warning'}`}>
                    {formatCurrency(analytics.averageOrderValue)}
                  </div>
                  <small className="text-muted">Average Order Value</small>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className={`fw-bold fs-4 ${analytics.completedOrders > 0 ? 'text-success' : 'text-secondary'}`}>
                    {analytics.completedOrders}
                  </div>
                  <small className="text-muted">Successful Orders</small>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className={`fw-bold fs-4 ${analytics.totalItemsSold > 10 ? 'text-success' : 'text-warning'}`}>
                    {analytics.totalItemsSold}
                  </div>
                  <small className="text-muted">Total Items Sold</small>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className={`fw-bold fs-4 ${analytics.outOfStockProducts === 0 ? 'text-success' : 'text-danger'}`}>
                    {analytics.outOfStockProducts}
                  </div>
                  <small className="text-muted">Out of Stock Items</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}