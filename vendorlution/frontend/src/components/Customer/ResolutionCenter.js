// components/Customer/ResolutionCenter.js
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ResolutionCenter() {
  const [cases, setCases] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ order: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [rCases, rOrders] = await Promise.all([
        api.get("/me/resolutions/"),
        api.get("/me/orders/"),
      ]);
      const casesData = Array.isArray(rCases.data) ? rCases.data : (rCases.data?.results || []);
      const ordersData = Array.isArray(rOrders.data) ? rOrders.data : (rOrders.data?.results || []);
      setCases(casesData);
      setOrders(ordersData);
    } catch {
      setErr("Failed to load resolution cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.order || !form.reason.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/me/resolutions/", { order: form.order, reason: form.reason });
      setForm({ order: "", reason: "" });
      await load();
      alert("Dispute opened.");
    } catch (e2) {
      alert(e2?.response?.data?.detail || "Failed to open dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s) => {
    const map = {
      open: "warning text-dark",
      in_progress: "info text-dark",
      resolved: "success",
      closed: "secondary",
      rejected: "danger",
    };
    const cls = map[s] || "secondary";
    return <span className={`badge bg-${cls}`}>{s.replace("_", " ")}</span>;
  };

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container mt-3">
      <h3 className="mb-3">Resolution Center</h3>

      {/* Open Case */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <h5>Open a Dispute</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-2">
                <label className="form-label">Order</label>
                <select
                  className="form-select"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  required
                >
                  <option value="">Select order…</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} • R {o.total_amount} • {new Date(o.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8 mb-2">
                <label className="form-label">Reason</label>
                <input
                  className="form-control"
                  placeholder="Describe the issue briefly"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                />
              </div>
            </div>
            <button className="btn btn-danger" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : (<><i className="fa fa-exclamation-circle me-2" /> Submit Dispute</>)}
            </button>
          </form>
        </div>
      </div>

      {/* Case History */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5>My Cases</h5>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Opened</th>
                  <th>Resolved</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {cases.length ? (
                  cases.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>#{c.order}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td>{new Date(c.created_at).toLocaleString()}</td>
                      <td>{c.resolved_at ? new Date(c.resolved_at).toLocaleString() : "—"}</td>
                      <td className="small">{c.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No dispute cases opened.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-2">
            <i className="fa fa-info-circle me-1"></i>
            Funds are held safely while a dispute is open and are released according to the case outcome.
          </p>
        </div>
      </div>
    </div>
  );
}
