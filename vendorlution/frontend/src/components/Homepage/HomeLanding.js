import React from "react";
import CategoryScroller from "./CategoryScroller";
import FeaturedVendors from "./FeaturedVendors";
import NewArrivals from "../products/NewArrivals";
import PopularProducts from "../products/PopularProducts";

export default function HomeLanding() {
  return (
    <main className="container py-4">
      {/* Hero / Banner area could go here */}

      {/* Categories */}
      <CategoryScroller />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Popular Products */}
      <PopularProducts />

      {/* Featured Vendors */}
      <FeaturedVendors />
    </main>
  );
}
