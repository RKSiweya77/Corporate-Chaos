import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../logo.png";
import Pagination from "../shared/Pagination";

function VendorStore() {
  const { vendor_slug, vendor_id } = useParams();

  // Mock vendor data (replace with API call later)
  const vendor = {
    id: vendor_id,
    name: "TechWorld Store",
    description: "Affordable electronics and accessories.",
    banner: logo,
    logo: logo,
    products: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Product ${i + 1}`,
      price: 500 + i * 10,
      image: logo,
    })),
  };

  // Pagination state (for demo, page size = 6)
  const pageSize = 6;
  const [page, setPage] = React.useState(1);
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = vendor.products.slice(
    startIndex,
    startIndex + pageSize
  );
  const totalPages = Math.ceil(vendor.products.length / pageSize);

  return (
    <div className="container mt-3">
      {/* Vendor Banner */}
      <div className="card mb-4 border-0 shadow-sm">
        <img
          src={vendor.banner}
          alt="Vendor Banner"
          className="card-img-top"
          style={{ maxHeight: "200px", objectFit: "cover" }}
        />
        <div className="card-body text-center">
          <img
            src={vendor.logo}
            alt="Vendor Logo"
            className="rounded-circle border mb-2"
            width="80"
            height="80"
            style={{ objectFit: "cover" }}
          />
          <h4>{vendor.name}</h4>
          <p className="text-muted">{vendor.description}</p>

          {/* Chat with Seller + Profile Links */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Link
              to={`/customer/inbox?vendor=${vendor.id}`}
              className="btn btn-sm btn-dark"
            >
              <i className="fa fa-comments me-1"></i> Chat with Seller
            </Link>
            <Link
              to={`/vendor/public-profile/${vendor.id}`}
              className="btn btn-sm btn-outline-dark"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Products */}
      <h5 className="mb-3">Products</h5>
      <div className="row g-3">
        {paginatedProducts.map((p) => {
          const slug = p.title.toLowerCase().replace(/\s+/g, "-");
          return (
            <motion.div
              key={p.id}
              className="col-12 col-md-6 col-lg-4"
              whileHover={{ y: -4 }}
            >
              <div className="card h-100 shadow-sm border-0">
                <img src={p.image} className="card-img-top" alt={p.title} />
                <div className="card-body">
                  <h6 className="fw-bold">{p.title}</h6>
                  <p className="fw-semibold">R {p.price}</p>
                  <Link
                    to={`/product/${slug}/${p.id}`}
                    className="btn btn-sm btn-outline-dark"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}

export default VendorStore;
