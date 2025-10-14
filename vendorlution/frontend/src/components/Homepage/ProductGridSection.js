import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

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

export default function ProductGridSection({
  title,
  endpoint, // e.g. "/products/new/?limit=12"
  linkTo = "/products",
  count = 8,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        // /new and /popular are array responses (no pagination)
        const data = Array.isArray(res.data) ? res.data : res.data?.results || res.data?.data || [];
        if (mounted) setItems(data.slice(0, count));
      })
      .catch((e) => console.error("Fetch error:", e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [endpoint, count]);

  const addToCart = async (id) => {
    try {
      await api.post("/me/cart/items/", { product_id: id, quantity: 1 });
      alert("Added to cart");
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/customer/login");
      } else {
        alert("Failed to add to cart");
      }
    }
  };

  const addToWishlist = async (id) => {
    try {
      await api.post("/me/wishlist/", { product: id });
      alert("Added to wishlist");
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/customer/login");
      } else {
        alert("Failed to add to wishlist");
      }
    }
  };

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
                  <div className="card-footer bg-white border-0 d-flex gap-2">
                    <Link
                      to={`/product/${encodeURIComponent(p.slug || p.title)}/${p.id}`}
                      className="btn btn-sm btn-outline-dark flex-fill"
                    >
                      View
                    </Link>
                    <button
                      className="btn btn-sm btn-dark"
                      title="Add to cart"
                      onClick={() => addToCart(p.id)}
                    >
                      <i className="fa fa-cart-plus"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Add to wishlist"
                      onClick={() => addToWishlist(p.id)}
                    >
                      <i className="fa fa-heart"></i>
                    </button>
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
