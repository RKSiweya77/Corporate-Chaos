// src/components/marketplace/ProductGrid.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import ProductCard from "./ProductCard";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";

export default function ProductGrid({ endpoint, emptyMessage = "No products found." }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await api.get(endpoint);
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setProducts(data);
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err.message || "Failed to load products.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    loadProducts();
    return () => (alive = false);
  }, [endpoint]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState 
        title="Something went wrong" 
        subtitle={error}
        icon="fa-exclamation-triangle"
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState 
        title={emptyMessage}
        icon="fa-search"
      />
    );
  }

  return (
    <div className="row g-3">
      {products.map((product) => (
        <div className="col-6 col-md-4 col-lg-3" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}