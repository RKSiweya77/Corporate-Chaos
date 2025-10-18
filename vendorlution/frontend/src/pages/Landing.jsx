// src/pages/Landing.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductGrid from "../components/marketplace/ProductGrid";
import VendorCard from "../components/marketplace/VendorCard";
import CategoryScroller from "../components/marketplace/CategoryScroller";

export default function Landing() {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [errorVendors, setErrorVendors] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadFeatured() {
      try {
        setLoadingVendors(true);
        const res = await api.get(API_ENDPOINTS.vendors.featured);
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setVendors(data);
        setErrorVendors("");
      } catch (err) {
        if (!alive) return;
        setErrorVendors(err.message || "Failed to load featured vendors.");
      } finally {
        if (!alive) return;
        setLoadingVendors(false);
      }
    }
    loadFeatured();
    return () => (alive = false);
  }, []);

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="p-4 p-md-5 mb-4 bg-dark text-white rounded-3">
        <div className="container-fluid py-3">
          <h1 className="display-6 fw-bold mb-2">Shop safer with escrow protection</h1>
          <p className="col-md-8 fs-6 text-light mb-3 opacity-75">
            Pay securely via wallet or Ozow (Instant EFT). Funds are held in escrow until you confirm delivery.
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/products" className="btn btn-light btn-lg">
              <i className="fa fa-store me-2" /> Browse Products
            </Link>
            <Link to="/vendors" className="btn btn-outline-light btn-lg">
              <i className="fa fa-store-front me-2" /> Explore Vendors
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <CategoryScroller />
      </div>

      {/* New Arrivals */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 fw-bold">New Arrivals</h4>
          <Link to="/products?sort=newest" className="btn btn-outline-dark btn-sm">
            View all <i className="fa fa-arrow-right ms-1" />
          </Link>
        </div>
        <ProductGrid 
          endpoint={API_ENDPOINTS.products.new}
          emptyMessage="No new products available yet."
        />
      </div>

      {/* Popular Products */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 fw-bold">Popular Right Now</h4>
          <Link to="/products?sort=popular" className="btn btn-outline-dark btn-sm">
            View all <i className="fa fa-arrow-right ms-1" />
          </Link>
        </div>
        <ProductGrid 
          endpoint={API_ENDPOINTS.products.popular}
          emptyMessage="No popular products to show."
        />
      </div>

      {/* Featured Vendors */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 fw-bold">Featured Vendors</h4>
          <Link to="/vendors" className="btn btn-outline-dark btn-sm">
            See more <i className="fa fa-arrow-right ms-1" />
          </Link>
        </div>
        {loadingVendors ? (
          <LoadingSpinner />
        ) : errorVendors ? (
          <EmptyState 
            title="Couldn't load vendors" 
            subtitle={errorVendors}
            icon="fa-store-slash"
          />
        ) : vendors.length === 0 ? (
          <EmptyState 
            title="No featured vendors yet" 
            subtitle="Check back soon for featured vendors."
            icon="fa-store-slash"
          />
        ) : (
          <div className="row g-3">
            {vendors.slice(0, 8).map((vendor) => (
              <div className="col-6 col-md-4 col-lg-3" key={vendor.id}>
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}