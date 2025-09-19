// src/components/Vendor/VendorStore.js
import { useParams, Link } from "react-router-dom";
import ProductCard from "../Homepage/ProductCard";
import logo from "../../logo.png";

function VendorStore() {
  const { vendor_slug, vendor_id } = useParams();

  // Mock vendor data (replace with API later)
  const vendor = {
    id: vendor_id,
    name: "TechWorld Store",
    banner: logo,
    profileImg: logo,
    description: "Trusted seller of electronics and gadgets.",
    rating: 4.5,
  };

  return (
    <main className="mt-4">
      <div className="container">
        {/* Vendor Header */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body text-center">
            <img
              src={vendor.banner}
              alt={vendor.name}
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }}
            />
            <img
              src={vendor.profileImg}
              alt={vendor.name}
              className="rounded-circle border mb-2"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
            <h3 className="fw-bold">{vendor.name}</h3>
            <p className="text-muted small">{vendor.description}</p>
            <p className="text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                  className={`fa fa-star${i < vendor.rating ? "" : "-o"}`}
                />
              ))}
              <span className="ms-2">{vendor.rating}/5</span>
            </p>
            <Link to="/customer/inbox" className="btn btn-sm btn-dark">
              <i className="fa fa-comments me-1"></i> Chat with Vendor
            </Link>
          </div>
        </div>

        {/* Vendor Products */}
        <h4 className="mb-3">Products by {vendor.name}</h4>
        <div className="row g-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-3">
              <ProductCard
                title={`Product ${i + 1}`}
                price={1000 + i * 100}
                slug={`vendor-${vendor_id}-item-${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default VendorStore;
