// frontend/src/components/wallet/WalletOverview.jsx - COMPLETE VERSION
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function WalletOverview() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/wallet/");
        if (!alive) return;
        setWallet(res.data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || "Failed to load wallet");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  if (loading) return <div className="text-center py-4">Loading wallet...</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!wallet) return null;

  const balance = Number(wallet.balance || 0);
  const pending = Number(wallet.pending || 0);

  return (
    <div>
      {/* Balance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Available Balance</h6>
              <h2 className="text-success fw-bold mb-0">R {balance.toFixed(2)}</h2>
              <p className="text-muted small mt-2 mb-0">Ready to spend or withdraw</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Pending (Escrow)</h6>
              <h2 className="text-warning fw-bold mb-0">R {pending.toFixed(2)}</h2>
              <p className="text-muted small mt-2 mb-0">Held for active orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4">
        <Link to="/wallet/deposit" className="btn btn-success flex-fill">
          <i className="fa fa-plus me-2"></i>Deposit
        </Link>
        <Link to="/wallet/withdraw" className="btn btn-outline-dark flex-fill">
          <i className="fa fa-arrow-up me-2"></i>Withdraw
        </Link>
        <Link to="/wallet/transactions" className="btn btn-outline-secondary flex-fill">
          <i className="fa fa-list me-2"></i>History
        </Link>
      </div>

      {/* Recent Transactions */}
      <h5 className="mb-3">Recent Activity</h5>
      {wallet.recent?.length > 0 ? (
        <div className="list-group shadow-sm">
          {wallet.recent.map((tx) => {
            const amt = Number(tx.amount || 0);
            const isCredit = tx.entry_type === "CREDIT" || tx.entry_type === "credit";
            return (
              <div key={tx.id} className="list-group-item d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    <i className={`fa ${isCredit ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}`}></i>
                    {tx.description || tx.reference || "Transaction"}
                  </div>
                  <div className="small text-muted">
                    {new Date(tx.created_at).toLocaleString()} • Ref: {tx.reference || "—"}
                  </div>
                </div>
                <div className={`text-end ${isCredit ? 'text-success' : 'text-danger'}`}>
                  <div className="fw-bold">{isCredit ? '+' : '-'}R {Math.abs(amt).toFixed(2)}</div>
                  <div className="small text-muted">Balance: R {Number(tx.balance_after || 0).toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted py-4">
          <i className="fa fa-wallet fa-2x mb-2"></i>
          <p>No transactions yet. Make your first deposit to get started!</p>
        </div>
      )}

      {/* Info Box */}
      <div className="alert alert-info mt-4">
        <i className="fa fa-info-circle me-2"></i>
        <strong>How it works:</strong> Deposit funds instantly via Ozow (Instant EFT). 
        When you buy, funds are held securely until delivery is confirmed. 
        Sellers can withdraw earnings anytime (min R 10).
      </div>
    </div>
  );
}