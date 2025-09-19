// src/components/products/AllProducts.js
import ProductCard from "../Homepage/ProductCard";
import Pagination from "../shared/Pagination";

function AllProducts() {
  return (
    <main className="mt-4">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <h3 className="mb-2 mb-md-0">All Products</h3>
          <div className="d-flex align-items-center">
            <span className="me-2 text-muted small">Sort by:</span>
            <select className="form-select form-select-sm">
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="row g-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCard key={i} title={`Product ${i + 1}`} price={1000 + i * 100} />
          ))}
        </div>

        <Pagination />
      </div>
    </main>
  );
}

export default AllProducts;
