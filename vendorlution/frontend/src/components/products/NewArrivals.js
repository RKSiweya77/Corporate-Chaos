import { motion } from "framer-motion";
import logo from "../../logo.png";

const NEW_ARRIVALS = [
  { id: 1, title: "Bluetooth Speaker", price: 600 },
  { id: 2, title: "Vintage Dress", price: 1200 },
  { id: 3, title: "Gaming Mouse", price: 450 },
  { id: 4, title: "Coffee Maker", price: 1100 },
];

function NewArrivals() {
  return (
    <div className="container mt-4">
      <h3 className="mb-4">New Arrivals</h3>
      <div className="row g-3">
        {NEW_ARRIVALS.map((p) => (
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

export default NewArrivals;
