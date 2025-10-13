// src/pages/vendor/VendorDashboard.js
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Row({ label, children }) {
  return (
    <div className="row mb-2">
      <div className="col-4 text-muted">{label}</div>
      <div className="col-8">{children}</div>
    </div>
  );
}

export default function VendorDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);           // { user, roles[], vendor_id, ...}
  const [vendor, setVendor] = useState(null);   // vendor profile payload
  const [error, setError] = useState("");

  // Convenience booleans
  const isVendor = useMemo(
    () => !!(me && (me.vendor_id || (me.roles || []).includes("vendor"))),
    [me]
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // 1) Who am I?
        const meRes = await api.get("/auth/me/");
        if (!alive) return;
        setMe(meRes.data);

        const vid = meRes.data.vendor_id;

        if (!vid) {
          // No shop yet → gently push to create flow
          setLoading(false);
          return;
        }

        // 2) Fetch my vendor profile (detail view)
        const vRes = await api.get(`/vendors/${vid}/`);
        if (!alive) return;
        setVendor(vRes.data);
        setLoading(false);
      } catch (err) {
        if (!alive) return;
        console.error(err);
        setError("Failed to load shop data.");
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // CTA if user is authenticated but has no vendor profile yet
  if (!loading && me && !isVendor) {
    return (
      <div className="container py-4">
        <div className="alert alert-info d-flex align-items-center">
          <i className="fa fa-circle-info me-2"></i>
          You don’t have a shop yet.
        </div>
        <button
          className="btn btn-dark"
          onClick={() => nav("/vendor/create")}
        >
          <i className="fa fa-store me-2" /> Create your shop
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {loading && <div className="text-muted">Loading shop data...</div>}
      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && vendor && (
        <>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="m-0">
              <i className="fa fa-store me-2" />
              {vendor.shop_name || "My Shop"}
            </h3>
            <div className="d-flex gap-2">
              <Link to="/vendor/edit" className="btn btn-outline-secondary">
                <i className="fa fa-pen-to-square me-1" />
                Edit profile
              </Link>
              <Link to="/vendor/add-product" className="btn btn-dark">
                <i className="fa fa-plus-circle me-1" />
                Link product
              </Link>
            </div>
          </div>

          {/* Banner */}
          {vendor.banner && (
            <div className="mb-3">
              <img
                src={vendor.banner}
                alt="Banner"
                className="img-fluid rounded"
                style={{ maxHeight: 220, objectFit: "cover", width: "100%" }}
              />
            </div>
          )}

          <div className="row g-3">
            {/* Left column: profile overview */}
            <div className="col-lg-7">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    {vendor.logo && (
                      <img
                        src={vendor.logo}
                        alt="Logo"
                        className="rounded me-3"
                        width={72}
                        height={72}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <div>
                      <h5 className="mb-1">{vendor.shop_name}</h5>
                      <div className="text-muted small">
                        Rating: {vendor.rating_avg?.toFixed?.(1) ?? "0.0"}
                      </div>
                    </div>
                  </div>

                  <Row label="About">
                    {vendor.description || <span className="text-muted">—</span>}
                  </Row>
                  <Row label="Address">
                    {vendor.address || <span className="text-muted">—</span>}
                  </Row>
                  <Row label="Status">
                    {vendor.is_active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </Row>
                  <Row label="Share">
                    {(() => {
                      const url =
                        vendor.slug
                          ? `${window.location.origin}/vendors/${vendor.slug}`
                          : `${window.location.origin}/vendors/${vendor.id}`;
                      return (
                        <div className="d-flex align-items-center">
                          <code className="me-2">{url}</code>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                            }}
                          >
                            Copy
                          </button>
                          <a
                            href={url}
                            className="btn btn-sm btn-link ms-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View public page
                          </a>
                        </div>
                      );
                    })()}
                  </Row>
                </div>
              </div>
            </div>

            {/* Right column: quick actions */}
            <div className="col-lg-5">
              <div className="card mb-3">
                <div className="card-header">Quick actions</div>
                <div className="list-group list-group-flush">
                  <Link to="/vendor/orders" className="list-group-item list-group-item-action">
                    <i className="fa fa-list-check me-2" /> Orders
                  </Link>
                  <Link to="/vendor/products" className="list-group-item list-group-item-action">
                    <i className="fa fa-box me-2" /> Linked products
                  </Link>
                  <Link to="/vendor/discounts" className="list-group-item list-group-item-action">
                    <i className="fa fa-tags me-2" /> Discounts
                  </Link>
                  <Link to="/vendor/wallet" className="list-group-item list-group-item-action">
                    <i className="fa fa-sack-dollar me-2" /> Wallet
                  </Link>
                  <Link to="/vendor/payouts" className="list-group-item list-group-item-action">
                    <i className="fa fa-money-bill-transfer me-2" /> Payouts
                  </Link>
                  <Link to="/vendor/inbox" className="list-group-item list-group-item-action">
                    <i className="fa fa-comments me-2" /> Messages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
