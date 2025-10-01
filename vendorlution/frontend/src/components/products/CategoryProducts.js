// components/products/CategoryProducts.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function CategoryProducts() {
  const { category_id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`products/?category=${category_id}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching category products:", err));
  }, [category_id]);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Products in Category</h3>
      <div className="row g-3">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="col-md-3 col-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h6 className="fw-bold">{p.title}</h6>
                  <p className="text-muted small">R {p.price}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No products found in this category.</p>
        )}
      </div>
    </div>
  );
}

export default CategoryProducts;
