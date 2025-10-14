import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

export default function ProductDetail() {
  const { product_id } = useParams(); // matches /product/:product_slug/:product_id
  const [product, setProduct] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    api
      .get(`/products/${product_id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error fetching product:", err));
  }, [product_id]);

  const addToCart = useCallback(async () => {
    try {
      await api.post("/me/cart/items/", { product_id: Number(product_id), quantity: 1 });
      alert("Added to cart");
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/customer/login?next=" + encodeURIComponent(window.location.pathname));
      } else {
        alert("Failed to add to cart");
      }
    }
  }, [product_id, nav]);

  const addToWishlist = useCallback(async () => {
    try {
      await api.post("/me/wishlist/", { product: Number(product_id) });
      alert("Added to wishlist");
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/customer/login?next=" + encodeURIComponent(window.location.pathname));
      } else {
        alert("Failed to add to wishlist");
      }
    }
  }, [product_id, nav]);

  if (!product) {
    return <div className="container py-4">Loading product...</div>;
  }

  const mainImg = toMedia(product.main_image);
  const vendorId = product.vendor?.id;
  const vendorName = product.vendor?.shop_name || product.vendor?.user?.username || "Seller";

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-5">
          {mainImg ? (
            <img src={mainImg} alt={product.title} className="img-fluid rounded" />
          ) : (
            <div
              className="bg-light d-flex align-items-center justify-content-center rounded"
              style={{ height: 320 }}
            >
              <span className="text-muted">No image</span>
            </div>
          )}
        </div>
        <div className="col-md-7">
          <h3 className="fw-bold">{product.title}</h3>
          <div className="text-muted mb-2">
            Category: {product.category?.title || "—"}
          </div>
          <div className="mb-3">
            <span className="h5">R {Number(product.price ?? 0).toFixed(2)}</span>
          </div>
          <p className="mb-4">{product.detail}</p>

          <div className="d-flex gap-2 mb-3">
            <button onClick={addToCart} className="btn btn-dark">
              <i className="fa fa-cart-plus me-1"></i>Add to Cart
            </button>
            <button onClick={addToWishlist} className="btn btn-outline-danger">
              <i className="fa fa-heart me-1"></i>Add to Wishlist
            </button>
          </div>

          {vendorId && (
            <div className="d-flex align-items-center gap-2">
              <Link to={`/vendor/public-profile/${vendorId}`} className="btn btn-sm btn-outline-dark">
                View {vendorName}
              </Link>
              <Link
                to={`/customer/inbox?vendor=${vendorId}&product=${product.id}`}
                className="btn btn-sm btn-dark"
              >
                <i className="fa fa-comments me-1"></i> Message Seller
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
