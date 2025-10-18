// src/components/buyer/Profile.jsx
import { useEffect, useState, useMemo } from "react";
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
      } catch (e) {
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
      } catch (e) {
        // non-fatal
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
        <EmptyState
          title="Not signed in"
          subtitle="Please log in to view your profile."
        />
      </div>
    );
  }

  // Try to normalize some typical fields from a /auth/me/ response
  const userObj = me.user || me;
  const firstName = userObj.first_name || userObj.firstName || "";
  const lastName = userObj.last_name || userObj.lastName || "";
  const email = userObj.email || "";
  const username = userObj.username || "";
  const dateJoined =
    userObj.date_joined || userObj.joined_at || me.created_at || null;

  const vendorId = me.vendor_id ?? me.vendorId ?? null;
  const customerId = me.customer_id ?? me.customerId ?? null;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">My Profile</h4>

      <div className="row g-3">
        {/* Basic Info */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header fw-600">Account</div>
            <div className="card-body">
              <div className="mb-2">
                <div className="text-muted small">Full name</div>
                <div className="fw-500">
                  {(firstName || lastName) ? `${firstName} ${lastName}`.trim() : "—"}
                </div>
              </div>

              <div className="mb-2">
                <div className="text-muted small">Email</div>
                <div className="fw-500">{email || "—"}</div>
              </div>

              <div className="mb-2">
                <div className="text-muted small">Username</div>
                <div className="fw-500">{username || "—"}</div>
              </div>

              <div className="mb-2">
                <div className="text-muted small">Roles</div>
                <div className="fw-500">
                  {roles.length ? roles.join(", ") : "buyer"}
                </div>
              </div>

              <div className="mb-2">
                <div className="text-muted small">Joined</div>
                <div className="fw-500">
                  {dateJoined ? formatDateTime(dateJoined) : "—"}
                </div>
              </div>

              <hr />

              <div className="d-flex gap-2">
                <button className="btn btn-outline-dark" type="button" disabled>
                  Edit Profile (coming soon)
                </button>
                <button className="btn btn-outline-secondary" type="button" disabled>
                  Change Password (coming soon)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* IDs / Links */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header fw-600">Account Links</div>
            <div className="card-body">
              <div className="mb-2">
                <div className="text-muted small">Customer ID</div>
                <div className="fw-500">{customerId ?? "—"}</div>
              </div>

              <div className="mb-2">
                <div className="text-muted small">Vendor ID</div>
                <div className="fw-500">{vendorId ?? "—"}</div>
              </div>

              <hr />

              <div className="small text-muted">
                Your account supports unified wallets and escrow protection on
                purchases. Head to your{" "}
                <a href="/wallet" className="text-decoration-none">Wallet</a>{" "}
                to manage deposits and withdrawals.
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="fw-600">Saved Addresses</div>
              <button className="btn btn-sm btn-outline-dark" type="button" disabled>
                Add Address (coming soon)
              </button>
            </div>
            <div className="card-body">
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
                      <div className="border rounded p-3 h-100">
                        <div className="fw-600 mb-1">
                          {a.full_name || a.name || "Address"}
                        </div>
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
                        {a.is_default ? (
                          <span className="badge bg-dark mt-2">Default</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}