// src/components/escrow/DisputeCenter.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { ZAR, relativeTime } from "../../utils/formatters";

export default function DisputeCenter({ orderId: propOrderId }) {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const orderId = propOrderId || params.orderId || params.id;

  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    reason: "not_received",
    message: "",
    attachments: []
  });

  const hasOrder = useMemo(() => Boolean(orderId), [orderId]);

  // Load disputes
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadDisputes() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(API_ENDPOINTS.disputes.list);
        if (!isMounted) return;
        
        const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setDisputes(items);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.detail || "Failed to load disputes.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDisputes();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleFormChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const submitDispute = async (e) => {
    e.preventDefault();
    if (!hasOrder || !form.message.trim()) return;

    try {
      setCreating(true);
      setError("");
      const payload = {
        reason: form.reason,
        message: form.message.trim(),
        order: orderId
      };

      const res = await api.post(API_ENDPOINTS.disputes.create, payload);
      setDisputes(prev => [res.data, ...prev]);
      setForm({ reason: "not_received", message: "", attachments: [] });
      
      // Show success message
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to open dispute. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: "warning",
      under_review: "info",
      resolved: "success",
      rejected: "danger",
      closed: "secondary"
    };
    return statusMap[status?.toLowerCase()] || "secondary";
  };

  const getReasonText = (reason) => {
    const reasonMap = {
      not_received: "Item not received",
      not_as_described: "Not as described",
      wrong_item: "Wrong item sent",
      damaged: "Item damaged",
      quality_issue: "Quality issues",
      other: "Other issue"
    };
    return reasonMap[reason] || reason || "Not specified";
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <i className="fa fa-info-circle me-2" />
          Please sign in to access dispute center.
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Open Dispute Form */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex align-items-center">
              <i className="fa fa-flag text-warning me-2" />
              <h5 className="mb-0 fw-bold">Open a Dispute</h5>
            </div>
            <div className="card-body">
              {!hasOrder ? (
                <div className="alert alert-warning">
                  <i className="fa fa-exclamation-triangle me-2" />
                  Please open a dispute from an order page so we can link it to the correct transaction.
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="fa fa-info-circle me-2" />
                  Opening a dispute will freeze the escrow funds until the issue is resolved.
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="fa fa-exclamation-circle me-2" />
                  <span className="flex-grow-1">{error}</span>
                  <button 
                    className="btn-close" 
                    onClick={() => setError("")}
                    aria-label="Close"
                  />
                </div>
              )}

              <form onSubmit={submitDispute}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Reason for Dispute</label>
                  <select
                    className="form-select"
                    value={form.reason}
                    onChange={(e) => handleFormChange('reason', e.target.value)}
                    disabled={!hasOrder || creating}
                    required
                  >
                    <option value="not_received">Item not received</option>
                    <option value="not_as_described">Not as described / Different item</option>
                    <option value="damaged">Item arrived damaged</option>
                    <option value="quality_issue">Quality issues</option>
                    <option value="wrong_item">Wrong item sent</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Detailed Explanation
                    <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Please provide a detailed description of the issue. Include any relevant information that will help us resolve this dispute quickly."
                    value={form.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    disabled={!hasOrder || creating}
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                  <div className="form-text">
                    {form.message.length}/1000 characters. Be as detailed as possible - this helps us resolve your dispute faster.
                  </div>
                </div>

                <div className="d-grid">
                  <button 
                    className="btn btn-warning btn-lg" 
                    type="submit" 
                    disabled={!hasOrder || creating || !form.message.trim()}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Opening Dispute...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-flag me-2" />
                        Open Dispute
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer bg-light">
              <div className="small text-muted">
                <i className="fa fa-clock me-1" />
                Our support team typically reviews disputes within 1-2 business days. 
                You'll be notified via email when there's an update.
              </div>
            </div>
          </div>
        </div>

        {/* Disputes List */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center">
              <i className="fa fa-list text-primary me-2" />
              <h5 className="mb-0 fw-bold">My Disputes</h5>
              {disputes.length > 0 && (
                <span className="badge bg-primary ms-2">{disputes.length}</span>
              )}
            </div>
            
            <div className="card-body p-0">
              {disputes.length === 0 ? (
                <EmptyState
                  icon="fa-flag"
                  title="No disputes yet"
                  subtitle="When you open a dispute, it will appear here with its current status and details."
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="ps-3">Dispute ID</th>
                        <th scope="col">Order</th>
                        <th scope="col">Reason</th>
                        <th scope="col">Status</th>
                        <th scope="col">Opened</th>
                        <th scope="col" className="pe-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputes.map((dispute) => (
                        <tr key={dispute.id}>
                          <td className="ps-3">
                            <code className="small">#{dispute.id}</code>
                          </td>
                          <td>
                            <Link 
                              to={`/orders/${dispute.order || dispute.order_id}`}
                              className="text-decoration-none"
                            >
                              Order #{dispute.order || dispute.order_id}
                            </Link>
                          </td>
                          <td className="small">
                            {getReasonText(dispute.reason || dispute.reason_code)}
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(dispute.status)} text-capitalize`}>
                              {dispute.status || 'open'}
                            </span>
                          </td>
                          <td className="small text-muted">
                            {relativeTime(dispute.created_at)}
                          </td>
                          <td className="pe-3">
                            <Link
                              to={`/disputes/${dispute.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {disputes.length > 0 && (
              <div className="card-footer bg-light">
                <div className="small text-muted">
                  <i className="fa fa-eye me-1" />
                  Click "View" to see dispute details and add additional information.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}