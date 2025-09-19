import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../logo.png"; // temporary placeholder until categories have images

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", img: logo },
  { name: "Fashion", slug: "fashion", img: logo },
  { name: "Home & Living", slug: "home-living", img: logo },
  { name: "Beauty", slug: "beauty", img: logo },
  { name: "Sports", slug: "sports", img: logo },
  { name: "Mobile Phones", slug: "mobiles", img: logo },
  { name: "Digital Goods", slug: "digital", img: logo },
  { name: "More Categories", slug: "more", img: logo },
];

function Categories() {
  return (
    <main className="mt-4">
      <div className="container">
        <h3 className="mb-3">Shop by Categories</h3>

        <div className="row g-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              className="col-6 col-md-4 col-lg-3"
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                to={`/category/${cat.slug}/${i + 1}`}
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="card-img-top"
                    style={{
                      height: "160px",
                      objectFit: "cover",
                      borderTopLeftRadius: "0.75rem",
                      borderTopRightRadius: "0.75rem",
                    }}
                  />
                  <div className="card-body text-center">
                    <h6 className="fw-bold mb-1">{cat.name}</h6>
                    <p className="text-muted small mb-0">Explore {cat.name}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Categories;
