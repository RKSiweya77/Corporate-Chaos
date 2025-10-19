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

  return (
    <Link to={detailPath} className="text-decoration-none">
      <style>{`
        /* ===== Product Card – Dock Theme, theme-aware ===== */
        .pcard {
          background: #0b0614;
          border: 1px solid #1f1932;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease, background .16s ease;
          color: #e7e6ea;
        }
        .pcard:hover { transform: translateY(-4px); border-color: #2b2444; }

        .pcard-imgwrap { position: relative; border-bottom: 1px solid #1f1932; background:#0f0a1d; }
        .pcard-imgwrap img { display:block; }

        .pcard .title {
          color:#fff; font-weight:700; font-size:.95rem; line-height:1.15;
          display:-webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow:hidden;
          margin: 0 0 .25rem 0; transition: color .16s ease;
        }
        .pcard .vendor {
          color:#bfb9cf; font-size:.75rem; display:flex; align-items:center; gap:.35rem; cursor:pointer;
          transition: color .16s ease;
        }
        .pcard .price { color:#0d6efd; font-weight:800; font-size:1rem; transition: color .16s ease; }

        /* Hover Add-To-Cart bar */
        .pcard .addbar {
          position:absolute; left:0; right:0; bottom:0; padding:.4rem;
          background: linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,0));
          opacity: 0; pointer-events: none; transition: opacity .18s ease, background .18s ease;
        }
        .pcard:hover .addbar { opacity: 1; pointer-events: auto; }
        .pcard .addbtn {
          width:100%; border:1px solid #2b2444; background:#100a1f; color:#e7e6ea;
          border-radius:10px; font-weight:700; padding:.45rem .65rem;
          transition: background .15s ease, border-color .15s ease, color .15s ease;
        }
        .pcard .addbtn:hover { background:#16102a; border-color:#3b315e; }

        /* SOLD badge */
        .pcard .sold {
          position:absolute; top:.5rem; left:.5rem;
          background:#dc3545; border:1px solid #5a0f17; color:#fff; font-weight:700;
          padding:.25rem .5rem; border-radius:10px; font-size:.75rem;
        }

        /* ===== Light theme overrides – match any ancestor with data-theme="light" ===== */
        :where([data-theme="light"]) .pcard {
          background:#ffffff; color:#222; border-color:#e7e7ef; box-shadow:0 8px 18px rgba(0,0,0,.06);
        }
        :where([data-theme="light"]) .pcard:hover { border-color:#d8d8e6; }
        :where([data-theme="light"]) .pcard-imgwrap { background:#f9f9fc; border-color:#ececf6; }
        :where([data-theme="light"]) .pcard .title { color:#111; }
        :where([data-theme="light"]) .pcard .vendor { color:#6b6b83; }
        :where([data-theme="light"]) .pcard .price { color:#0b5ed7; }
        :where([data-theme="light"]) .pcard .addbar {
          background: linear-gradient(to top, rgba(255,255,255,.9), rgba(255,255,255,0));
        }
        :where([data-theme="light"]) .pcard .addbtn {
          background:#ffffff; color:#222; border-color:#e5e5f0;
        }
        :where([data-theme="light"]) .pcard .addbtn:hover {
          background:#f7f7fb; border-color:#dfe0ea;
        }
      `}</style>

      <div
        className="pcard h-100 position-relative overflow-hidden"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Image-first (smaller card, more image) */}
        <div className="pcard-imgwrap" style={{ aspectRatio: "1/1" }}>
          {img ? (
            <img
              src={img}
              alt={title}
              className="w-100 h-100 object-fit-cover"
              style={{
                transition: "transform .22s ease, filter .22s ease",
                transform: hover && !isSold ? "scale(1.035)" : "scale(1)",
                filter: isSold ? "grayscale(35%) brightness(.9)" : "none",
              }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              <i className="fas fa-image fa-2x" />
            </div>
          )}

          {/* SOLD */}
          {isSold && <span className="sold">SOLD</span>}

          {/* Hover “Add to Cart” (text only) */}
          {!isSold && inStock && (
            <div className="addbar">
              <button
                className="addbtn"
                onClick={handleAddToCart}
                disabled={adding || !isAuthenticated}
                title={isAuthenticated ? "Add to Cart" : "Sign in to add"}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          )}
        </div>

        {/* Minimal details */}
        <div className="p-2">
          <div className="title" title={title}>{title}</div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="price">R {Number(price).toFixed(2)}</div>
            {vendorName && (
              <div
                className="vendor"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (vendorId) nav(vendorPath);
                }}
                title={vendorName}
              >
                <i className="fas fa-store opacity-75" />
                <span className="text-truncate" style={{ maxWidth: 120 }}>{vendorName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}