import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

function ProductGridSection({ title, linkTo = "/products", count = 8 }) {
  return (
    <section className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="mb-0">{title}</h3>
        <Link to={linkTo} className="btn btn-sm btn-dark">
          View All <i className="fa fa-arrow-right-long ms-1" />
        </Link>
      </div>

      <div className="row g-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-3">
            <ProductCard title={`${title} ${i + 1}`} price={1000 + i * 100} slug={`item-${i+1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
export default ProductGridSection;
