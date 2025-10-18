// src/components/vendor/VendorProfile.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { formatDateTime } from "../../utils/formatters";
import { Link } from "react-router-dom";

export default function VendorProfile() {
  const [me, setMe] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [bank, setBank] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
    branch_code: "",
  });
  const [loading, setLoading] = useState(true);
  const [bankLoading, setBankLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bankMsg, setBankMsg] = useState("");

  const vendorId = useMemo(() => {
    if (!me) return null;
    return me.vendor_id ?? me.vendorId ?? null;
  }, [me]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.auth.me);
        setMe(res.data);
      } catch (e) {
        setError("Failed to load your account.");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    const fetchVendor = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.vendors.detail(vendorId));
        setVendor(res.data);
      } catch (e) {
        // non-fatal – user might have vendorId but vendor not fully set up
      }
    };
    fetchVendor();
  }, [vendorId]);

  useEffect(() => {
    // Banking profile (GET)
    const fetchBank = async () => {
      setBankLoading(true);
      setBankMsg("");
      try {
        const res = await api.get(API_ENDPOINTS.wallet.vendorProfile);
        // Some backends return {account_name,...}; others nest it. Try both:
        const data = res.data?.bank || res.data || {};
        setBank({
          account_name: data.account_name || "",
          account_number: data.account_number || "",
          bank_name: data.bank_name || "",
          branch_code: data.branch_code || "",
        });
      } catch (_e) {
        // 404 or empty is fine – show empty form
      } finally {
        setBankLoading(false);
      }
    };
    fetchBank();
  }, []);

  const onSaveBank = async (e) => {
    e.preventDefault();
    setSaving(true);
    setBankMsg("");
    try {
      await api.put(API_ENDPOINTS.wallet.vendorProfile, bank);
      setBankMsg("Banking details saved.");
    } catch (e) {
      setBankMsg("Failed to save banking details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // No vendor profile yet – prompt to create shop
  if (!vendorId) {
    return (
      <div className="container py-4">
        <EmptyState
          title="No shop yet"
          subtitle="Create your vendor shop to start selling."
          icon="fa-store"
        />
        <Link to="/vendor/create-shop" className="btn btn-dark mt-3">
          Create Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">Vendor Profile</h4>

      <div className="row g-3">
        {/* Shop card */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header fw-600">Shop</div>
            <div className="card-body">
              {!vendor ? (
                <div className="text-muted small">
                  We couldn’t load your shop details just yet.
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <div className="text-muted small">Shop Name</div>
                    <div className="fw-500">
                      {vendor.shop_name || vendor.name || "—"}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="text-muted small">Description</div>
                    <div className="small">
                      {vendor.description || "—"}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="text-muted small">Address</div>
                    <div className="small">
                      {vendor.address || "—"}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="text-muted small">Created</div>
                    <div className="small">
                      {vendor.created_at ? formatDateTime(vendor.created_at) : "—"}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Link to="/vendor/products" className="btn btn-outline-dark btn-sm">
                      Manage Products
                    </Link>
                    <Link to="/vendor/orders" className="btn btn-outline-secondary btn-sm">
                      View Orders
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Banking details */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header fw-600">Banking Details (Payouts)</div>
            <div className="card-body">
              {bankLoading ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={onSaveBank}>
                  <div className="mb-3">
                    <label className="form-label">Account Name</label>
                    <input
                      className="form-control"
                      value={bank.account_name}
                      onChange={(e) =>
                        setBank((b) => ({ ...b, account_name: e.target.value }))
                      }
                      placeholder="e.g. J Doe"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Account Number</label>
                    <input
                      className="form-control"
                      value={bank.account_number}
                      onChange={(e) =>
                        setBank((b) => ({ ...b, account_number: e.target.value }))
                      }
                      placeholder="e.g. 1234567890"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bank Name</label>
                    <input
                      className="form-control"
                      value={bank.bank_name}
                      onChange={(e) =>
                        setBank((b) => ({ ...b, bank_name: e.target.value }))
                      }
                      placeholder="e.g. FNB / Standard Bank"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Branch Code</label>
                    <input
                      className="form-control"
                      value={bank.branch_code}
                      onChange={(e) =>
                        setBank((b) => ({ ...b, branch_code: e.target.value }))
                      }
                      placeholder="e.g. 250655"
                    />
                  </div>

                  {bankMsg && (
                    <div
                      className={`alert ${
                        bankMsg.includes("Failed") ? "alert-danger" : "alert-success"
                      } py-2`}
                    >
                      {bankMsg}
                    </div>
                  )}

                  <button className="btn btn-dark" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving…
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header fw-600">Tips</div>
            <div className="card-body small text-muted">
              • Ensure your banking details are correct to avoid payout delays. <br />
              • You can view escrow and available funds from the{" "}
              <Link to="/wallet" className="text-decoration-none">Wallet</Link> page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}