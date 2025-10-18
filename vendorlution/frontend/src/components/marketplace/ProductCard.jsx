import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { getProductImage } from "../../utils/media";

export default function ProductCard({ product, onAdded }) {
  const nav = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [adding, setAdding] = useState(false);

  const img = getProductImage(product);
  const price = product?.price ?? product?.unit_price ?? product?.amount ?? 0;
  const title = product?.title || product?.name || "Product";
  const pid = product?.id;
  const vendorName = product?.vendor?.shop_name || product?.vendor?.name || product?.vendor_name;
  const vendorSlug = product?.vendor?.slug;
  const vendorId = product?.vendor?.id || product?.vendor_id;
  const inStock = product?.stock_quantity > 0;

  async function addToCart() {
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    
    if (!pid || !inStock) return;

    try {
      setAdding(true);
      await api.post(API_ENDPOINTS.cart.addItem, {
        product_id: pid,
        quantity: 1,
      });
      
      addNotification("Product added to cart", "success");
      onAdded?.(product);
    } catch (error) {
      const message = error?.response?.data?.detail || 
                     error?.response?.data?.error || 
                     "Failed to add to cart";
      addNotification(message, "error");
    } finally {
      setAdding(false);
    }
  }

  // Generate paths
  const detailPath = product?.slug 
    ? `/product/${product.slug}` 
    : `/product/${pid}`;

  const vendorPath = vendorSlug && vendorId
    ? `/vendor/store/${vendorSlug}/${vendorId}`
    : vendorId ? `/vendor/store/${vendorId}` : "#";

  return (
    <div className="card h-100 shadow-sm border-0 product-card">
      {/* Product Image */}
      {img ? (
        <Link to={detailPath} className="ratio ratio-1x1">
          <img 
            src={img} 
            alt={title} 
            className="card-img-top object-fit-cover"
            style={{ borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
          />
        </Link>
      ) : (
        <div className="bg-light d-flex align-items-center justify-content-center ratio ratio-1x1">
          <span className="text-muted small">No image</span>
        </div>
      )}

      {/* Out of stock badge */}
      {!inStock && (
        <div className="position-absolute top-0 start-0 m-2">
          <span className="badge bg-danger">Out of Stock</span>
        </div>
      )}

      <div className="card-body d-flex flex-column">
        {/* Product Title */}
        <Link to={detailPath} className="text-decoration-none text-dark">
          <h6 className="card-title text-truncate mb-1 fw-semibold">{title}</h6>
        </Link>

        {/* Vendor Info */}
        {vendorName && (
          <Link to={vendorPath} className="small text-muted text-decoration-none mb-2">
            {vendorName}
          </Link>
        )}

        {/* Product Meta */}
        <div className="mt-auto">
          {/* Rating if available */}
          {product?.rating && (
            <div className="small text-warning mb-2">
              ⭐ {Number(product.rating).toFixed(1)}
              {product?.review_count && (
                <span className="text-muted ms-1">({product.review_count})</span>
              )}
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="d-flex align-items-center justify-content-between">
            <div className="fw-bold text-primary fs-5">
              R {Number(price).toFixed(2)}
            </div>
            <button
              className="btn btn-dark btn-sm"
              onClick={addToCart}
              disabled={adding || !inStock || !isAuthenticated || user?.role !== 'buyer'}
            >
              {adding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}