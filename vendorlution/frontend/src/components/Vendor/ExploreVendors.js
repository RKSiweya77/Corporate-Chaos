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

  useEffect(() => {
    api.get("/vendors/").then((res) => setVendors(res.data.results || res.data));
  }, []);

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
                <p className="small text-muted">{v.description}</p>
                <Link
                  to={`/vendor/${encodeURIComponent(v.slug)}`}
                  className="btn btn-sm btn-outline-dark"
                >
                  View Shop
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}