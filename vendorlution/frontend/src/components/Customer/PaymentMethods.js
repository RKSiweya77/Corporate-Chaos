import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr("");
    api
      .get("/me/payment-methods/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setMethods(list);
      })
      .catch(() => setErr("Failed to load payment methods"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-5">
      <h3 className="mb-4">Payment Methods</h3>

      <div className="card shadow-sm border-0">
        <div className="list-group list-group-flush">
          {methods.length === 0 ? (
            <div className="list-group-item text-muted">No saved methods.</div>
          ) : (
            methods.map((m) => (
              <div key={m.id} className="list-group-item d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{m.brand || "Method"}</div>
                  <div className="small text-muted">
                    {m.last4 ? `•••• ${m.last4}` : m.account_label || ""}
                  </div>
                </div>
                <div className="small text-muted">{m.created_at?.slice(0, 10)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-muted small mt-3">
        Deposits, Instant EFT and withdrawals can be added later as real providers are integrated.
      </p>
    </div>
  );
}
