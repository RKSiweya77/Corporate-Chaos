import React from "react";
import ProductGridSection from "../Homepage/ProductGridSection";

export default function NewArrivals() {
  return (
    <ProductGridSection
      title="New Arrivals"
      endpoint="/products/new/?limit=12"
      linkTo="/products"
      count={12}
    />
  );
}
