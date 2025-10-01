import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function ExploreVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/vendors/")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || res.data?.data || [];
        if (mounted) setVendors(data);
      })
      .catch(err => console.error(err))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Explore Vendors</h3>
      </div>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : vendors.length ? (
        <div className="row g-3">
          {vendors.map(v => (
            <div key={v.id} className="col-6 col-md-3">
              <div className="card h-100 border-0 shadow-sm">
                {v.logo ? (
                  <img
                    src={v.logo}
                    alt={v.store_name}
                    className="card-img-top"
                    style={{height: 140, objectFit: "cover"}}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{height: 140}}>
                    <span className="text-muted small">No logo</span>
                  </div>
                )}
                <div className="card-body">
                  <div className="fw-semibold">{v.store_name}</div>
                  <div className="small text-muted">{v.address || "—"}</div>
                </div>
                <div className="card-footer bg-white border-0">
                  <Link
                    to={`/vendor/store/${encodeURIComponent(v.store_name.toLowerCase().replace(/\s+/g, "-"))}/${v.id}`}
                    className="btn btn-sm btn-outline-dark w-100"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted">No vendors yet.</div>
      )}
    </div>
  );
}

export default ExploreVendors;
