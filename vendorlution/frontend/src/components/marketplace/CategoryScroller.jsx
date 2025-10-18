// src/components/marketplace/CategoryScroller.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";

export default function CategoryScroller() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.categories.featured);
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setCategories(data);
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err.message);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    loadCategories();
    return () => (alive = false);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || categories.length === 0) {
    return null; // Hide category section if no categories or error
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0 fw-bold">Shop by Category</h4>
        <Link to="/products" className="btn btn-outline-dark btn-sm">
          All categories <i className="fa fa-arrow-right ms-1" />
        </Link>
      </div>
      <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.slug || category.id}`}
            className="flex-shrink-0 text-decoration-none"
          >
            <div className="card border-0 shadow-sm-hover" style={{ width: "140px" }}>
              <div className="card-body text-center p-3">
                <div className="mb-2">
                  <i className={`fa ${category.icon || "fa-tag"} fa-2x text-muted`} />
                </div>
                <h6 className="card-title mb-0 text-dark small">{category.name}</h6>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}