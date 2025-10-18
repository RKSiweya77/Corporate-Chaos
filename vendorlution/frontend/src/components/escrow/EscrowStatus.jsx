// src/components/escrow/EscrowStatus.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { ZAR } from "../../utils/formatters";

export default function EscrowStatus({ orderId: propOrderId }) {
  const { isAuthenticated, user } = useAuth();
  const params = useParams();
  const orderId = propOrderId || params.orderId || params.id;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [releasing, setReleasing] = useState(false);
  const [success, setSuccess] = useState("");

  // Load order and escrow data
  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(API_ENDPOINTS.orders.detail(orderId));
        if (!isMounted) return;
        setOrder(res.data);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.detail || "Failed to load order details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => { isMounted = false; };
  }, [isAuthenticated, orderId]);

  const escrow = useMemo(() => {
    if (!order) return null;
    
    // Use direct escrow data or derive from order
    if (order.escrow) return order.escrow;
    
    // Derive escrow status from order status
    const orderStatus = (order.status || "").toLowerCase();
    let escrowStatus = "unknown";
    
    if (["delivered", "completed", "closed"].includes(orderStatus)) {
      escrowStatus = "released";
    } else if (["disputed", "cancelled", "refunded"].includes(orderStatus)) {
      escrowStatus = orderStatus;
    } else if (["pending", "confirmed", "paid", "shipped", "in_transit"].includes(orderStatus)) {
      escrowStatus = "held";
    }

    return {
      amount: order.total || order.amount || 0,
      status: escrowStatus,
      order_status: order.status,
      created_at: order.created_at,
      can_release: orderStatus === "delivered" && user?.id === order.buyer?.id
    };
  }, [order, user]);

  const confirmDelivery = useCallback(async () => {
    if (!orderId || !escrow?.can_release) return;

    try {
      setReleasing(true);
      setError("");
      await api.post(API_ENDPOINTS.orders.confirmDelivery(orderId));
      
      // Refresh order data
      const res = await api.get(API_ENDPOINTS.orders.detail(orderId));
      setOrder(res.data);
      setSuccess("Delivery confirmed! Funds have been released to the vendor.");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to confirm delivery. Please try again.");
    } finally {
      setReleasing(false);
    }
  }, [orderId, escrow?.can_release]);

  const getStatusConfig = (status) => {
    const statusMap = {
      held: { badge: "bg-warning text-dark", icon: "fa-lock", text: "Funds Held" },
      released: { badge: "bg-success", icon: "fa-check-circle", text: "Funds Released" },
      disputed: { badge: "bg-danger", icon: "fa-exclamation-triangle", text: "Under Dispute" },
      refunded: { badge: "bg-info", icon: "fa-undo", text: "Refunded" },
      cancelled: { badge: "bg-secondary", icon: "fa-ban", text: "Cancelled" }
    };
    return statusMap[status?.toLowerCase()] || { badge: "bg-secondary", icon: "fa-question", text: "Unknown" };
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <i className="fa fa-info-circle me-2" />
          Please sign in to view escrow status.
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  if (!order) {
    return (
      <div className="container py-4">
        <EmptyState
          icon="fa-search"
          title="Order not found"
          subtitle={error || "The order you're looking for doesn't exist or you don't have permission to view it."}
        />
      </div>
    );
  }

  const statusConfig = getStatusConfig(escrow?.status);
  const isBuyer = user?.id === order.buyer?.id;

  return (
    <div className="container py-4">
      {/* Success Message */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fa fa-check-circle me-2" />
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess("")}
            aria-label="Close"
          />
        </div>
      )}

      <div className="row g-4">
        {/* Main Escrow Status */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1 fw-bold">
                  <i className="fa fa-shield-alt text-primary me-2" />
                  Escrow Protection Status
                </h5>
                <div className="small text-muted">
                  Order #{order.id} • {order.vendor?.shop_name || 'Vendor'}
                </div>
              </div>
              <span className={`badge ${statusConfig.badge} px-3 py-2`}>
                <i className={`fa ${statusConfig.icon} me-1`} />
                {statusConfig.text}
              </span>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="fa fa-exclamation-circle me-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Status Overview */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Order Status</div>
                  <div className="fw-bold text-capitalize">{order.status || "unknown"}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Protected Amount</div>
                  <div className="fw-bold text-success">{ZAR(escrow?.amount || 0)}</div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Order Date</div>
                  <div className="fw-semibold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Last Updated</div>
                  <div className="fw-semibold">
                    {new Date(order.updated_at || order.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-top pt-3">
                <div className="d-flex flex-wrap gap-2">
                  {escrow?.can_release && isBuyer && (
                    <button
                      className="btn btn-success"
                      onClick={confirmDelivery}
                      disabled={releasing}
                    >
                      {releasing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Releasing Funds...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-check-circle me-2" />
                          Confirm Delivery & Release Funds
                        </>
                      )}
                    </button>
                  )}

                  {escrow?.status === 'held' && isBuyer && (
                    <Link
                      to={`/disputes/new?order=${orderId}`}
                      className="btn btn-outline-danger"
                    >
                      <i className="fa fa-flag me-2" />
                      Open Dispute
                    </Link>
                  )}

                  <Link
                    to={`/orders/${orderId}`}
                    className="btn btn-outline-dark"
                  >
                    <i className="fa fa-eye me-2" />
                    View Order Details
                  </Link>

                  <Link
                    to={`/chat?order=${orderId}`}
                    className="btn btn-outline-primary"
                  >
                    <i className="fa fa-comments me-2" />
                    Contact {isBuyer ? 'Vendor' : 'Buyer'}
                  </Link>
                </div>
              </div>
            </div>

            <div className="card-footer bg-light">
              <div className="small text-muted">
                <i className="fa fa-info-circle me-1" />
                {escrow?.status === 'held' 
                  ? "Funds are securely held in escrow until delivery is confirmed. If no action is taken, funds will be automatically released after the protection period."
                  : escrow?.status === 'released'
                  ? "Funds have been successfully released to the vendor. Thank you for using Vendorlution's secure escrow service."
                  : "Escrow protection ensures your transaction is secure. Contact support if you have any questions."
                }
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-receipt text-muted me-2" />
                Order Summary
              </h6>
            </div>
            <div className="card-body">
              {/* Order Items */}
              {(order.items || []).length > 0 && (
                <div className="mb-3">
                  <div className="small text-muted mb-2">Items ({order.items.length})</div>
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="d-flex justify-content-between small mb-1">
                      <span className="text-truncate" style={{ maxWidth: '70%' }}>
                        {item.quantity}x {item.product?.title || 'Item'}
                      </span>
                      <span>{ZAR(item.price || 0)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="small text-muted text-center">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="border-top pt-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Subtotal</span>
                  <span>{ZAR(order.subtotal || order.total || 0)}</span>
                </div>
                {order.shipping_fee > 0 && (
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Shipping</span>
                    <span>{ZAR(order.shipping_fee)}</span>
                  </div>
                )}
                {order.protection_fee > 0 && (
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Protection Fee</span>
                    <span>{ZAR(order.protection_fee)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">{ZAR(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-question-circle text-muted me-2" />
                Need Help?
              </h6>
            </div>
            <div className="card-body">
              <div className="small">
                <p className="mb-2">Having issues with your order?</p>
                <ul className="ps-3 mb-0">
                  <li>Contact the {isBuyer ? 'vendor' : 'buyer'} first via chat</li>
                  <li>Open a dispute if you can't resolve the issue</li>
                  <li>Contact support for urgent matters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}