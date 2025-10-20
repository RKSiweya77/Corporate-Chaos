// src/components/buyer/Profile.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { formatDateTime } from "../../utils/formatters";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addrLoading, setAddrLoading] = useState(true);
  const [error, setError] = useState("");

  const roles = useMemo(() => {
    const r = me?.roles || me?.user?.roles || [];
    return Array.isArray(r) ? r : [];
  }, [me]);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(API_ENDPOINTS.auth.me);
        setMe(res.data);
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    const fetchAddresses = async () => {
      setAddrLoading(true);
      try {
        const res = await api.get(API_ENDPOINTS.addresses.list);
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setAddresses(list);
      } finally {
        setAddrLoading(false);
      }
    };
    fetchMe();
    fetchAddresses();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="container py-4">
        <EmptyState title="Not signed in" subtitle="Please log in to view your profile." />
      </div>
    );
  }

  const userObj = me.user || me;
  const firstName = userObj.first_name || userObj.firstName || "";
  const lastName = userObj.last_name || userObj.lastName || "";
  const email = userObj.email || "";
  const username = userObj.username || "";
  const dateJoined = userObj.date_joined || userObj.joined_at || me.created_at || null;
  const vendorId = me.vendor_id ?? me.vendorId ?? null;
  const customerId = me.customer_id ?? me.customerId ?? null;

  return (
    <div className="container py-4 profile-wrap">
      <style>{`
        .profile-wrap { color: var(--text-0); }
        .muted { color: var(--text-1); }
        .panel {
          border: 1px solid var(--border-0);
          border-radius: 14px;
          background: var(--surface-1);
          box-shadow: 0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
          overflow: hidden;
        }
        .panel-hd {
          display:flex; align-items:center; justify-content:space-between;
          padding:.85rem 1rem; border-bottom:1px solid var(--border-0);
          color: var(--text-0); background: var(--surface-1);
        }
        .panel-bd { padding: 1rem; }
        .pill, .chip {
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.3rem .6rem; border-radius:999px; font-size:.8rem;
          border:1px solid var(--border-0); background: var(--surface-1); color: var(--text-0);
        }
        .btn-ghost {
          border:1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
          border-radius: 10px;
        }
        .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }
        .addr {
          border: 1px dashed var(--border-0);
          background: var(--surface-0);
          border-radius: 12px;
        }
        .page-title { color: var(--text-0); letter-spacing:.2px; }
      `}</style>

      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <div>
          <h4 className="fw-bold page-title mb-1">
            <i className="fa fa-user me-2" /> My Profile
          </h4>
          <div className="small muted">Manage your account details, addresses and wallet settings.</div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/settings" className="btn btn-ghost">
            <i className="fa fa-gear me-2" />
            App Settings
          </Link>
          <Link to="/wallet" className="btn btn-primary">
            <i className="fa fa-wallet me-2" />
            Open Wallet
          </Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="panel">
            <div className="panel-hd">
              <div className="fw-600">
                <i className="fa fa-id-card-clip me-2" />
                Account
              </div>
            </div>
            <div className="panel-bd">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="muted small">Full name</div>
                  <div className="fw-500">
                    {(firstName || lastName) ? `${firstName} ${lastName}`.trim() : "—"}
                  </div>
                </div>
                <span className="pill">
                  <i className="fa fa-user-shield" />
                  {roles.length ? roles.join(", ") : "buyer"}
                </span>
              </div>

              <div className="mb-3">
                <div className="muted small">Email</div>
                <div className="fw-500">{email || "—"}</div>
              </div>

              <div className="mb-3">
                <div className="muted small">Username</div>
                <div className="fw-500">{username || "—"}</div>
              </div>

              <div className="mb-3">
                <div className="muted small">Joined</div>
                <div className="fw-500">{dateJoined ? formatDateTime(dateJoined) : "—"}</div>
              </div>

              <hr className="opacity-25" style={{ borderColor: "var(--border-0)" }} />

              <div className="d-flex gap-2">
                <button className="btn btn-ghost" type="button" disabled>
                  <i className="fa fa-pen me-2" />
                  Edit Profile (soon)
                </button>
                <button className="btn btn-outline-secondary" type="button" disabled>
                  <i className="fa fa-key me-2" />
                  Change Password (soon)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="panel">
            <div className="panel-hd">
              <div className="fw-600">
                <i className="fa fa-link me-2" />
                Account Links
              </div>
            </div>
            <div className="panel-bd">
              <div className="mb-3 d-flex justify-content-between">
                <div>
                  <div className="muted small">Customer ID</div>
                  <div className="fw-500">{customerId ?? "—"}</div>
                </div>
                {customerId ? (
                  <span className="chip">
                    <i className="fa fa-circle-check text-success" />
                    Active
                  </span>
                ) : null}
              </div>

              <div className="mb-3 d-flex justify-content-between">
                <div>
                  <div className="muted small">Vendor ID</div>
                  <div className="fw-500">{vendorId ?? "—"}</div>
                </div>
                {vendorId ? (
                  <span className="chip">
                    <i className="fa fa-store text-info" />
                    Vendor
                  </span>
                ) : (
                  <span className="pill">
                    <i className="fa fa-plus" />
                    Open a shop
                  </span>
                )}
              </div>

              <hr className="opacity-25" style={{ borderColor: "var(--border-0)" }} />

              <div className="small muted">
                Your account supports unified wallets and escrow protection. Head to your{" "}
                <Link to="/wallet" className="text-decoration-none">Wallet</Link> to manage deposits and withdrawals.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="panel">
            <div className="panel-hd">
              <div className="fw-600">
                <i className="fa fa-location-dot me-2" />
                Saved Addresses
              </div>
              <button className="btn btn-ghost btn-sm" type="button" disabled>
                <i className="fa fa-plus me-2" />
                Add Address (soon)
              </button>
            </div>
            <div className="panel-bd">
              {addrLoading ? (
                <LoadingSpinner />
              ) : addresses.length === 0 ? (
                <EmptyState
                  title="No addresses yet"
                  subtitle="Add your delivery address at checkout or from your account later."
                />
              ) : (
                <div className="row g-3">
                  {addresses.map((a) => (
                    <div className="col-md-6" key={a.id}>
                      <div className="addr p-3 h-100">
                        <div className="fw-600 mb-1">{a.full_name || a.name || "Address"}</div>
                        <div className="small">
                          {a.line1}
                          {a.line2 ? <><br />{a.line2}</> : null}
                          <br />
                          {a.city} {a.province} {a.postal_code}
                          <br />
                          {a.country}
                          {a.phone ? (
                            <>
                              <br />Phone: {a.phone}
                            </>
                          ) : null}
                        </div>
                        {a.is_default ? <span className="badge bg-primary mt-2">Default</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 96 }} />
    </div>
  );
}