import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/wallet/transactions/");
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        if (!alive) return;
        setItems(list);
      } catch (e) {
        setErr("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  if (loading) return <div>Loading…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  if (!items.length) return <div className="text-muted">No transactions yet.</div>;

  return (
    <div>
      <h5 className="mb-3">Transaction History</h5>
      <div className="list-group">
        {items.map((t) => {
          const amt = Number(t.amount || 0);
          const positive = t.entry_type === "credit" || amt > 0;
          return (
            <div key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">
                  {t.reason || t.reference || t.entry_type || "Transaction"}
                </div>
                <div className="small text-muted">
                  {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                  {t.metadata && Object.keys(t.metadata).length ? (
                    <span className="ms-2">• {JSON.stringify(t.metadata)}</span>
                  ) : null}
                </div>
              </div>
              <div className={positive ? "text-success" : "text-danger"}>
                {positive ? "+" : "-"}R {Math.abs(amt).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
