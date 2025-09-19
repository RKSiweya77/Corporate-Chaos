import React from "react";   // ✅ add this
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../logo.png";
import Pagination from "../shared/Pagination";

// Mock vendor data (replace with API later)
const ALL_VENDORS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Vendor ${i + 1}`,
  cats: i % 2 === 0 ? "Electronics" : "Fashion",
  logo: logo,
  banner: logo,
}));

function ExploreVendors() {
  // Pagination state (page size = 8)
  const pageSize = 8;
  const [page, setPage] = React.useState(1);
  const startIndex = (page - 1) * pageSize;
  const paginatedVendors = ALL_VENDORS.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(ALL_VENDORS.length / pageSize);

  return (
    <div className="container mt-3">
      <h3 className="mb-4">Explore Vendors</h3>
      <div className="row g-3">
        {paginatedVendors.map((v) => (
          <motion.div
            key={v.id}
            className="col-12 col-md-6 col-lg-3"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <div className="card h-100 shadow-sm border-0">
              <img
                src={v.banner}
                className="card-img-top"
                alt={v.name}
                style={{ maxHeight: "120px", objectFit: "cover" }}
              />
              <div className="card-body text-center">
                <img
                  src={v.logo}
                  alt={v.name}
                  className="rounded-circle border mb-2"
                  width="60"
                  height="60"
                  style={{ objectFit: "cover" }}
                />
                <h6 className="card-title mb-1">{v.name}</h6>
                <div className="small text-muted">Categories: {v.cats}</div>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <Link
                    to={`/vendor/store/${v.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}/${v.id}`}
                    className="btn btn-sm btn-outline-dark"
                  >
                    View Store
                  </Link>
                  <Link
                    to={`/vendor/public-profile/${v.id}`}
                    className="btn btn-sm btn-dark"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}

export default ExploreVendors;
