import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { ZAR } from "../../utils/formatters";

export default function TransactionHistory() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.wallet.transactions);
        const list = Array.isArray(res.data?.results) ? res.data.results : res.data || [];
        setRows(list);
      } catch (error) {
        setErr(error?.response?.data?.detail || "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const f = (filter || "all").toLowerCase();
    return (rows || []).filter((r) => {
      const type = (r.entry_type || r.type || "").toLowerCase();
      if (f !== "all" && !type.includes(f)) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        String(r.description || "").toLowerCase().includes(q) ||
        String(r.reference || "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const isDark = useMemo(() => window.matchMedia?.("(prefers-color-scheme: dark)")?.matches, []);
  const styles = (
    <style>{`
      .dock-surface { color: var(--text-0); }
      :root { color-scheme: ${isDark ? "dark" : "light"}; }
      .panel { border:1px solid var(--border-0); border-radius:14px; background:var(--surface-1); box-shadow:0 10px 30px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04); }
      .panel-header { padding:.85rem 1rem; border-bottom:1px solid var(--border-0); font-weight:700; }
      .panel-body { padding:1rem; }
      .ghost { border:1px solid var(--border-0); background:var(--surface-1); color:var(--text-0); }
      .ghost:hover { background:color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }
    `}</style>
  );

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

      <div className="panel mb-3">
        <div className="panel-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <h4 className="fw-bold mb-0">Transaction History</h4>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              style={{ maxWidth: 180 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
              <option value="hold">Holds</option>
              <option value="release">Releases</option>
            </select>
            <input
              className="form-control"
              style={{ maxWidth: 260 }}
              placeholder="Search description/ref"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel">
          <div className="panel-body">
            <EmptyState title="No matching transactions" subtitle="Try changing filters or clear your search." />
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const type = (t.entry_type || t.type || "").toUpperCase();
                    const amt = Number(t.amount || 0);
                    const creditLike = ["CREDIT", "RELEASE"].includes(type);
                    return (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleString()}</td>
                        <td className="text-capitalize">{type.toLowerCase()}</td>
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
          </div>
        </div>
      )}
      <div style={{ height: 96 }} />
    </div>
  );
}