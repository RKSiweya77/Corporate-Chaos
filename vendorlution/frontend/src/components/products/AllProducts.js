import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

// Normalize DRF paginated vs array responses
function unpack(res) {
  if (Array.isArray(res?.data)) return res.data;
  return res?.data?.results || [];
}

function toMedia(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const base = api.defaults.baseURL || "/api";
    const origin = base.startsWith("http") ? new URL(base).origin : window.location.origin;
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export default function AllProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/products/?ordering=-created_at")
      .then((res) => setProducts(unpack(res)))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <div className="container py-4">
      <h3 className="mb-4">All Products</h3>
      <div className="row g-3">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="col-md-3 col-6">
              <div className="card h-100 shadow-sm border-0">
                {p.main_image ? (
                  <img
                    src={toMedia(p.main_image)}
                    alt={p.title}
                    className="card-img-top"
                    style={{ height: 170, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: 170 }}
                  >
                    <span className="text-muted small">No image</span>
                  </div>
                )}
                <div className="card-body text-center">
                  <h6 className="fw-bold">{p.title}</h6>
                  <p className="text-muted small mb-2">R {Number(p.price ?? 0).toFixed(2)}</p>
                  <Link
                    to={`/product/${encodeURIComponent(p.slug || p.title)}/${p.id}`}
                    className="btn btn-sm btn-dark w-100"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No products available.</p>
        )}
      </div>
    </div>
  );
}
