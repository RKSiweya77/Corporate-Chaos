import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

// --- helpers ---
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
const fmtPrice = (n) => `R ${Number(n || 0).toFixed(2)}`;
const conditionLabel = (c) =>
  ({
    new: "New",
    like_new: "Like New",
    very_good: "Very Good",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  }[String(c || "").toLowerCase()] || "—");

export default function ProductDetail() {
  const { product_id } = useParams(); // route like /product/:slug?/:product_id
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  // Load product
  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${product_id}/`)
      .then((res) => {
        const p = res.data || {};
        setProduct(p);
        const gallery = [p.main_image, ...(p.images || []).map((im) => im.image)].filter(Boolean);
        setActiveImg(gallery.length ? gallery[0] : "");
      })
      .catch((err) => console.error("Error fetching product:", err))
      .finally(() => setLoading(false));
  }, [product_id]);

  const guardAuth = (e) => {
    if (e?.response?.status === 401) {
      nav("/customer/login?next=" + encodeURIComponent(window.location.pathname), { replace: true });
      return true;
    }
    return false;
  };

  const addToCart = useCallback(async () => {
    if (!product) return;
    try {
      setBusy(true);
      await api.post("/me/cart/items/", { product_id: Number(product_id), quantity: 1 });
      nav("/checkout", { replace: false });
    } catch (e) {
      if (!guardAuth(e)) alert("Failed to add to cart");
    } finally {
      setBusy(false);
    }
  }, [product, product_id, nav]);

  const addToWishlist = useCallback(async () => {
    if (!product) return;
    try {
      setBusy(true);
      await api.post("/me/wishlist/", { product: Number(product_id) });
      alert("Added to wishlist");
    } catch (e) {
      if (!guardAuth(e)) alert("Failed to add to wishlist");
    } finally {
      setBusy(false);
    }
  }, [product, product_id]);

  const copyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
  } catch {}
  };

  if (loading) return <div className="container py-4">Loading product…</div>;
  if (!product) return <div className="container py-4">Product not found.</div>;

  const gallery = [product.main_image, ...(product.images || []).map((im) => im.image)].filter(Boolean);
  const vendorId = product.vendor?.id;
  const vendorName =
    product.vendor?.shop_name || product.vendor?.owner?.username || product.vendor?.user?.username || "Seller";
  const vendorRegion = (product.vendor?.address || "").split("\n")[0] || product.vendor?.address || "";

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* LEFT: Gallery */}
        <div className="col-lg-6">
          {/* big image */}
          <div className="card border-0 shadow-sm">
            <div className="ratio ratio-1x1">
              {activeImg ? (
                <img
                  src={toMedia(activeImg)}
                  alt={product.title}
                  className="w-100 h-100"
                  style={{ objectFit: "cover", borderRadius: ".5rem" }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light rounded">
                  <span className="text-muted">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* thumbs */}
          {gallery.length > 1 && (
            <div className="d-flex gap-2 mt-2 overflow-auto">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`p-0 border-0 bg-transparent rounded ${activeImg === src ? "ringed" : ""}`}
                  onClick={() => setActiveImg(src)}
                  title="Preview"
                >
                  <img
                    src={toMedia(src)}
                    alt={`thumb-${i}`}
                    style={{
                      height: 64,
                      width: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: activeImg === src ? "2px solid #000" : "1px solid #e9ecef",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="col-lg-6">
          <div className="d-flex align-items-start justify-content-between">
            <h3 className="fw-bold mb-1">{product.title}</h3>

            {/* light icon row like Yaga */}
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={copyLink} title="Copy link">
                <i className="fa fa-link"></i>
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()} title="Print">
                <i className="fa fa-print"></i>
              </button>
            </div>
          </div>

          {/* price + buy */}
          <div className="mb-2">
            <div className="h4 mb-2">{fmtPrice(product.price)}</div>
            <div className="small text-muted">
              + Delivery from R 49 (store-to-store) • Buyer Protection fee applied at checkout
            </div>
          </div>

          <div className="d-grid d-sm-flex gap-2 my-3">
            <button className="btn btn-danger flex-fill" onClick={addToCart} disabled={busy}>
              {busy ? "Processing…" : "Buy"}
            </button>
            <button className="btn btn-outline-danger flex-fill" onClick={addToWishlist} disabled={busy}>
              <i className="fa fa-heart me-1"></i> Add to Wishlist
            </button>
          </div>

          {/* meta chips like Yaga */}
          <div className="d-flex flex-wrap gap-2 my-2">
            <span className="badge rounded-pill bg-light text-dark border">
              {product.category?.title || "Other"}
            </span>
            <span className="badge rounded-pill bg-light text-dark border">
              Condition: {conditionLabel(product.condition)}
            </span>
            {product.stock > 0 ? (
              <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle">
                In stock: {product.stock}
              </span>
            ) : (
              <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle">
                Out of stock
              </span>
            )}
            {Number(product.rating_avg) > 0 && (
              <span className="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle">
                ★ {Number(product.rating_avg).toFixed(1)}
              </span>
            )}
          </div>

          {/* location + vendor */}
          <div className="d-flex align-items-center gap-3 my-2">
            <div className="text-muted small d-flex align-items-center gap-1">
              <i className="fa fa-location-dot"></i>
              <span>{vendorRegion || "South Africa"}</span>
            </div>
            <div className="vr" />
            {vendorId && (
              <>
                <Link
                  to={`/vendor/public-profile/${vendorId}`}
                  className="small text-decoration-none d-inline-flex align-items-center"
                >
                  <i className="fa fa-store me-1"></i>
                  {vendorName}
                </Link>
                <Link
                  to={`/customer/inbox?vendor=${vendorId}&product=${product.id}`}
                  className="btn btn-sm btn-dark ms-auto"
                >
                  <i className="fa fa-comments me-1" />
                  Chat with seller
                </Link>
              </>
            )}
          </div>

          {/* description */}
          {product.detail && (
            <>
              <hr />
              <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                {product.detail}
              </p>
            </>
          )}

          {/* buyer protection callout */}
          <div className="alert alert-info d-flex align-items-start gap-2 mt-3">
            <i className="fa fa-shield-halved mt-1"></i>
            <div className="small">
              <strong>Buyer Protection</strong> is applied to all purchases. We hold funds securely until you confirm
              delivery. If an item doesn’t match the description, you’re eligible for a refund.
            </div>
          </div>

          {/* quick actions row like Yaga: like/share/copy/chat (chat already above) */}
          <div className="d-flex align-items-center gap-3 mt-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={copyLink}>
              <i className="fa fa-share-nodes me-1"></i> Share
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={addToWishlist}>
              <i className="fa fa-heart me-1"></i> Save
            </button>
            {vendorId && (
              <Link
                to={`/customer/inbox?vendor=${vendorId}&product=${product.id}`}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fa fa-message me-1"></i> Chat
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
