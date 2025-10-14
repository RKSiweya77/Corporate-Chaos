import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr("");
    api
      .get("/orders/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setOrders(list);
      })
      .catch(() => setErr("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const map = {
      completed: "success",
      cancelled: "danger",
      processing: "warning text-dark",
      pending: "info text-dark",
    };
    const cls = map[String(s || "").toLowerCase()] || "secondary";
    return <span className={`badge bg-${cls}`}>{s || "—"}</span>;
    };

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-5">
      <h3 className="mb-4">My Orders</h3>

      {orders.length ? (
        <div className="row g-4">
          {orders.map((o) => (
            <div key={o.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <h6 className="fw-bold">Order #{o.id}</h6>
                  <div className="small text-muted mb-2">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                  <div className="mb-2">{statusBadge(o.status)}</div>
                  <div className="fw-semibold mb-3">Total: R {Number(o.total_amount || 0).toFixed(2)}</div>
                  <ul className="small flex-grow-1">
                    {(o.items || []).slice(0, 3).map((it) => (
                      <li key={it.id}>
                        {it.quantity} × {it.product?.title}
                      </li>
                    ))}
                    {o.items?.length > 3 && <li>…</li>}
                  </ul>
                  <div className="mt-auto d-flex justify-content-between">
                    <Link to={`/customer/orders/${o.id}`} className="btn btn-sm btn-outline-dark">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="fa fa-box-open fa-2x mb-2"></i>
          <p>No orders found.</p>
        </div>
      )}
    </div>
  );
}
