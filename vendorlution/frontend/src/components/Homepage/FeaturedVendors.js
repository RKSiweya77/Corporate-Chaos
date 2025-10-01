import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function toMedia(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const base = api.defaults.baseURL || "/api";
    const origin = base.startsWith("http")
      ? new URL(base).origin
      : window.location.origin;
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export default function FeaturedVendors() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    api
      .get("/vendors/featured/?limit=8")
      .then((res) => setVendors(Array.isArray(res.data) ? res.data : []))
      .catch((e) => console.error("Vendors fetch error:", e));
  }, []);

  if (!vendors.length) return null;

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Featured Vendors</h5>
        <Link to="/vendors" className="btn btn-sm btn-outline-dark">
          Explore Vendors
        </Link>
      </div>
      <div className="row g-3">
        {vendors.map((v) => (
          <div className="col-6 col-md-3" key={v.id}>
            <div className="card h-100 border-0 shadow-sm">
              {v.banner ? (
                <img
                  src={toMedia(v.banner)}
                  alt={v.shop_name}
                  className="card-img-top"
                  style={{ height: 120, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{ height: 120 }}
                >
                  <span className="text-muted small">No banner</span>
                </div>
              )}
              <div className="card-body">
                <div className="fw-semibold">{v.shop_name}</div>
                <div className="small text-muted">
                  {v.description?.slice(0, 70) || "—"}
                </div>
              </div>
              <div className="card-footer bg-white border-0">
                <Link to={`/vendor/${encodeURIComponent(v.slug)}`} className="btn btn-sm btn-dark w-100">
                  View Store
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
