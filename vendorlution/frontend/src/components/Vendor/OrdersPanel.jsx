import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.orders.vendorOrders);
      const ordersData = response.data?.results || response.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      addNotification("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "warning",
      confirmed: "info",
      paid: "primary",
      processing: "secondary",
      shipped: "dark",
      delivered: "success",
      completed: "success",
      cancelled: "danger",
      refunded: "light"
    };
    
    const color = statusColors[status?.toLowerCase()] || "secondary";
    return <span className={`badge bg-${color} text-capitalize`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(Number(amount || 0));
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="fas fa-list-check me-2 text-primary"></i>
          Order Management
        </h3>
        <div className="text-muted">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <i className="fas fa-shopping-bag me-2"></i>
            All Orders
          </h5>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No orders yet</h5>
              <p className="text-muted">Orders from your products will appear here</p>
              <Link to="/marketplace" className="btn btn-dark mt-2">
                <i className="fas fa-store me-2"></i>
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th className="text-end">Items</th>
                    <th className="text-end">Total</th>
                    <th>Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-top">
                      <td className="ps-4">
                        <div className="fw-semibold">#{order.id}</div>
                        <small className="text-muted">
                          Ref: {order.order_number || order.id}
                        </small>
                      </td>
                      <td>
                        <div className="fw-medium">
                          {order.buyer?.first_name && order.buyer?.last_name 
                            ? `${order.buyer.first_name} ${order.buyer.last_name}`
                            : order.buyer?.username || order.buyer_name || "Customer"
                          }
                        </div>
                        <small className="text-muted">
                          {order.buyer?.email || ""}
                        </small>
                      </td>
                      <td>
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="text-end">
                        <span className="fw-medium">
                          {order.items_count || order.items?.length || 0}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="fw-bold text-primary">
                          {formatCurrency(order.total || order.grand_total)}
                        </div>
                      </td>
                      <td>
                        <div className="small text-muted">
                          {formatDate(order.created_at || order.created)}
                        </div>
                      </td>
                      <td className="text-center">
                        <Link
                          to={`/vendor/orders/${order.id}`}
                          className="btn btn-sm btn-outline-dark"
                          title="View order details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Table Footer */}
        {!loading && orders.length > 0 && (
          <div className="card-footer bg-light">
            <div className="row align-items-center">
              <div className="col">
                <small className="text-muted">
                  Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                </small>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-sm btn-outline-dark"
                  onClick={loadOrders}
                  disabled={loading}
                >
                  <i className="fas fa-refresh me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {!loading && orders.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">
                  <i className="fas fa-chart-pie me-2"></i>
                  Order Summary
                </h6>
                <div className="row text-center">
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-primary fw-bold fs-4">
                      {orders.filter(o => ['pending', 'confirmed'].includes(o.status?.toLowerCase())).length}
                    </div>
                    <small className="text-muted">Pending</small>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-info fw-bold fs-4">
                      {orders.filter(o => ['processing', 'shipped'].includes(o.status?.toLowerCase())).length}
                    </div>
                    <small className="text-muted">Processing</small>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-success fw-bold fs-4">
                      {orders.filter(o => ['delivered', 'completed'].includes(o.status?.toLowerCase())).length}
                    </div>
                    <small className="text-muted">Completed</small>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-danger fw-bold fs-4">
                      {orders.filter(o => ['cancelled', 'refunded'].includes(o.status?.toLowerCase())).length}
                    </div>
                    <small className="text-muted">Cancelled</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}