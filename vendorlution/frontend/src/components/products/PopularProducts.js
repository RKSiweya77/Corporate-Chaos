import { motion } from "framer-motion";
import logo from "../../logo.png";

const POPULAR_PRODUCTS = [
  { id: 1, title: "Wireless Headphones", price: 1200 },
  { id: 2, title: "Denim Jacket", price: 800 },
  { id: 3, title: "Smart Watch", price: 1500 },
  { id: 4, title: "Sneakers", price: 900 },
];

function PopularProducts() {
  return (
    <div className="container mt-4">
      <h3 className="mb-4">Popular Products</h3>
      <div className="row g-3">
        {POPULAR_PRODUCTS.map((p) => (
          <motion.div
            key={p.id}
            className="col-12 col-md-6 col-lg-3"
            whileHover={{ y: -4 }}
          >
            <div className="card shadow-sm border-0 h-100">
              <img src={logo} className="card-img-top" alt={p.title} />
              <div className="card-body">
                <h6 className="fw-bold">{p.title}</h6>
                <p className="fw-semibold">R {p.price}</p>
                <a
                  href={`/product/${p.id}`}
                  className="btn btn-sm btn-dark"
                >
                  View Product
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PopularProducts;
