// src/components/marketplace/ProductCard.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { getProductImage } from "../../utils/media";

export default function ProductCard({ product }) {
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [adding, setAdding] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [hover, setHover] = useState(false);

  const img = getProductImage(product);
  const price = product?.price ?? 0;
  const title = product?.title || product?.name || "Product";
  const pid = product?.id;
  const vendorName = product?.vendor?.shop_name || product?.vendor?.name;
  const vendorId = product?.vendor?.id;

  const stockQty = product?.stock ?? product?.stock_quantity ?? 0;
  const inStock = stockQty > 0;
  const isSold = stockQty === 0;

  const detailPath = `/products/${pid}`;
  const vendorPath = vendorId ? `/vendors/${vendorId}` : "#";

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!pid || !inStock) return;
    try {
      setAdding(true);
      await api.post(API_ENDPOINTS.cart.addItem, { product_id: pid, quantity: 1 });
      addNotification("Added to cart!", "success");
    } catch (error) {
      const message = error?.response?.data?.detail || "Failed to add to cart";
      addNotification(message, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!pid) return;
    try {
      setAddingWishlist(true);
      await api.post(API_ENDPOINTS.wishlist.list, { product: pid });
      addNotification("Added to wishlist!", "success");
    } catch (error) {
      const message = error?.response?.data?.detail || "Failed to add to wishlist";
      addNotification(message, "error");
    } finally {
      setAddingWishlist(false);
    }
  };

  return (
    <Link to={detailPath} className="text-decoration-none">
      <style>{`
        .pcard {
          background: #0b0614;
          border: 1px solid #1f1932;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
          color: #e7e6ea;
        }
        .pcard:hover { transform: translateY(-3px); border-color: #2b2444; }
        .pcard-imgwrap {
          border-bottom: 1px solid #1f1932; background:#0f0a1d;
        }
        .pcard-title {
          color:#fff; font-weight: 700;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          min-height: 2.6rem;
        }
        .pcard-vendor { color:#bfb9cf; }
        .pcard-price { color:#0d6efd; font-weight:800; }
        .pcard-badge-sold {
          background:#dc3545; border:1px solid #5a0f17; color:#fff; font-weight:700;
          padding:.25rem .5rem; border-radius:10px;
        }
        .pcard-cta {
          display:flex; gap:.4rem;
        }
        .pcard-btn {
          border:1px solid #2b2444; background:#100a1f; color:#e7e6ea;
          padding:.35rem .55rem; border-radius:10px; transition:all .15s ease;
        }
        .pcard-btn:hover { background:#16102a; border-color:#3b315e; }
        .pcard-heart {
          width:36px; height:36px; display:flex; align-items:center; justify-content:center;
          border:1px solid #2b2444; background:#100a1f; color:#ff6b81; border-radius:10px;
        }
        .pcard-heart:disabled { opacity:.6; }
        .pcard-overlay {
          position:absolute; top:.5rem; right:.5rem; display:flex; gap:.4rem;
        }
      `}</style>

      <div
        className="pcard h-100 position-relative overflow-hidden"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Image */}
        <div className="pcard-imgwrap position-relative" style={{ aspectRatio: "1/1" }}>
          {img ? (
            <img
              src={img}
              alt={title}
              className="w-100 h-100 object-fit-cover"
              style={{
                transition: "transform .25s ease, filter .25s ease",
                transform: hover && !isSold ? "scale(1.04)" : "scale(1)",
                filter: isSold ? "grayscale(40%) brightness(.9)" : "none",
              }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              <i className="fas fa-image fa-2x" />
            </div>
          )}

          {/* SOLD */}
          {isSold && (
            <div className="position-absolute top-0 start-0 m-2">
              <span className="pcard-badge-sold">SOLD</span>
            </div>
          )}

          {/* Wishlist */}
          {!isSold && (
            <div className="pcard-overlay">
              <button
                className="pcard-heart"
                onClick={handleAddToWishlist}
                disabled={addingWishlist || !isAuthenticated}
                aria-label="Add to wishlist"
                title="Add to wishlist"
              >
                {addingWishlist ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <i className="fas fa-heart" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {vendorName && (
            <div
              className="pcard-vendor small mb-1 text-truncate"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (vendorId) nav(vendorPath);
              }}
              style={{ cursor: vendorId ? "pointer" : "default" }}
              title={vendorName}
            >
              <i className="fas fa-store me-1 opacity-75" />
              {vendorName}
            </div>
          )}

          <div className="pcard-title mb-2" title={title}>{title}</div>

          <div className="d-flex align-items-center justify-content-between">
            <div className="pcard-price">R {Number(price).toFixed(2)}</div>
            {!isSold && inStock ? (
              <div className="pcard-cta">
                <button
                  className="pcard-btn"
                  onClick={handleAddToCart}
                  disabled={adding || !isAuthenticated}
                  title={isAuthenticated ? "Add to cart" : "Sign in to add"}
                >
                  {adding ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="fas fa-cart-plus" />
                  )}
                </button>
              </div>
            ) : (
              <span className="badge bg-secondary">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}