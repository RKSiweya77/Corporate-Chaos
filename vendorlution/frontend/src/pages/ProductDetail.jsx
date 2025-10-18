// src/pages/ProductDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import { getProductImage } from "../utils/media";

function relativeTime(iso) {
  if (!iso) return null;
  const now = new Date();
  const then = new Date(iso);
  const diff = Math.max(0, (now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d`;
  return then.toLocaleDateString();
}

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(API_ENDPOINTS.products.detail(id));
        if (!cancelled) {
          setProduct(res.data);
          setSelectedImage(getProductImage(res.data));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load product:", err);
          setError("Product not found or unavailable.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) loadProduct();
    return () => { cancelled = true; };
  }, [id]);

  // Keep hooks before any return
  const images = useMemo(() => {
    const arr = [
      getProductImage(product),
      ...(product?.images || []).map((img) => img.image || img.url),
    ].filter(Boolean);
    return Array.from(new Set(arr));
  }, [product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (!product) return;
    try {
      setAdding(true);
      await api.post(API_ENDPOINTS.cart.addItem, {
        product_id: Number(id),
        quantity: 1, // no quantity picker
      });
      addNotification("Added to cart!", "success");
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to add to cart";
      addNotification(message, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    await handleAddToCart();
    nav("/checkout");
  };

  const handleChatWithVendor = () => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (product?.vendor?.id) nav(`/chat/vendor/${product.vendor.id}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addNotification("Link copied to clipboard", "success");
    } catch {
      addNotification("Unable to copy link", "error");
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner fullPage message="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <EmptyState
          title="Product Not Found"
          subtitle={error || "The product you're looking for doesn't exist."}
          icon="fa-box-open"
          action={
            <Link to="/products" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Products
            </Link>
          }
        />
      </div>
    );
  }

  // Display values
  const price = product?.price ?? 0;
  const title = product?.title || product?.name || "Product";
  const description = product?.detail || product?.description || "";
  const vendor = product?.vendor;
  const stockQty = product?.stock ?? product?.stock_quantity ?? 0;
  const inStock = stockQty > 0;
  const category = product?.category;
  const condition = product?.condition || "New";
  const location = product?.location || product?.city || product?.region || null;
  const when = relativeTime(product?.created_at || product?.updated_at);
  const views = product?.views ?? null;
  const likes = product?.likes ?? product?.favorites_count ?? null;

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Products</Link>
          </li>
          {category && (
            <li className="breadcrumb-item">
              <Link to={`/products?category=${category.id}`} className="text-decoration-none">
                {category.title || category.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">{title}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* LEFT: Gallery only (unified scroll) */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="ratio ratio-1x1 position-relative">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={title}
                    className="object-fit-contain p-3"
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-light">
                    <i className="fas fa-image fa-4x text-muted"></i>
                  </div>
                )}
                {!inStock && (
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-danger fs-6 px-3 py-2">Sold / Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="d-flex gap-2 overflow-auto py-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`p-0 border rounded ${selectedImage === img ? "border-primary border-2" : "border-200"}`}
                  style={{ width: 86, height: 86, overflow: "hidden" }}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${title} ${idx + 1}`} className="w-100 h-100 object-fit-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Price, CTAs, Seller, then Description & Details */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              {/* Price + meta */}
              <div className="d-flex align-items-center justify-content-between">
                <h1 className="h2 fw-bold mb-0">R {Number(price).toFixed(2)}</h1>
                <div className="d-flex align-items-center gap-3 small text-muted">
                  {likes != null && <span><i className="far fa-heart me-1" />{likes}</span>}
                  {views != null && <span><i className="far fa-eye me-1" />{views}</span>}
                  {when && <span>{when}</span>}
                </div>
              </div>

              {/* Single trust/delivery line */}
              <div className="mt-2 small text-muted d-flex align-items-center flex-wrap gap-2">
                <span className="d-inline-flex align-items-center">
                  <i className="fas fa-shield-alt me-1" /> Buyer Protection included
                </span>
                <span className="mx-1">•</span>
                {location && (
                  <span className="d-inline-flex align-items-center">
                    <i className="fas fa-map-marker-alt me-1" /> {location}
                  </span>
                )}
                <span className="mx-1">•</span>
                <span>Delivery options shown at checkout</span>
              </div>

              {/* CTAs */}
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-primary btn-lg" onClick={handleBuyNow} disabled={adding || !isAuthenticated || !inStock}>
                  <i className="fas fa-shopping-bag me-2" />
                  Buy
                </button>
                <button className="btn btn-outline-dark btn-lg" onClick={handleAddToCart} disabled={adding || !isAuthenticated || !inStock}>
                  {adding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cart-plus me-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                {!inStock && (
                  <div className="alert alert-warning mt-2 mb-0">
                    <i className="fas fa-exclamation-triangle me-2" />
                    This item is currently unavailable.
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="alert alert-info mt-2 mb-0">
                    <i className="fas fa-info-circle me-2" />
                    Please <Link to="/login" className="alert-link">log in</Link> to purchase.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seller */}
          {vendor && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body d-flex align-items-center justify-content-between">
                <Link to={`/vendors/${vendor.id}`} className="text-decoration-none d-flex align-items-center gap-3">
                  {vendor.logo ? (
                    <img
                      src={vendor.logo}
                      alt={vendor.shop_name || vendor.name}
                      className="rounded-circle"
                      style={{ width: 48, height: 48, objectFit: "cover" }}
                    />
                  ) : (
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="fas fa-store text-muted" />
                    </div>
                  )}
                  <div>
                    <div className="fw-semibold text-dark">
                      {vendor.shop_name || vendor.name || "Vendor"}
                    </div>
                    <div className="small text-muted">
                      {vendor?.rating_avg ? (
                        <>
                          <i className="fas fa-star text-warning me-1" />
                          {Number(vendor.rating_avg).toFixed(1)}
                          {vendor?.review_count ? ` • ${vendor.review_count} reviews` : ""}
                        </>
                      ) : (
                        "New seller"
                      )}
                    </div>
                  </div>
                </Link>

                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-light btn-sm" onClick={copyLink} title="Copy link">
                    <i className="fas fa-link" />
                  </button>
                  <button className="btn btn-outline-dark btn-sm" onClick={handleChatWithVendor}>
                    <i className="fas fa-comments me-1" />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Description (moved to right column) */}
          {description && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="fw-semibold mb-2">Description</h6>
                <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Details (moved to right column) */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Details</h6>
              <div className="row g-2">
                <div className="col-6 col-md-6">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block mb-1">Category</small>
                    <div className="fw-medium">{category?.title || category?.name || "—"}</div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block mb-1">Condition</small>
                    <div className="fw-medium text-capitalize">{condition}</div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block mb-1">Stock</small>
                    <div className="fw-medium">
                      {inStock ? (
                        <span className="text-success">
                          <i className="fas fa-check-circle me-1" />
                          {stockQty} available
                        </span>
                      ) : (
                        <span className="text-danger">
                          <i className="fas fa-times-circle me-1" />
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block mb-1">Product ID</small>
                    <div className="fw-medium">#{product?.id}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 d-flex flex-wrap gap-2">
                {product?.size && <span className="badge rounded-pill text-bg-light">Size: {product.size}</span>}
                {category?.name && <span className="badge rounded-pill text-bg-light">{category.name}</span>}
                {(product?.tags || []).map((t, i) => (
                  <span key={i} className="badge rounded-pill text-bg-light">{String(t)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}