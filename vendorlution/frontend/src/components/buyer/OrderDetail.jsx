// src/components/buyer/OrderDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Friendly label map (kept in-file to avoid new imports)
  const statusLabel = useMemo(
    () => ({
      pending: "Pending",
      confirmed: "Confirmed",
      in_transit: "In Transit",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      disputed: "In Dispute",
    }),
    []
  );

  const canConfirmDelivery = useMemo(() => {
    if (!order) return false;
    const s = (order.status || "").toLowerCase();
    // Allow confirm when shipped/in_transit/confirmed; block when already delivered/cancelled/disputed
    return !["delivered", "cancelled", "disputed"].includes(s);
  }, [order]);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      // 1) Try direct detail endpoint
      try {
        const res = await api.get(`/orders/${id}/`);
        setOrder(res.data);
        setLoading(false);
        return;
      } catch (e1) {
        // 2) Fallback: search my orders for matching id
        try {
          const list = await api.get(`/me/orders/`);
          const results = Array.isArray(list.data)
            ? list.data
            : list.data?.results || [];
          const found = results.find(
            (o) => String(o.id) === String(id) || String(o?.order_id) === String(id)
          );
          if (found) {
            setOrder(found);
            setLoading(false);
            return;
          }
          setError("Order not found.");
        } catch (e2) {
          setError("Failed to load order.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const confirmDelivery = async () => {
    if (!order) return;
    setConfirming(true);
    setError("");

    try {
      // Your endpoints file exposes confirm-delivery; call it directly:
      await api.post(`/orders/${order.id}/confirm-delivery/`);
      // Optimistically update local state
      setOrder((prev) => (prev ? { ...prev, status: "delivered" } : prev));
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to confirm delivery."
      );
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!order && !loading)
    return (
      <div className="container py-4">
        <EmptyState
          title="Order not found"
          subtitle="We couldn’t locate that order. Please check the link or go back to your order history."
        />
        <div className="mt-3">
          <Link className="btn btn-outline-dark" to="/buyer/orders">
            Back to Orders
          </Link>
        </div>
      </div>
    );

  const items = order?.items || order?.order_items || [];
  const address =
    order?.address_snapshot ||
    order?.shipping_address ||
    order?.address ||
    null;
  const escrow = order?.escrow || null;
  const shipment = order?.shipment || order?.shipments?.[0] || null;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Order #{order?.id}</h4>
        <Link className="btn btn-outline-dark btn-sm" to="/buyer/orders">
          Back to Orders
        </Link>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {/* Status + Meta */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="fw-600">
                Status:{" "}
                <span className="badge bg-dark">
                  {statusLabel[(order?.status || "").toLowerCase()] ||
                    (order?.status || "Unknown")}
                </span>
              </div>
              <div className="small text-muted">
                Placed: {formatDateTime(order?.created_at)}
              </div>
            </div>

            <div className="card-body">
              {/* Items */}
              <h6 className="fw-600 mb-3">Items</h6>
              {items.length === 0 ? (
                <div className="text-muted small">No items found for this order.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {items.map((it, idx) => {
                    const title =
                      it?.product?.title || it?.title || it?.name || "Item";
                    const qty = it?.quantity || it?.qty || 1;
                    const price =
                      it?.price || it?.unit_price || it?.amount || 0;

                    return (
                      <div className="list-group-item" key={it?.id || idx}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="me-3">
                            <div className="fw-500">{title}</div>
                            <div className="text-muted small">Qty: {qty}</div>
                          </div>
                          <div className="fw-600">{formatCurrency(price)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Shipment (if any) */}
              {shipment ? (
                <>
                  <hr />
                  <h6 className="fw-600 mb-2">Shipment</h6>
                  <div className="small">
                    <div>
                      <span className="text-muted">Method: </span>
                      {shipment?.method || shipment?.carrier || "—"}
                    </div>
                    <div>
                      <span className="text-muted">Tracking #: </span>
                      {shipment?.tracking_number || "—"}
                    </div>
                    <div>
                      <span className="text-muted">Status: </span>
                      {shipment?.status || "—"}
                    </div>
                    {shipment?.updated_at && (
                      <div>
                        <span className="text-muted">Updated: </span>
                        {formatDateTime(shipment.updated_at)}
                      </div>
                    )}
                  </div>
                </>
              ) : null}

              {/* Address snapshot (if any) */}
              {address ? (
                <>
                  <hr />
                  <h6 className="fw-600 mb-2">Delivery Address</h6>
                  <div className="small">
                    {typeof address === "string" ? (
                      <div style={{ whiteSpace: "pre-wrap" }}>{address}</div>
                    ) : (
                      <>
                        <div>{address?.full_name || address?.name}</div>
                        <div>{address?.line1}</div>
                        {address?.line2 ? <div>{address?.line2}</div> : null}
                        <div>
                          {address?.city} {address?.province} {address?.postal_code}
                        </div>
                        <div>{address?.country}</div>
                        {address?.phone ? <div>Phone: {address.phone}</div> : null}
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Summary / Escrow / Actions */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header fw-600">Summary</div>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <strong>{formatCurrency(order?.subtotal ?? order?.items_total ?? 0)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping</span>
                <strong>{formatCurrency(order?.shipping_fee ?? 0)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Protection</span>
                <strong>{formatCurrency(order?.protection_fee ?? 0)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Total</span>
                <strong>{formatCurrency(order?.total ?? 0)}</strong>
              </div>

              {/* Escrow info */}
              {escrow ? (
                <div className="escrow-protected mt-3">
                  <i className="fa fa-shield" />
                  <div className="small">
                    <div className="fw-600">Escrow Protected</div>
                    <div className="text-muted">
                      Status: {escrow?.status || "held"}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="d-grid gap-2 mt-3">
                {canConfirmDelivery ? (
                  <button
                    className="btn btn-dark"
                    disabled={confirming}
                    onClick={confirmDelivery}
                  >
                    {confirming ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <>
                        <i className="fa fa-check me-2" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                ) : (
                  <button className="btn btn-dark" disabled>
                    Delivery Confirmed
                  </button>
                )}

                <Link className="btn btn-outline-dark" to="/escrow/disputes">
                  Open / View Disputes
                </Link>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => nav(-1)}
                  type="button"
                >
                  Back
                </button>
              </div>

              {order?.vendor?.id ? (
                <div className="small text-muted mt-3">
                  Sold by:{" "}
                  <Link to={`/vendors/${order.vendor.id}`}>
                    {order.vendor.shop_name || `Vendor #${order.vendor.id}`}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}