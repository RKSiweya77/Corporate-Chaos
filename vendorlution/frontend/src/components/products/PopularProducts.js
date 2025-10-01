import React from "react";
import ProductGridSection from "../Homepage/ProductGridSection";

export default function PopularProducts() {
  // Backend returns popular first at /api/products/popular/?limit=12
  return (
    <ProductGridSection
      title="Popular Products"
      endpoint="/products/popular/?limit=12"
      linkTo="/products"
      count={12}
    />
  );
}
