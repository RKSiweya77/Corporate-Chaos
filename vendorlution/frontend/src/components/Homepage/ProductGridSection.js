import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

// Safely build an absolute media URL from DRF ImageField values (which are usually relative)
function toMedia(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  // api.defaults.baseURL could be "http://127.0.0.1:8000/api" or "/api"
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

export default function ProductGridSection({
  title,
  endpoint, // e.g. "/products/new/?limit=12" (relative to axios baseURL)
  linkTo = "/products",
  count = 8,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        // Our views return a plain array (no pagination) for /new and /popular
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.results || res.data?.data || [];
        if (mounted) setItems(data.slice(0, count));
      })
      .catch((e) => console.error("Fetch error:", e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [endpoint, count]);

  return (
    <section className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">{title}</h5>
        <Link to={linkTo} className="btn btn-sm btn-outline-dark">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : items.length ? (
        <div className="row g-3">
          {items.map((p) => {
            const img = toMedia(p.main_image);
            const catTitle = p.category?.title ?? "—";
            const price = Number(p.price ?? 0).toFixed(2);

            return (
              <div className="col-6 col-md-3" key={p.id}>
                <div className="card h-100 border-0 shadow-sm">
                  {img ? (
                    <img
                      src={img}
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
                  <div className="card-body">
                    <div className="small text-muted">{catTitle}</div>
                    <div className="fw-semibold">{p.title}</div>
                    <div className="fw-bold">R {price}</div>
                  </div>
                  <div className="card-footer bg-white border-0">
                    <Link
                      to={`/product/${encodeURIComponent(p.slug || p.title)}/${p.id}`}
                      className="btn btn-sm btn-dark w-100"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-muted">No products yet.</div>
      )}
    </section>
  );
}
