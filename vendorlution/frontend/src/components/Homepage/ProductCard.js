import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";

function toMedia(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const base = api.defaults.baseURL || "/api";
    const origin = base.startsWith("http")
      ? new URL(base).origin
      : window.location.origin;
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

/**
 * Optional standalone card (not required by sections above,
 * but keeping it in case other parts of your UI import it).
 */
function ProductCard({ product }) {
  const img = toMedia(product?.main_image);
  const price = Number(product?.price ?? 0).toFixed(2);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-100"
    >
      <div className="card h-100 shadow-sm border-0">
        <Link
          to={`/product/${encodeURIComponent(product?.slug || product?.title)}/${
            product?.id
          }`}
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
            <button className="btn btn-sm btn-dark flex-fill">
              <i className="fa fa-cart-plus me-1"></i>Add
            </button>
            <button className="btn btn-sm btn-outline-danger">
              <i className="fa fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
