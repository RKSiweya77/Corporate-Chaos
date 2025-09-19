import { useParams } from "react-router-dom";
import ProductCard from "../Homepage/ProductCard";
import Pagination from "../shared/Pagination";

function CategoryProducts() {
  const { category_slug } = useParams();

  return (
    <main className="mt-4">
      <div className="container">
        <div className="row">
          {/* Sidebar Filters */}
          <aside className="col-lg-3 col-12 mb-3">
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-body">
                <h5 className="card-title">Filters</h5>

                {/* Price Range */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Price</label>
                  <input
                    type="range"
                    className="form-range"
                    min="100"
                    max="10000"
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>R100</span>
                    <span>R10,000+</span>
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Condition</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="new" />
                    <label className="form-check-label" htmlFor="new">
                      New
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="used" />
                    <label className="form-check-label" htmlFor="used">
                      Used
                    </label>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="form-label fw-semibold">Availability</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="inStock" />
                    <label className="form-check-label" htmlFor="inStock">
                      In Stock
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="outStock" />
                    <label className="form-check-label" htmlFor="outStock">
                      Out of Stock
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="col-lg-9 col-12">
            {/* Header + Sort */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
              <h3 className="mb-2 mb-md-0 text-capitalize">
                {category_slug.replace("-", " ")}
              </h3>
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

            {/* Product Grid */}
            <div className="row g-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCard
                  key={i}
                  title={`Product ${i + 1}`}
                  price={1000 + i * 100}
                  slug={`product-${i + 1}`}
                />
              ))}
            </div>

            <Pagination />
          </section>
        </div>
      </div>
    </main>
  );
}

export default CategoryProducts;
