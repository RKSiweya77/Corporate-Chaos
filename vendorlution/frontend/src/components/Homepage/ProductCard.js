import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function ProductCard({ product }) {
  const nav = useNavigate();
  const img = toMedia(product?.main_image);
  const price = Number(product?.price ?? 0).toFixed(2);

  const addToCart = async () => {
    try {
      await api.post("/me/cart/items/", { product_id: product.id, quantity: 1 });
      alert("Added to cart");
    } catch (e) {
      if (e?.response?.status === 401) nav("/customer/login");
      else alert("Failed to add to cart");
    }
  };

  const addToWishlist = async () => {
    try {
      await api.post("/me/wishlist/", { product: product.id });
      alert("Added to wishlist");
    } catch (e) {
      if (e?.response?.status === 401) nav("/customer/login");
      else alert("Failed to add to wishlist");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-100"
    >
      <div className="card h-100 shadow-sm border-0">
        <Link
          to={`/product/${encodeURIComponent(product?.slug || product?.title)}/${product?.id}`}
          className="text-decoration-none"
        >
          {img ? (
            <img
              src={img}
              alt={product?.title}
              className="card-img-top"
              style={{
                height: 200,
                objectFit: "cover",
                borderTopLeftRadius: "0.75rem",
                borderTopRightRadius: "0.75rem",
              }}
            />
          ) : (
            <div
              className="bg-light d-flex align-items-center justify-content-center"
              style={{ height: 200 }}
            >
              <span className="text-muted small">No image</span>
            </div>
          )}
        </Link>
        <div className="card-body">
          <h6 className="fw-bold mb-1 text-dark">{product?.title}</h6>
          <p className="text-muted small mb-2">R {price}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-dark flex-fill" onClick={addToCart}>
              <i className="fa fa-cart-plus me-1"></i>Add
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={addToWishlist}>
              <i className="fa fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
