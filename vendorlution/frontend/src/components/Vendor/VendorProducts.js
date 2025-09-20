// components/Vendor/VendorProducts.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.png";

function VendorProducts() {
  const [products, setProducts] = useState([
    { id: 1, title: "Wireless Headphones", price: 1200, image: logo },
    { id: 2, title: "Smart Watch", price: 1500, image: logo },
  ]);

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Products</h3>
        <Link to="/vendor/add-product" className="btn btn-dark">
          <i className="fa fa-plus me-2"></i>Add Product
        </Link>
      </div>

      <div className="row g-4">
        {products.map((p) => (
          <div key={p.id} className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <img
                src={p.image}
                alt={p.title}
                className="card-img-top"
                style={{ height: "180px", objectFit: "cover" }}
              />
              <div className="card-body text-center">
                <h6 className="fw-bold">{p.title}</h6>
                <p className="text-muted">R {p.price}</p>
              </div>
              <div className="card-footer d-flex justify-content-between bg-light">
                <Link to={`/product/${p.id}`} className="btn btn-sm btn-outline-dark">
                  <i className="fa fa-eye me-1"></i>View
                </Link>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteProduct(p.id)}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-muted py-5">
            No products listed yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorProducts;
