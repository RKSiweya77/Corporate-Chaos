// src/components/buyer/Wishlist.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";
import { useAuth } from "../../context/AuthContext";
import { toMedia } from "../../utils/media";

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [productFavs, setProductFavs] = useState([]);
  const [vendorFavs, setVendorFavs] = useState([]);
  const [err, setErr] = useState("");

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      // ---------- PRODUCTS ----------
      let products = [];
      try {
        const r = await api.get(
          API_ENDPOINTS?.wishlist?.list ||
            API_ENDPOINTS?.favorites?.products?.list ||
            API_ENDPOINTS?.favorites?.products
        );
        products = Array.isArray(r.data) ? r.data : r.data?.results || [];
      } catch {
        products = [];
      }

      // Normalize product items
      const normalizedProducts = products.map((it) => {
        const p = it.product || it;
        return {
          favId: it.id ?? p.id,
          productId: p.id ?? it.product_id,
          title: p.title || p.name || "Product",
          price: p.price || 0,
          image: p.main_image || p.image,
          slug: p.slug,
          inStock: (p.stock_quantity ?? 0) > 0,
          vendor: p.vendor,
        };
      });

      // ---------- VENDORS ----------
      let vendors = [];
      const vendorAttempts = [
        async () => API_ENDPOINTS?.vendors?.favorites && api.get(API_ENDPOINTS.vendors.favorites),
        async () => API_ENDPOINTS?.favorites?.vendors?.list && api.get(API_ENDPOINTS.favorites.vendors.list),
        async () => API_ENDPOINTS?.favorites?.vendors && api.get(API_ENDPOINTS.favorites.vendors),
        async () => API_ENDPOINTS?.vendors?.following && api.get(API_ENDPOINTS.vendors.following),
      ];
      for (const call of vendorAttempts) {
        try {
          const r = await call?.();
          if (r) {
            vendors = Array.isArray(r.data) ? r.data : r.data?.results || [];
            break;
          }
        } catch {
          /* try next */
        }
      }

      // Normalize vendor items
      const normalizedVendors = vendors.map((v) => {
        const vendor = v.vendor || v;
        return {
          favId: v.id ?? vendor.id,
          id: vendor.id,
          name: vendor.shop_name || vendor.name || "Vendor",
          logo: vendor.logo,
          banner: vendor.banner,
          rating: vendor.rating_avg ?? vendor.rating ?? null,
          productCount: vendor.product_count ?? vendor.products_count ?? null,
          verified: vendor.is_verified || vendor.verified,
          location: vendor.location || vendor.city || vendor.country || "",
        };
      });

      setProductFavs(normalizedProducts);
      setVendorFavs(normalizedVendors);
    } catch (e) {
      setErr(e?.message || "Failed to load favourites.");
      addNotification("Failed to load favourites", "error");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const formatZAR = (amount) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(amount || 0));

  const removeProductFav = async (favId) => {
    try {
      if (API_ENDPOINTS?.wishlist?.remove) {
        await api.delete(API_ENDPOINTS.wishlist.remove(favId));
      } else if (API_ENDPOINTS?.favorites?.products?.remove) {
        await api.delete(API_ENDPOINTS.favorites.products.remove(favId));
      } else if (API_ENDPOINTS?.favorites?.remove) {
        await api.delete(API_ENDPOINTS.favorites.remove(favId));
      }
      addNotification("Removed from favourites", "success");
      loadFavorites();
    } catch {
      addNotification("Failed to remove favourite", "error");
    }
  };

  const removeVendorFav = async (favId) => {
    try {
      if (API_ENDPOINTS?.vendors?.favoritesRemove) {
        await api.delete(API_ENDPOINTS.vendors.favoritesRemove(favId));
      } else if (API_ENDPOINTS?.favorites?.vendors?.remove) {
        await api.delete(API_ENDPOINTS.favorites.vendors.remove(favId));
      } else if (API_ENDPOINTS?.vendors?.unfollow) {
        await api.post(API_ENDPOINTS.vendors.unfollow, { id: favId });
      }
      addNotification("Vendor removed from favourites", "success");
      loadFavorites();
    } catch {
      addNotification("Failed to remove vendor", "error");
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post(API_ENDPOINTS.cart.addItem, { product_id: productId, quantity: 1 });
      addNotification("Product added to cart", "success");
    } catch (error) {
      const message = error?.response?.data?.detail || "Failed to add to cart";
      addNotification(message, "error");
    }
  };

  const startChatWithVendor = async (vendorId) => {
    if (!isAuthenticated) {
      addNotification("Sign in to chat with vendors.", "info");
      window.location.assign(`/login?next=/vendors/${vendorId}`);
      return;
    }
    const attempts = [
      async () => API_ENDPOINTS?.messages?.withVendor && api.post(API_ENDPOINTS.messages.withVendor(vendorId)),
      async () => API_ENDPOINTS?.messages?.start && api.post(API_ENDPOINTS.messages.start, { vendor_id: vendorId }),
      async () => API_ENDPOINTS?.messages?.create && api.post(API_ENDPOINTS.messages.create, { vendor: vendorId }),
    ];
    for (const call of attempts) {
      try {
        const r = await call?.();
        const convoId = r?.data?.id || r?.data?.conversation_id || r?.data?.conversation?.id;
        if (convoId) {
          window.location.assign(`/chat/${convoId}`);
          return;
        }
      } catch {
        /* try next */
      }
    }
    window.location.assign(`/chat/vendor/${vendorId}`);
  };

  const counts = useMemo(
    () => ({
      products: productFavs.length,
      vendors: vendorFavs.length,
    }),
    [productFavs.length, vendorFavs.length]
  );

  return (
    <div className="container py-4">
      <style>{`
        .fav-title { color: var(--text-0); }
        .muted { color: var(--text-1); }
        .panel {
          border: 1px solid var(--border-0);
          border-radius: 14px;
          background: var(--surface-1);
          box-shadow: 0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .panel-hd {
          display:flex; align-items:center; justify-content:space-between;
          padding:.85rem 1rem; border-bottom:1px solid var(--border-0); color: var(--text-0);
        }
        .panel-body { padding: 1rem; }
        .product-card, .vendor-card {
          background: var(--surface-0);
          border: 1px solid var(--border-0);
          border-radius: 12px;
          overflow: hidden;
        }
        .chip {
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.25rem .5rem; font-size:.8rem; border-radius:999px;
          border:1px solid var(--border-0); background: var(--surface-1); color: var(--text-0);
        }
        .btn-ghost {
          border:1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
          border-radius: 10px;
        }
        .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }
      `}</style>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="muted mt-3">Loading your favourites…</p>
        </div>
      ) : err ? (
        <div className="alert alert-danger">{err}</div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="fw-bold fav-title mb-0">
              <i className="fa fa-heart me-2 text-danger" />
              Favourites
            </h1>
            <div className="muted">
              {counts.products} product{counts.products === 1 ? "" : "s"} • {counts.vendors} vendor
              {counts.vendors === 1 ? "" : "s"}
            </div>
          </div>

          {/* PRODUCTS PANEL */}
          <div className="panel mb-4">
            <div className="panel-hd">
              <h5 className="mb-0 fw-bold">Products</h5>
              <div className="muted">{counts.products}</div>
            </div>
            <div className="panel-body">
              {productFavs.length === 0 ? (
                <div className="text-center py-4 muted">
                  <i className="fa fa-box-open fa-2x mb-2" />
                  <div>No favourite products yet.</div>
                  <div className="mt-2">
                    <Link to="/products" className="btn btn-ghost">
                      <i className="fa fa-store me-2" />
                      Browse Products
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {productFavs.map((p) => (
                    <div className="col-6 col-md-4 col-lg-3" key={`pf-${p.favId}`}>
                      <div className="product-card h-100 d-flex flex-column">
                        <div className="position-relative">
                          {p.image ? (
                            <img
                              src={toMedia(p.image)}
                              alt={p.title}
                              className="w-100"
                              style={{ height: 190, objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{ height: 190 }}
                            >
                              <i className="fa fa-image fa-2x muted" />
                            </div>
                          )}
                          {!p.inStock && (
                            <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                              Out of Stock
                            </span>
                          )}
                          <button
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            onClick={() => removeProductFav(p.favId)}
                            title="Remove"
                          >
                            <i className="fa fa-times" />
                          </button>
                        </div>

                        <div className="p-2 d-flex flex-column flex-grow-1">
                          <Link
                            to={`/product/${p.slug || p.productId}`}
                            className="text-decoration-none"
                            style={{ color: "var(--text-0)" }}
                          >
                            <div className="fw-semibold text-truncate">{p.title}</div>
                          </Link>
                          <div className="fw-bold text-primary mb-2">{formatZAR(p.price)}</div>
                          <div className="mt-auto d-flex gap-2">
                            <Link
                              to={`/product/${p.slug || p.productId}`}
                              className="btn btn-outline-secondary btn-sm flex-fill"
                            >
                              <i className="fa fa-eye me-1" />
                              View
                            </Link>
                            <button
                              className="btn btn-primary btn-sm flex-fill"
                              onClick={() => addToCart(p.productId)}
                              disabled={!p.inStock}
                              title={!p.inStock ? "Out of stock" : "Add to cart"}
                            >
                              <i className="fa fa-cart-plus me-1" />
                              Add
                            </button>
                          </div>
                        </div>

                        {p.vendor && (
                          <div className="px-2 pb-2">
                            <small className="muted">
                              By {p.vendor.shop_name || p.vendor.name}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* VENDORS PANEL */}
          <div className="panel">
            <div className="panel-hd">
              <h5 className="mb-0 fw-bold">Vendors</h5>
              <div className="muted">{counts.vendors}</div>
            </div>
            <div className="panel-body">
              {vendorFavs.length === 0 ? (
                <div className="text-center py-4 muted">
                  <i className="fa fa-store fa-2x mb-2" />
                  <div>No favourite vendors yet.</div>
                  <div className="mt-2">
                    <Link to="/vendors" className="btn btn-ghost">
                      <i className="fa fa-compass me-2" />
                      Explore Vendors
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {vendorFavs.map((v) => (
                    <div className="col-12 col-md-6" key={`vf-${v.favId}`}>
                      <div className="vendor-card d-flex">
                        <div style={{ width: 96, height: 96 }} className="p-2">
                          <div
                            className="rounded-circle overflow-hidden w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{ background: "var(--surface-1)", border: "1px solid var(--border-0)" }}
                          >
                            {v.logo ? (
                              <img
                                src={toMedia(v.logo)}
                                alt={v.name}
                                className="w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <i className="fa fa-store muted" />
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1 p-2">
                          <div className="d-flex align-items-center gap-2">
                            <Link
                              to={`/vendors/${v.id}`}
                              className="text-decoration-none"
                              style={{ color: "var(--text-0)" }}
                            >
                              <div className="fw-bold">{v.name}</div>
                            </Link>
                            {v.verified && <span className="chip"><i className="fa fa-check-circle" /> Verified</span>}
                          </div>
                          <div className="muted small mt-1">
                            {v.rating ? (
                              <>
                                <i className="fa fa-star text-warning me-1" />
                                {Number(v.rating).toFixed(1)}
                              </>
                            ) : (
                              "New seller"
                            )}{" "}
                            • {v.productCount ?? 0} products
                            {v.location ? ` • ${v.location}` : ""}
                          </div>

                          <div className="d-flex gap-2 mt-2">
                            <Link to={`/vendors/${v.id}`} className="btn btn-outline-secondary btn-sm">
                              <i className="fa fa-store me-1" />
                              Visit Store
                            </Link>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => startChatWithVendor(v.id)}
                            >
                              <i className="fa fa-comments me-1" />
                              Chat
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm ms-auto"
                              onClick={() => removeVendorFav(v.favId)}
                              title="Remove vendor"
                            >
                              <i className="fa fa-times" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 96 }} />
        </>
      )}
    </div>
  );
}