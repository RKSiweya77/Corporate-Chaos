// src/pages/Products.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints"; // <-- make consistent
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductCard from "../components/marketplace/ProductCard";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [q, setQ] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [ordering, setOrdering] = useState(searchParams.get("sort") || "");
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("min_price") || "",
    max: searchParams.get("max_price") || "",
  });

  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams();
      if (q) newParams.set("search", q);
      if (category) newParams.set("category", category);
      if (ordering) newParams.set("sort", ordering);
      if (priceRange.min) newParams.set("min_price", priceRange.min);
      if (priceRange.max) newParams.set("max_price", priceRange.max);
      setSearchParams(newParams);
    }, 500);
    return () => clearTimeout(timer);
  }, [q, category, ordering, priceRange, setSearchParams]);

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const params = useMemo(() => {
    const p = {};
    if (q) p.search = q;
    if (category) p.category = category;
    if (ordering) p.ordering = ordering;
    if (priceRange.min) p.min_price = priceRange.min;
    if (priceRange.max) p.max_price = priceRange.max;
    p.page_size = 24;
    return p;
  }, [q, category, ordering, priceRange]);

  useEffect(() => {
    let alive = true;
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await api.get(API_ENDPOINTS.categories.all);
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setCategories(data);
      } catch (err) {
        if (!alive) return;
        console.error("Failed to load categories:", err);
      } finally {
        if (!alive) return;
        setLoadingCategories(false);
      }
    }
    loadCategories();
    return () => (alive = false);
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.products.list, { params });
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setProducts(data);
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err.message || "Failed to load products. Please try again.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    loadProducts();
    return () => (alive = false);
  }, [params]);

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setOrdering("");
    setPriceRange({ min: "", max: "" });
    setSearchParams({});
  };

  const hasActiveFilters = q || category || ordering || priceRange.min || priceRange.max;

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold mb-1">Products</h1>
              <p className="text-muted mb-0">
                Discover amazing products with escrow protection
              </p>
            </div>
            <div className="text-end d-none d-md-block">
              <small className="text-muted">
                {!loading &&
                  `${products.length} product${products.length !== 1 ? "s" : ""} found`}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Filters Sidebar */}
        <div className="col-12 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-filter me-2" />
                Filters
              </h6>
            </div>
            <div className="card-body">
              {/* Search */}
              <div className="mb-3">
                <label htmlFor="search" className="form-label small fw-bold">
                  Search Products
                </label>
                <input
                  id="search"
                  className="form-control"
                  placeholder="Type to search..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label htmlFor="category" className="form-label small fw-bold">
                  Category
                </label>
                <select
                  id="category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loadingCategories}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Price Range</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                  <i className="fa fa-times me-2" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-12 col-lg-9">
          <div className="card mb-4">
            <div className="card-body py-2">
              <div className="row align-items-center">
                <div className="col-md-6 mb-2 mb-md-0">
                  <small className="text-muted d-md-none">
                    {!loading &&
                      `${products.length} product${products.length !== 1 ? "s" : ""}`}
                  </small>
                </div>
                <div className="col-md-6 text-md-end">
                  <select
                    className="form-select form-select-sm w-auto d-inline-block"
                    value={ordering}
                    onChange={(e) => setOrdering(e.target.value)}
                  >
                    <option value="">Sort: Featured</option>
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-popularity">Most Popular</option>
                    <option value="title">Name: A to Z</option>
                    <option value="-title">Name: Z to A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner fullPage message="Loading products..." />
          ) : error ? (
            <EmptyState
              title="Unable to load products"
              subtitle={error}
              icon="fa-exclamation-triangle"
              action={
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  <i className="fa fa-refresh me-2" />
                  Try Again
                </button>
              }
            />
          ) : products.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "No products match your filters" : "No products available"}
              subtitle={
                hasActiveFilters ? "Try adjusting your search or filters" : "Check back soon for new products"
              }
              icon="fa-search"
              action={
                hasActiveFilters && (
                  <button className="btn btn-outline-dark" onClick={clearFilters}>
                    <i className="fa fa-times me-2" />
                    Clear All Filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="row g-3">
                {products.map((product) => (
                  <div className="col-6 col-md-4 col-xl-3" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}