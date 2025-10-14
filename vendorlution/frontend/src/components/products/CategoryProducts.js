import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

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

export default function CategoryProducts() {
  const { category_id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Backend doesn't expose a direct ?category filter, so fetch and filter client-side.
    api
      .get("/products/?ordering=-created_at")
      .then((res) => {
        const items = unpack(res);
        setProducts(items.filter((p) => p?.category?.id === Number(category_id)));
      })
      .catch((err) => console.error("Error fetching category products:", err));
  }, [category_id]);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Products in Category</h3>
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
          <p className="text-muted">No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
