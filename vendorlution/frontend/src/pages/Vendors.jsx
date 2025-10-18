// src/pages/Vendors.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import VendorCard from "../components/marketplace/VendorCard";

export default function Vendors() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState("");
  
  // Filter states
  const [q, setQ] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");

  // Debounced search
  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams();
      if (q) newParams.set("search", q);
      if (sortBy) newParams.set("sort", sortBy);
      if (verifiedOnly) newParams.set("verified", "true");
      setSearchParams(newParams);
    }, 500);
    return () => clearTimeout(timer);
  }, [q, sortBy, verifiedOnly, setSearchParams]);

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  // API parameters
  const params = useMemo(() => {
    const p = {};
    if (q) p.search = q;
    if (sortBy) p.ordering = sortBy;
    if (verifiedOnly) p.verified = true;
    p.page_size = 24;
    return p;
  }, [q, sortBy, verifiedOnly]);

  // Load vendors
  useEffect(() => {
    let alive = true;
    async function loadVendors() {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.vendors.list, { params });
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setVendors(data);
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err.message || "Failed to load vendors. Please try again.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    loadVendors();
    return () => (alive = false);
  }, [params]);

  // Clear filters
  const clearFilters = () => {
    setQ("");
    setSortBy("");
    setVerifiedOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = q || sortBy || verifiedOnly;

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold mb-1">Vendors</h1>
              <p className="text-muted mb-0">
                Shop from trusted vendors with escrow protection
              </p>
            </div>
            <div className="text-end d-none d-md-block">
              <small className="text-muted">
                {!loading && `${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} found`}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Filters */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                {/* Search */}
                <div className="col-12 col-md-4 col-lg-5">
                  <label htmlFor="vendorSearch" className="form-label small fw-bold">
                    Search Vendors
                  </label>
                  <input
                    id="vendorSearch"
                    className="form-control"
                    placeholder="Search by vendor name..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                {/* Sort */}
                <div className="col-6 col-md-3 col-lg-3">
                  <label htmlFor="vendorSort" className="form-label small fw-bold">
                    Sort By
                  </label>
                  <select
                    id="vendorSort"
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">Featured</option>
                    <option value="name">Name: A to Z</option>
                    <option value="-name">Name: Z to A</option>
                    <option value="-rating">Highest Rated</option>
                    <option value="-product_count">Most Products</option>
                    <option value="-created_at">Newest First</option>
                  </select>
                </div>

                {/* Verified Filter */}
                <div className="col-6 col-md-3 col-lg-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="verifiedOnly"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
                    <label className="form-check-label small fw-bold" htmlFor="verifiedOnly">
                      Verified Only
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="col-12 col-md-2 col-lg-2">
                  {hasActiveFilters && (
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={clearFilters}
                    >
                      <i className="fa fa-times me-2" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="col-12">
          {loading ? (
            <LoadingSpinner fullPage message="Loading vendors..." />
          ) : error ? (
            <EmptyState 
              title="Unable to load vendors" 
              subtitle={error}
              icon="fa-exclamation-triangle"
              action={
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fa fa-refresh me-2" />
                  Try Again
                </button>
              }
            />
          ) : vendors.length === 0 ? (
            <EmptyState 
              title={hasActiveFilters ? "No vendors match your search" : "No vendors available"}
              subtitle={hasActiveFilters ? "Try adjusting your search criteria" : "Check back soon for new vendors"}
              icon="fa-store-slash"
              action={hasActiveFilters && (
                <button 
                  className="btn btn-outline-dark"
                  onClick={clearFilters}
                >
                  <i className="fa fa-times me-2" />
                  Clear Filters
                </button>
              )}
            />
          ) : (
            <>
              {/* Vendor Stats Bar */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card bg-light">
                    <div className="card-body py-3">
                      <div className="row text-center">
                        <div className="col-4 col-md-2">
                          <div className="h5 fw-bold text-primary mb-1">{vendors.length}</div>
                          <small className="text-muted">Total Vendors</small>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="h5 fw-bold text-success mb-1">
                            {vendors.filter(v => v.verified).length}
                          </div>
                          <small className="text-muted">Verified</small>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="h5 fw-bold text-warning mb-1">
                            {vendors.filter(v => v.featured).length}
                          </div>
                          <small className="text-muted">Featured</small>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="h5 fw-bold text-info mb-1">
                            {vendors.reduce((sum, v) => sum + (v.product_count || 0), 0)}
                          </div>
                          <small className="text-muted">Total Products</small>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="h5 fw-bold text-dark mb-1">
                            {vendors.length > 0 ? 
                              (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1) 
                              : '0.0'
                            }/5
                          </div>
                          <small className="text-muted">Average Rating</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Grid */}
              <div className="row g-3">
                {vendors.map((vendor) => (
                  <div className="col-6 col-md-4 col-lg-3" key={vendor.id}>
                    <VendorCard vendor={vendor} />
                  </div>
                ))}
              </div>

              {/* Become a Vendor CTA */}
              <div className="row mt-5">
                <div className="col-12">
                  <div className="card bg-dark text-white">
                    <div className="card-body text-center p-4">
                      <h5 className="card-title mb-3">Become a Vendor</h5>
                      <p className="card-text mb-3 opacity-75">
                        Join our marketplace and start selling with escrow protection today.
                      </p>
                      <Link to="/vendor/register" className="btn btn-light">
                        <i className="fa fa-store me-2" />
                        Start Selling
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}