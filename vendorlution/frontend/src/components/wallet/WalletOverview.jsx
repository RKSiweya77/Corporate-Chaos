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

  const totals = useMemo(() => ({ total: (wallet.balance || 0) + (wallet.pending || 0) }), [wallet]);
  const isDark = useMemo(() => window.matchMedia?.("(prefers-color-scheme: dark)")?.matches, []);
  const styles = (
    <style>{`
      .dock-surface { color: var(--text-0); }
      :root { color-scheme: ${isDark ? "dark" : "light"}; }
      .panel { border:1px solid var(--border-0); border-radius:14px; background:var(--surface-1); box-shadow:0 10px 30px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04); }
      .panel-header { padding:.85rem 1rem; border-bottom:1px solid var(--border-0); font-weight:700; }
      .panel-body { padding:1rem; }
      .metric { background:var(--surface-0); border:1px solid var(--border-0); border-radius:12px; padding:16px; }
      .ghost { border:1px solid var(--border-0); background:var(--surface-1); color:var(--text-0); }
      .ghost:hover { background:color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }
    `}</style>
  );

  if (!isAuthenticated) {
    return (
      <div className="container py-5 dock-surface">
        {styles}
        <div className="panel">
          <div className="panel-header">Wallet</div>
          <div className="panel-body">
            <div className="alert alert-info mb-0">Please sign in to view your wallet.</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-4 dock-surface">
      {styles}
      {err ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{err}</span>
          <button type="button" className="btn-close" onClick={() => setErr("")} />
        </div>
      ) : null}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="panel h-100">
            <div className="panel-body d-flex flex-column">
              <div className="text-muted small">Available Balance</div>
              <div className="fs-3 fw-bold text-success">{ZAR(wallet.balance)}</div>
              <div className="mt-auto">
                <Link to="/wallet/deposit" className="btn btn-dark w-100">
                  <i className="fa fa-arrow-down me-2" />
                  Deposit
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="panel h-100">
            <div className="panel-body d-flex flex-column">
              <div className="text-muted small">In Escrow (Pending)</div>
              <div className="fs-3 fw-bold text-warning">{ZAR(wallet.pending)}</div>
              <div className="mt-auto">
                <Link to="/customer/orders" className="btn ghost w-100">
                  View Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="panel h-100">
            <div className="panel-body d-flex flex-column">
              <div className="text-muted small">Total Funds</div>
              <div className="fs-3 fw-bold text-primary">{ZAR(totals.total)}</div>
              <div className="mt-auto">
                <Link to="/wallet/withdraw" className="btn ghost w-100">
                  <i className="fa fa-arrow-up me-2" />
                  Withdraw
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header d-flex align-items-center justify-content-between">
          <span>Recent Transactions</span>
          <Link to="/wallet/transactions" className="btn btn-sm ghost">View all</Link>
        </div>
        <div className="panel-body">
          {recent.length === 0 ? (
            <EmptyState title="No transactions yet" subtitle="Your wallet activity will appear here." />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
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
                    const type = (t.entry_type || t.type || "").toLowerCase();
                    const creditLike = type.includes("credit") || type.includes("release");
                    return (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                        <td>{t.description || (creditLike ? "Credit" : "Debit")}</td>
                        <td><code>{t.reference || "-"}</code></td>
                        <td className={`text-end fw-bold ${creditLike ? "text-success" : "text-danger"}`}>
                          {creditLike ? "+" : "-"}{ZAR(Math.abs(amt))}
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
      <div style={{ height: 96 }} />
    </div>
  );
}