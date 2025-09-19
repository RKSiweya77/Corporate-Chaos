import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../logo.png";

const VENDORS = [
  { id: 1, name: "TechWorld Store", cats: "Electronics, Mobile" },
  { id: 2, name: "Fashion Hub", cats: "Fashion" },
  { id: 3, name: "SportsPro", cats: "Sports" },
  { id: 4, name: "Home Comforts", cats: "Home & Living" },
];

function FeaturedVendors() {
  return (
    <section className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="mb-0">Featured Vendors</h3>
        <Link to="/explore-vendors" className="btn btn-sm btn-dark">
          Explore Vendors
        </Link>
      </div>
      <div className="row g-3">
        {VENDORS.map((v) => (
          <motion.div
            key={v.id}
            className="col-12 col-md-6 col-lg-3"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <div className="card h-100 shadow-sm border-0">
              <img src={logo} className="card-img-top" alt={v.name} />
              <div className="card-body">
                <h5 className="card-title mb-1">{v.name}</h5>
                <div className="small text-muted">Categories: {v.cats}</div>
                <Link
                  to={`/vendor/store/${v.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/${v.id}`}
                  className="btn btn-sm btn-outline-dark mt-2"
                >
                  View Store
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedVendors;
