// src/components/escrow/DisputeDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

function relative(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function DisputeDetail() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const disputeId = useMemo(() => Number(id), [id]);

  const load = async () => {
    setErr("");
    try {
      const res = await api.get(API_ENDPOINTS.disputes.detail(disputeId));
      setDispute(res.data);
    } catch (e) {
      setErr("Failed to load dispute details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!disputeId) {
      setErr("Invalid dispute id.");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  if (loading) return <LoadingSpinner fullPage />;

  if (err) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{err}</div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container py-4">
        <EmptyState title="Dispute not found" subtitle="Please check the link and try again." />
      </div>
    );
  }

  const order = dispute.order || dispute.order_snapshot || null;
  const evidence = dispute.evidence || dispute.attachments || [];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Dispute #{dispute.id}</h4>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => {
            setRefreshing(true);
            load();
          }}
          disabled={refreshing}
        >
          {refreshing ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="text-muted small">Status</div>
              <div className="badge bg-dark">{(dispute.status || "unknown").toUpperCase()}</div>
            </div>
            <div className="col-md-3">
              <div className="text-muted small">Reason</div>
              <div className="fw-500">{dispute.reason || dispute.reason_code || "—"}</div>
            </div>
            <div className="col-md-3">
              <div className="text-muted small">Opened</div>
              <div className="small">{formatDateTime(dispute.created_at) || "—"}</div>
            </div>
            <div className="col-md-3">
              <div className="text-muted small">Updated</div>
              <div className="small">{relative(dispute.updated_at)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order info */}
      <div className="card shadow-sm mb-3">
        <div className="card-header fw-600">Order</div>
        <div className="card-body">
          {order ? (
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-muted small">Order ID</div>
                <div className="fw-500">#{order.id || dispute.order_id || "—"}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Total</div>
                <div className="fw-500">
                  {formatCurrency(order.total || dispute.amount || 0)}
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Order Status</div>
                <div className="fw-500">{order.status || "—"}</div>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <Link to={`/orders/${order.id || dispute.order_id || ""}`} className="btn btn-outline-secondary btn-sm">
                  View order
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-muted small">No order snapshot was attached to this dispute.</div>
          )}
        </div>
      </div>

      {/* Evidence */}
      <div className="card shadow-sm mb-3">
        <div className="card-header fw-600">Evidence</div>
        <div className="card-body">
          {Array.isArray(evidence) && evidence.length > 0 ? (
            <div className="list-group list-group-flush">
              {evidence.map((ev, idx) => (
                <div key={idx} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div className="small">
                      {ev.note || ev.caption || "Attachment"}
                      {" "}
                      <span className="text-muted">• {formatDateTime(ev.created_at) || ""}</span>
                    </div>
                    {ev.url || ev.file ? (
                      <a
                        href={ev.url || ev.file}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-link text-decoration-none"
                      >
                        Open
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted small">No evidence uploaded.</div>
          )}
        </div>
      </div>

      {/* Resolution */}
      <div className="card shadow-sm">
        <div className="card-header fw-600">Resolution</div>
        <div className="card-body">
          {dispute.resolution ? (
            <>
              <div className="mb-2">
                <div className="text-muted small">Outcome</div>
                <div className="fw-500">{dispute.resolution.outcome || "—"}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted small">Note</div>
                <div className="small">{dispute.resolution.note || "—"}</div>
              </div>
              <div className="mb-2">
                <div className="text-muted small">Resolved At</div>
                <div className="small">{formatDateTime(dispute.resolution.resolved_at) || "—"}</div>
              </div>
            </>
          ) : (
            <div className="text-muted small">
              This dispute is not resolved yet. You’ll be notified when an admin makes a decision.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}