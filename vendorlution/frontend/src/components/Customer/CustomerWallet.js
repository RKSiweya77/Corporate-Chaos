import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CustomerWallet() {
  const [wallet, setWallet] = useState(null);
  const [tx, setTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const w = await api.get("/me/wallet?type=customer");
        if (!alive) return;
        setWallet(w.data);
        const t = await api.get(`/transactions/?wallet_id=${w.data.id}`);
        const list = Array.isArray(t.data) ? t.data : t.data?.results || [];
        setTx(list);
      } catch (e) {
        setErr("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Wallet</h3>
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body text-center">
          <h5 className="fw-bold">Available Balance</h5>
          <h3 className="text-success">R {Number(wallet?.balance || 0).toFixed(2)}</h3>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <a href="/customer/payment-methods" className="btn btn-dark">
              Deposit / Methods
            </a>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Transaction History</h5>
      <div className="list-group shadow-sm">
        {tx.length === 0 ? (
          <div className="list-group-item text-muted">No transactions yet.</div>
        ) : (
          tx.map((r) => (
            <div
              key={r.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <i
                  className={`fa me-2 ${
                    Number(r.amount) >= 0
                      ? "fa-arrow-down text-success"
                      : "fa-arrow-up text-danger"
                  }`}
                ></i>
                {r.type || "Tx"} • {r.description || r.reference || "-"}
              </span>
              <span className={Number(r.amount) >= 0 ? "text-success" : "text-danger"}>
                {Number(r.amount) >= 0 ? "+" : "-"}R {Math.abs(Number(r.amount)).toFixed(2)}
              </span>
              <small className="text-muted">
                {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
