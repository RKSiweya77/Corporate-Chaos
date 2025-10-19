// src/pages/Products.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints"; // consistent named import
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

  // push current filters to the URL (debounced)
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

  // fetch params for backend
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

  // categories
  useEffect(() => {
    let alive = true;
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        // support either .all or direct categories endpoint
        const res = await api.get(API_ENDPOINTS.categories?.all || API_ENDPOINTS.categories);
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

  // products
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
    <div className="products-theme">
      <style>{`
        /* ================= Dock-style tokens ================= */
        .products-theme {
          --bg: #0b0614;
          --panel: #0b0614;
          --panel-soft: #100a1f;
          --panel-border: #1f1932;
          --text: #e7e6ea;
          --text-muted: #bfb9cf;
          --chip-bg: rgba(255,255,255,.06);
          --control-bg: #0f0a1d;
          --control-border: #2b2444;
          --control-focus: #3b315e;
          --outline: rgba(0,0,0,.9);
          --shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
        }
        :where([data-theme="light"], html.light, body.light, .light) .products-theme {
          --bg: #f5f7fb;
          --panel: #ffffff;
          --panel-soft: #ffffff;
          --panel-border: #e6e8f1;
          --text: #16161a;
          --text-muted: #6b6f7d;
          --chip-bg: rgba(0,0,0,.04);
          --control-bg: #ffffff;
          --control-border: #dfe3ef;
          --control-focus: #cfd8f6;
          --outline: rgba(0,0,0,1);
          --shadow: 0 10px 24px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6);
        }

        .products-theme { background: var(--bg); color: var(--text); }
        .text-muted { color: var(--text-muted) !important; }

        /* Panels (cards) */
        .p-panel {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 14px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .p-panel-header {
          background: var(--panel);
          border-bottom: 1px solid var(--panel-border);
          color: var(--text);
        }

        /* Controls */
        .p-control, .p-select {
          background: var(--control-bg) !important;
          color: var(--text) !important;
          border: 1px solid var(--control-border) !important;
        }
        .p-control::placeholder { color: color-mix(in oklab, var(--text) 60%, transparent) }
        .p-control:focus, .p-select:focus {
          border-color: var(--control-focus) !important;
          box-shadow: none !important;
          outline: 2px solid var(--outline);
          outline-offset: 0;
        }

        /* Outline buttons that adapt */
        .btn-outline-secondary, .btn-outline-dark {
          --bs-btn-color: var(--text);
          --bs-btn-border-color: var(--control-border);
          --bs-btn-hover-bg: var(--panel-soft);
          --bs-btn-hover-color: var(--text);
          --bs-btn-hover-border-color: var(--control-border);
          --bs-btn-active-bg: var(--panel-soft);
          --bs-btn-active-border-color: var(--control-border);
        }

        /* Top sort bar panel */
        .p-toolbar { background: var(--panel); border: 1px solid var(--panel-border); border-radius: 14px; box-shadow: var(--shadow); }

      `}</style>

      <div className="container py-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 fw-bold mb-1" style={{ color: "var(--text)" }}>Products</h1>
                <p className="text-muted mb-0">
                  Discover amazing products with escrow protection
                </p>
              </div>
              <div className="text-end d-none d-md-block">
                <small className="text-muted">
                  {!loading && `${products.length} product${products.length !== 1 ? "s" : ""} found`}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-12 col-lg-3">
            <div className="p-panel">
              <div className="p-panel-header px-3 py-2">
                <h6 className="mb-0 fw-bold">
                  <i className="fa fa-filter me-2" />
                  Filters
                </h6>
              </div>
              <div className="px-3 py-3">
                {/* Search */}
                <div className="mb-3">
                  <label htmlFor="search" className="form-label small fw-bold" style={{ color: "var(--text)" }}>
                    Search Products
                  </label>
                  <input
                    id="search"
                    className="form-control p-control"
                    placeholder="Type to search..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label htmlFor="category" className="form-label small fw-bold" style={{ color: "var(--text)" }}>
                    Category
                  </label>
                  <select
                    id="category"
                    className="form-select p-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loadingCategories}
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-3">
                  <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
                    Price Range
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control p-control"
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
                        className="form-control p-control"
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
            <div className="p-toolbar mb-4">
              <div className="px-3 py-2">
                <div className="row align-items-center">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <small className="text-muted d-md-none">
                      {!loading && `${products.length} product${products.length !== 1 ? "s" : ""}`}
                    </small>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <select
                      className="form-select form-select-sm p-select w-auto d-inline-block"
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
              <div className="row g-3">
                {products.map((product) => (
                  <div className="col-6 col-md-4 col-xl-3" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* spacing so the bottom dock never overlaps */}
        <div style={{ height: 96 }} />
      </div>
    </div>
  );
}