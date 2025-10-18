import { useEffect, useState } from "react";

export default function SearchFilters({ 
  initial = {}, 
  onChange, 
  onReset,
  categories = [] 
}) {
  const [filters, setFilters] = useState({
    q: initial.q || "",
    min: initial.min || "",
    max: initial.max || "",
    ordering: initial.ordering || "",
    category: initial.category || ""
  });

  useEffect(() => {
    setFilters({
      q: initial.q || "",
      min: initial.min || "",
      max: initial.max || "",
      ordering: initial.ordering || "",
      category: initial.category || ""
    });
  }, [initial]);

  const handleApply = () => {
    onChange?.({
      q: filters.q.trim(),
      min: filters.min ? Number(filters.min) : "",
      max: filters.max ? Number(filters.max) : "",
      ordering: filters.ordering,
      category: filters.category
    });
  };

  const handleReset = () => {
    const resetFilters = {
      q: "", min: "", max: "", ordering: "", category: ""
    };
    setFilters(resetFilters);
    onReset?.();
    onChange?.(resetFilters);
  };

  return (
    <div className="card mb-4 border-0 shadow-sm">
      <div className="card-body">
        <h6 className="card-title mb-3 fw-semibold">
          <i className="fas fa-filter me-2 text-primary"></i>
          Search & Filters
        </h6>

        <div className="row g-3 align-items-end">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Search Products</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="What are you looking for?"
                value={filters.q}
                onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="col-6 col-md-2">
            <label className="form-label fw-semibold">Min Price</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">R</span>
              <input
                type="number"
                className="form-control border-start-0"
                placeholder="0"
                min="0"
                value={filters.min}
                onChange={(e) => setFilters(prev => ({ ...prev, min: e.target.value }))}
              />
            </div>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label fw-semibold">Max Price</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">R</span>
              <input
                type="number"
                className="form-control border-start-0"
                placeholder="1000"
                min="0"
                value={filters.max}
                onChange={(e) => setFilters(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold">Sort By</label>
            <select
              className="form-select"
              value={filters.ordering}
              onChange={(e) => setFilters(prev => ({ ...prev, ordering: e.target.value }))}
            >
              <option value="">Relevance</option>
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Highest Rated</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="col-12 col-md-2 d-grid">
            <button 
              className="btn btn-primary" 
              onClick={handleApply}
            >
              <i className="fas fa-check me-1"></i>
              Apply
            </button>
          </div>

          <div className="col-12 col-md-1 d-grid">
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleReset}
              title="Reset all filters"
            >
              <i className="fas fa-undo"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}