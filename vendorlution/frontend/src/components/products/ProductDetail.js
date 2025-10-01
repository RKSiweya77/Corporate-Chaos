// components/products/ProductDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function ProductDetail() {
  const { product_id } = useParams(); // matches /product/:product_slug/:product_id
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`product/${product_id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error fetching product:", err));
  }, [product_id]);

  if (!product) {
    return <div className="container py-4">Loading product...</div>;
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold">{product.title}</h3>
      <p className="text-muted">{product.detail}</p>
      <h5 className="text-success">R {product.price}</h5>
      <p><strong>Category:</strong> {product.category?.title}</p>
      <p><strong>Vendor:</strong> {product.vendor?.user?.username}</p>

      <button className="btn btn-dark me-2">
        <i className="fa fa-cart-plus me-1"></i>Add to Cart
      </button>
      <button className="btn btn-outline-danger">
        <i className="fa fa-heart me-1"></i>Add to Wishlist
      </button>
    </div>
  );
}

export default ProductDetail;
