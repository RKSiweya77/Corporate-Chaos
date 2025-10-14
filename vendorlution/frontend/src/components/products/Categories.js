import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Use the non-paginated endpoint to simplify
    api
      .get("/categories/all/")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Categories</h3>
      <div className="row g-3">
        {categories.length > 0 ? (
          categories.map((c) => (
            <div key={c.id} className="col-md-3 col-6">
              <Link
                to={`/category/${c.slug || c.title.toLowerCase().replace(/\s+/g, "-")}/${c.id}`}
                className="card text-center text-decoration-none shadow-sm border-0 h-100"
              >
                <div className="card-body">
                  <h6 className="fw-bold">{c.title}</h6>
                  {!!c.detail && <p className="text-muted small">{c.detail}</p>}
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-muted">No categories found.</p>
        )}
      </div>
    </div>
  );
}
