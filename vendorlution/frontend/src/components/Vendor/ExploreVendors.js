import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

function toMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${apiRoot}${path}`;
}

export default function ExploreVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/vendors/?ordering=shop_name");
        if (!alive) return;
        const data = res.data?.results ?? res.data ?? [];
        setVendors(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load vendors.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="container py-5">Loading vendors…</div>;
  if (err) return <div className="container py-5"><div className="alert alert-danger">{err}</div></div>;

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">Explore Vendors</h3>
      <div className="row g-3">
        {vendors.map((v) => (
          <div className="col-md-4" key={v.id}>
            <div className="card h-100 shadow-sm">
              {v.banner && (
                <img
                  src={toMedia(v.banner)}
                  alt={v.shop_name}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="fw-bold">{v.shop_name}</h5>
                <p className="small text-muted mb-3">{v.description}</p>
                <div className="d-flex gap-2">
                  <Link
                    to={`/vendor/store/${encodeURIComponent(v.slug)}/${v.id}`}
                    className="btn btn-sm btn-dark"
                  >
                    Visit Store
                  </Link>
                  <Link
                    to={`/vendor/public-profile/${v.id}`}
                    className="btn btn-sm btn-outline-dark"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <div className="text-center text-muted py-5">No vendors found.</div>
        )}
      </div>
    </div>
  );
}
