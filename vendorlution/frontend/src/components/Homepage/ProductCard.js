import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../logo.png";

function ProductCard({ title = "Product", price = 500, slug = "sample" }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-100"
    >
      <div className="card h-100 shadow-sm border-0">
        <Link to={`/product/${slug}/1`} className="text-decoration-none">
          <img
            src={logo}
            alt={title}
            className="card-img-top"
            style={{
              height: "200px",
              objectFit: "cover",
              borderTopLeftRadius: "0.75rem",
              borderTopRightRadius: "0.75rem",
            }}
          />
        </Link>
        <div className="card-body">
          <h6 className="fw-bold mb-1 text-dark">{title}</h6>
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
