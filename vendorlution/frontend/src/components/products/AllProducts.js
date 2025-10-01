// components/products/AllProducts.js
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function AllProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <div className="container py-4">
      <h3 className="mb-4">All Products</h3>
      <div className="row g-3">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="col-md-3 col-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h6 className="fw-bold">{p.title}</h6>
                  <p className="text-muted small">R {p.price}</p>
                  <p className="small">{p.detail}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No products available.</p>
        )}
      </div>
    </div>
  );
}

export default AllProducts;
