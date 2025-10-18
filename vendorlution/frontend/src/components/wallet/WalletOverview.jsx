// src/components/wallet/WalletOverview.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { ZAR } from "../../utils/formatters";

export default function WalletOverview() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [wallet, setWallet] = useState({ balance: 0, pending: 0, currency: "ZAR", recent: [] });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        setLoading(true);
        const w = await api.get(API_ENDPOINTS.wallet.me);
        const data = w.data || {};
        
        setWallet({
          balance: Number(data.balance || 0),
          pending: Number(data.pending || 0),
          currency: data.currency || "ZAR",
          recent: Array.isArray(data.recent) ? data.recent : [],
        });

        if (Array.isArray(data.recent) && data.recent.length) {
          setRecent(data.recent);
        } else {
          try {
            const t = await api.get(API_ENDPOINTS.wallet.transactions);
            const rows = Array.isArray(t.data?.results) ? t.data.results : t.data || [];
            setRecent(rows.slice(0, 5));
          } catch {
            setRecent([]);
          }
        }
      } catch (e) {
        const msg = e?.response?.data?.detail || "Failed to load wallet.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated]);

  const totals = useMemo(() => {
    const total = (wallet.balance || 0) + (wallet.pending || 0);
    return { total };
  }, [wallet]);

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Please sign in to view your wallet.</div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-5">
      {err && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{err}</span>
          <button className="btn-close" onClick={() => setErr("")} />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Available Balance</div>
              <div className="fs-3 fw-bold text-success">{ZAR(wallet.balance)}</div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/wallet/deposit" className="btn btn-dark w-100">
                <i className="fa fa-arrow-down me-2" />
                Deposit
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">In Escrow (Pending)</div>
              <div className="fs-3 fw-bold text-warning">{ZAR(wallet.pending)}</div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/customer/orders" className="btn btn-outline-dark w-100">
                View Orders
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Funds (Balance + Escrow)</div>
              <div className="fs-3 fw-bold text-primary">{ZAR(totals.total)}</div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/wallet/withdraw" className="btn btn-outline-dark w-100">
                <i className="fa fa-arrow-up me-2" />
                Withdraw
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header d-flex align-items-center justify-content-between bg-white">
          <span className="fw-bold">Recent Transactions</span>
          <Link to="/wallet/transactions" className="btn btn-sm btn-outline-dark">
            View all
          </Link>
        </div>
        <div className="card-body">
          {recent.length === 0 ? (
            <EmptyState 
              title="No transactions yet" 
              subtitle="Your wallet activity will show here." 
            />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => {
                    const amt = Number(t.amount || 0);
                    const isCredit = (t.entry_type || t.type || "").toLowerCase().includes("credit");
                    return (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                        <td>{t.description || (isCredit ? "Credit" : "Debit")}</td>
                        <td><code>{t.reference || "-"}</code></td>
                        <td className={`text-end fw-bold ${isCredit ? "text-success" : "text-danger"}`}>
                          {isCredit ? "+" : "-"}{ZAR(Math.abs(amt))}
                        </td>
                        <td className="text-end fw-medium">{ZAR(t.balance_after || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}