import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErr("");
    api
      .get("/orders/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setOrder(list.find((o) => String(o.id) === String(id)) || null);
      })
      .catch(() => setErr("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;
  if (!order) return <div className="container py-4">Order not found.</div>;

  const total = Number(order.total_amount || 0).toFixed(2);

  return (
    <div className="container py-5">
      <Link to="/customer/orders" className="btn btn-sm btn-outline-dark mb-3">
        <i className="fa fa-arrow-left me-1"></i> Back to Orders
      </Link>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Order #{order.id}</h4>
          <div className="small text-muted mb-3">
            {new Date(order.created_at).toLocaleString()}
          </div>

          <h6 className="fw-bold">Items</h6>
          <ul className="list-group mb-3">
            {(order.items || []).map((it) => (
              <li key={it.id} className="list-group-item d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{it.product?.title}</div>
                  <div className="small text-muted">
                    {it.quantity} × R {Number(it.price_snapshot || it.product?.price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="fw-semibold">
                  R {(
                    (Number(it.price_snapshot || it.product?.price || 0) || 0) * (it.quantity || 0)
                  ).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="d-flex justify-content-between">
            <div>Status: <span className="badge bg-secondary">{order.status || "—"}</span></div>
            <div className="fw-bold">Total: R {total}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
