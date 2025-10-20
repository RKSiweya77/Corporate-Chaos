// src/pages/VendorStore.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductCard from "../components/marketplace/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { toMedia } from "../utils/media";

const VENDOR_FILTER_KEYS = ["vendor", "vendor_id", "seller", "shop", "store"];

export default function VendorStore() {
  const { id: routeId } = useParams();
  const vendorId = routeId;

  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState("products"); // "products" | "about" | "reviews"

  // which query param does the backend expect for vendor filter?
  const [vendorParamKey, setVendorParamKey] = useState(VENDOR_FILTER_KEYS[0]);

  // products state (local grid to enforce vendor match)
  const [pLoading, setPLoading] = useState(true);
  const [pError, setPError] = useState("");
  const [products, setProducts] = useState([]);

  const logo = useMemo(() => toMedia(vendor?.logo), [vendor]);
  const banner = useMemo(() => toMedia(vendor?.banner), [vendor]);
  const name = vendor?.shop_name || vendor?.name || "Vendor";
  const rating = vendor?.rating_avg ?? vendor?.rating ?? null;
  const productCount = vendor?.product_count ?? vendor?.products_count ?? null;
  const sales = vendor?.sales_count ?? vendor?.orders_count ?? null;
  const joined = vendor?.created_at ?? vendor?.date_joined ?? vendor?.joined_at ?? null;
  const verified = vendor?.is_verified || vendor?.verified;
  const location = vendor?.location || vendor?.city || vendor?.country || "";

  /* ---------------------- Load Vendor ---------------------- */
  useEffect(() => {
    let alive = true;
    async function loadVendor() {
      try {
        setLoading(true);
        let res;
        if (API_ENDPOINTS?.vendors?.detail) {
          res = await api.get(API_ENDPOINTS.vendors.detail(vendorId));
        } else if (API_ENDPOINTS?.vendors?.retrieve) {
          res = await api.get(API_ENDPOINTS.vendors.retrieve(vendorId));
        } else if (API_ENDPOINTS?.vendors) {
          res = await api.get(`${API_ENDPOINTS.vendors}/${vendorId}/`);
        } else {
          throw new Error("Vendor endpoint not configured.");
        }
        if (!alive) return;
        setVendor(res?.data ?? null);
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load vendor.");
        setVendor(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    if (vendorId) loadVendor();
    return () => {
      alive = false;
    };
  }, [vendorId]);

  /* --------------- Auto-detect vendor filter key --------------- */
  useEffect(() => {
    let cancelled = false;

    async function detectKey() {
      for (const key of VENDOR_FILTER_KEYS) {
        try {
          const r = await api.get(API_ENDPOINTS.products?.list, {
            params: { [key]: vendorId, page_size: 1 },
          });
          const arr = Array.isArray(r.data) ? r.data : r.data?.results || [];
          const first = arr[0];
          const foundId =
            first?.vendor?.id ??
            first?.vendor_id ??
            first?.vendor ??
            first?.seller?.id ??
            null;
          if (String(foundId) === String(vendorId)) {
            if (!cancelled) setVendorParamKey(key);
            return;
          }
        } catch {
          // try next
        }
      }
      if (!cancelled) setVendorParamKey("vendor");
    }

    if (API_ENDPOINTS?.products?.list && vendorId) detectKey();
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  /* -------------------- Load ONLY this vendor's products -------------------- */
  useEffect(() => {
    let alive = true;

    // helper: ensure we only keep products that belong to vendorId
    const belongsToVendor = (p) => {
      const vid =
        p?.vendor?.id ??
        p?.vendor_id ??
        p?.vendor ??
        p?.seller?.id ??
        p?.seller_id ??
        null;
      return String(vid) === String(vendorId);
    };

    async function loadVendorProducts() {
      if (!vendorId) return;
      try {
        setPLoading(true);
        setPError("");

        // 1) Try explicit vendor products endpoint if provided
        const directAttempts = [
          async () => API_ENDPOINTS?.vendors?.products && api.get(API_ENDPOINTS.vendors.products(vendorId), { params: { page_size: 24 } }),
          async () =>
            API_ENDPOINTS?.vendors &&
            api.get(`${API_ENDPOINTS.vendors}/${vendorId}/products/`, { params: { page_size: 24 } }),
        ];

        for (const call of directAttempts) {
          try {
            const r = await call?.();
            if (r) {
              const arr = Array.isArray(r.data) ? r.data : r.data?.results || [];
              const filtered = arr.filter(belongsToVendor);
              if (!alive) return;
              setProducts(filtered);
              return;
            }
          } catch {
            // fall through to query-based attempt
          }
        }

        // 2) Fallback to main products list with auto-detected vendor key
        const res = await api.get(API_ENDPOINTS.products.list, {
          params: { page_size: 24, [vendorParamKey]: vendorId },
        });
        const arr = Array.isArray(res.data) ? res.data : res.data?.results || [];
        const filtered = arr.filter(belongsToVendor);
        if (!alive) return;
        setProducts(filtered);
      } catch (e) {
        if (!alive) return;
        setPError(e?.message || "Failed to load products.");
        setProducts([]);
      } finally {
        if (!alive) return;
        setPLoading(false);
      }
    }

    loadVendorProducts();
    return () => {
      alive = false;
    };
  }, [vendorId, vendorParamKey]);

  /* -------------------- Start chat with vendor -------------------- */
  const startChat = useCallback(async () => {
    if (!isAuthenticated) {
      addNotification?.("Please sign in to chat with the vendor.", "info");
      window.location.assign(`/login?next=/vendors/${vendorId}`);
      return;
    }

    const attempts = [
      async () => {
        if (API_ENDPOINTS?.messages?.withVendor) {
          const r = await api.post(API_ENDPOINTS.messages.withVendor(vendorId));
          return r?.data;
        }
      },
      async () => {
        if (API_ENDPOINTS?.messages?.start) {
          const r = await api.post(API_ENDPOINTS.messages.start, { vendor_id: vendorId });
          return r?.data;
        }
      },
      async () => {
        if (API_ENDPOINTS?.messages?.create) {
          const r = await api.post(API_ENDPOINTS.messages.create, { vendor: vendorId });
          return r?.data;
        }
      },
    ];

    for (const call of attempts) {
      try {
        const data = await call?.();
        const convoId =
          data?.id || data?.conversation_id || data?.conversation?.id || null;
        if (convoId) {
          addNotification?.("Conversation ready", "success");
          window.location.assign(`/chat/${convoId}`);
          return;
        }
      } catch {
        // try next
      }
    }
    window.location.assign(`/chat/vendor/${vendorId}`);
  }, [isAuthenticated, vendorId, addNotification]);

 
  const styles = (
    <style>{`
      .store-wrap { color: var(--text-0); }

      /* Hero layout: banner, avatar, meta */
      .hero {
        position: relative;
        border: 1px solid var(--border-0);
        border-radius: 16px;
        overflow: hidden;
        background:
          radial-gradient(900px 360px at 8% 0%, color-mix(in oklab, var(--primary-500) 16%, transparent), transparent 60%),
          linear-gradient(180deg, var(--surface-1) 0%, var(--surface-0) 100%);
        box-shadow: 0 10px 24px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
      }
      .hero-banner { height: 200px; background: var(--surface-0); }
      .hero-banner img { object-fit: cover; width: 100%; height: 100%; display: block; }

      .hero-body { display:grid; grid-template-columns: 110px 1fr auto; gap: 16px; align-items: end; padding: 16px; }
      @media (max-width: 576px) { .hero-body { grid-template-columns: 80px 1fr; } }

      .avatar {
        width: 110px; height: 110px; border-radius: 999px; overflow: hidden;
        border: 4px solid var(--surface-1);
        margin-top: -55px; background: var(--surface-0);
        display:flex; align-items:center; justify-content:center;
        box-shadow: 0 6px 18px rgba(0,0,0,.18);
      }
      .meta .name { font-weight: 800; font-size: clamp(1.05rem, 2.1vw, 1.35rem); color: var(--text-0); }
      .chips { display:flex; flex-wrap: wrap; gap: .35rem; margin-top: .25rem; }
      .chip {
        display:inline-flex; align-items:center; gap:.35rem;
        padding:.25rem .55rem; font-size:.8rem; border-radius:999px;
        border:1px solid var(--border-0); background: var(--surface-1); color: var(--text-0);
      }
      .chip .fa-star { color: #f8c000; }

      .actions { display:flex; gap:.5rem; align-items:center; }
      .btn-ghost {
        border:1px solid var(--border-0); background: var(--surface-1); color: var(--text-0);
        border-radius: 10px; padding:.5rem .75rem; font-weight:600;
      }
      .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }

      /* Tabs */
      .tabs {
        display:flex; gap:.25rem; border-bottom:1px solid var(--border-0); margin-top: .75rem;
        padding: 0 .5rem;
      }
      .tab-btn {
        appearance:none; background:transparent; border:none; padding:.6rem .8rem; border-radius:10px 10px 0 0;
        font-weight:700; color: var(--text-1);
      }
      .tab-btn.active {
        color: var(--text-0);
        background: var(--surface-1); border: 1px solid var(--border-0); border-bottom-color: transparent;
      }

      /* Panels / cards */
      .panel {
        border: 1px solid var(--border-0); border-radius: 14px; background: var(--surface-1);
        box-shadow: 0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
      }

      .about-grid { display:grid; gap: 12px; grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; } }

      .list-unstyled { margin: 0; padding: 0; list-style: none; }
      .muted { color: var(--text-1); }

      /* Reviews */
      .review { border-bottom: 1px solid var(--border-0); padding: .75rem 0; }
      .review:last-child { border-bottom: none; }
    `}</style>
  );

  /* ---------------------- Reviews loader (optional) ---------------------- */
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  useEffect(() => {
    let alive = true;
    async function loadReviews() {
      if (active !== "reviews" || !vendorId) return;
      const attempts = [
        async () => API_ENDPOINTS?.reviews?.vendor && api.get(API_ENDPOINTS.reviews.vendor(vendorId)),
        async () => API_ENDPOINTS?.vendors?.reviews && api.get(API_ENDPOINTS.vendors.reviews(vendorId)),
        async () => API_ENDPOINTS?.reviews?.list && api.get(API_ENDPOINTS.reviews.list, { params: { vendor: vendorId, page_size: 10 } }),
      ];
      try {
        setLoadingReviews(true);
        for (const call of attempts) {
          try {
            const r = await call?.();
            const arr = Array.isArray(r?.data) ? r?.data : r?.data?.results || [];
            if (arr.length || r) {
              if (alive) setReviews(arr);
              return;
            }
          } catch {}
        }
        if (alive) setReviews([]);
      } finally {
        if (alive) setLoadingReviews(false);
      }
    }
    loadReviews();
    return () => { alive = false; };
  }, [active, vendorId]);

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <div className="container py-4"><EmptyState title="Unable to load vendor" subtitle={error} icon="fa-store-slash" /></div>;
  if (!vendor) return <div className="container py-4"><EmptyState title="Vendor not found" subtitle="This store may have been removed." icon="fa-store-slash" /></div>;

  return (
    <div className="container py-3 store-wrap">
      {styles}

      {/* HERO */}
      <div className="hero mb-3">
        <div className="hero-banner">
          {banner ? <img src={banner} alt={`${name} banner`} /> : null}
        </div>

        <div className="hero-body">
          {/* Avatar */}
          <div className="avatar">
            {logo ? (
              <img src={logo} alt={`${name} logo`} className="w-100 h-100 object-fit-cover" />
            ) : (
              <i className="fa fa-store fa-lg muted" />
            )}
          </div>

          {/* Meta */}
          <div className="meta">
            <div className="name text-truncate">{name}</div>
            <div className="chips">
              {verified && (
                <span className="chip"><i className="fa fa-check-circle" /> Verified</span>
              )}
              {rating ? (
                <span className="chip"><i className="fa fa-star" /> {Number(rating).toFixed(1)}</span>
              ) : (
                <span className="chip">New seller</span>
              )}
              {location ? <span className="chip"><i className="fa fa-location-dot" /> {location}</span> : null}
              {typeof sales === "number" ? <span className="chip"><i className="fa fa-bag-shopping" /> {sales} sales</span> : null}
              {typeof productCount === "number" ? <span className="chip"><i className="fa fa-box" /> {productCount} products</span> : null}
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button className={`tab-btn ${active === "products" ? "active" : ""}`} onClick={() => setActive("products")}>
                Products
              </button>
              <button className={`tab-btn ${active === "about" ? "active" : ""}`} onClick={() => setActive("about")}>
                About
              </button>
              <button className={`tab-btn ${active === "reviews" ? "active" : ""}`} onClick={() => setActive("reviews")}>
                Reviews
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button className="btn-ghost" onClick={startChat}>
              <i className="fa fa-comments me-2" />
              Chat with vendor
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {active === "products" && (
        <div className="panel p-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="mb-0 fw-bold">Products</h5>
            <div className="small muted">
              {typeof productCount === "number" ? `${productCount} item${productCount === 1 ? "" : "s"}` : ""}
            </div>
          </div>

          {pLoading ? (
            <LoadingSpinner />
          ) : pError ? (
            <EmptyState title="Unable to load products" subtitle={pError} icon="fa-box" />
          ) : products.length === 0 ? (
            <EmptyState title="No products yet" subtitle="This vendor hasn't added products." icon="fa-box" />
          ) : (
            <div className="row g-3">
              {products.map((p) => (
                <div className="col-6 col-md-4 col-xl-3" key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active === "about" && (
        <div className="panel p-3">
          <h5 className="fw-bold mb-3">About {name}</h5>
          <div className="about-grid">
            <div>
              <div className="fw-600 mb-1">Store description</div>
              <div className="muted">
                {vendor?.description || vendor?.bio || "No description provided yet."}
              </div>
            </div>
            <div>
              <div className="fw-600 mb-1">Policies</div>
              <ul className="list-unstyled muted">
                <li><i className="fa fa-truck me-2" /> Shipping: {vendor?.shipping_policy || "See product pages for shipping details."}</li>
                <li><i className="fa fa-rotate-left me-2" /> Returns: {vendor?.return_policy || "Returns accepted according to marketplace rules."}</li>
                <li><i className="fa fa-shield-halved me-2" /> Escrow: Always protected by escrow until delivery confirmation.</li>
              </ul>
            </div>
            <div>
              <div className="fw-600 mb-1">Joined</div>
              <div className="muted">{joined ? new Date(joined).toLocaleDateString() : "—"}</div>
            </div>
            <div>
              <div className="fw-600 mb-1">Contact</div>
              <div className="muted">Use the “Chat with vendor” button to get in touch safely.</div>
            </div>
          </div>
        </div>
      )}

      {active === "reviews" && (
        <div className="panel p-3">
          <h5 className="fw-bold mb-3">Reviews</h5>
          {loadingReviews ? (
            <LoadingSpinner />
          ) : reviews.length === 0 ? (
            <EmptyState title="No reviews yet" subtitle="Buy from this vendor and be the first to leave a review." icon="fa-star" />
          ) : (
            <div>
              {reviews.map((r) => (
                <div key={r.id} className="review">
                  <div className="d-flex justify-content-between">
                    <div className="fw-600">
                      {r.user?.username || r.user_name || "Buyer"} •{" "}
                      <span className="text-warning">
                        {"★".repeat(Math.round(r.rating || r.stars || 0))}
                      </span>
                    </div>
                    <small className="muted">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                    </small>
                  </div>
                  <div className="muted mt-1">{r.comment || r.text || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spacer so the bottom dock never overlaps content */}
      <div style={{ height: 96 }} />
    </div>
  );
}