// components/Customer/CustomerReviews.js
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function Stars({ n }) {
  const v = Math.max(1, Math.min(5, Number(n)));
  return (
    <span className="text-warning">
      {"★".repeat(v)}{"☆".repeat(5 - v)}
    </span>
  );
}

export default function CustomerReviews() {
  const [me, setMe] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rMe = await api.get("/auth/me/");
        if (!mounted) return;
        setMe(rMe.data);
        // Pull latest ratings and filter by my customer_id client-side
        const r = await api.get("/ratings/?ordering=-created_at");
        const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        const mine = data.filter((x) => x.customer === rMe.data.customer_id);
        setRatings(mine);
      } catch {
        setErr("Failed to load reviews");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Reviews</h3>

      <div className="row g-3">
        {ratings.length ? (
          ratings.map((r) => (
            <div className="col-md-6" key={r.id}>
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold mb-0">{r.product?.title || `Product #${r.product}`}</h6>
                    <Stars n={r.rating} />
                  </div>
                  {r.review && <p className="text-muted small mb-2">{r.review}</p>}
                  <div className="small text-muted">{new Date(r.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted">
            <i className="fa fa-star fa-2x mb-2"></i>
            <p>You haven’t reviewed any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
