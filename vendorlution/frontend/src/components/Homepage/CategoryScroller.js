import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function CategoryScroller() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api
      .get("/categories/all/")
      .then((res) => setCats(Array.isArray(res.data) ? res.data : []))
      .catch((e) => console.error("Categories fetch error:", e));
  }, []);

  if (!cats.length) return null;

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h5 className="mb-0">Shop by Category</h5>
        <Link to="/categories" className="btn btn-sm btn-outline-dark">
          View all
        </Link>
      </div>
      <div className="d-flex flex-row gap-2 overflow-auto pb-2">
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/category/${encodeURIComponent(c.slug || c.title)}/${c.id}`}
            className="badge text-bg-light border rounded-pill px-3 py-2 text-decoration-none"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
