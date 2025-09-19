import { useParams, Link } from "react-router-dom";
import logo from "../../logo.svg"; // placeholder image
import ProductCard from "../Homepage/ProductCard";

function ProductDetail() {
  const { product_slug, product_id } = useParams();

  // Mock product (replace with API later)
  const product = {
    id: product_id,
    title: "Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and long battery life.",
    price: 1200,
    condition: "New",
    stock: 10,
    vendor: {
      id: 1,
      name: "TechWorld Store",
      slug: "techworld",
    },
    image: logo,
  };

  return (
    <main className="mt-4">
      <div className="container">
        <div className="row">
          {/* Product Image */}
          <div className="col-md-6 mb-3">
            <img
              src={product.image}
              alt={product.title}
              className="img-fluid rounded shadow-sm"
            />
          </div>

          {/* Product Info */}
          <div className="col-md-6 mb-3">
            <h2 className="fw-bold">{product.title}</h2>
            <p className="text-muted">{product.description}</p>
            <h4 className="text-success">R {product.price}</h4>
            <p>
              <span className="badge bg-info text-dark">
                {product.condition}
              </span>{" "}
              | Stock: {product.stock}
            </p>

            <div className="d-flex gap-2 mb-3">
              <button className="btn btn-dark">
                <i className="fa fa-cart-plus me-1"></i> Add to Cart
              </button>
              <button className="btn btn-outline-danger">
                <i className="fa fa-heart me-1"></i> Wishlist
              </button>
            </div>

            {/* ✅ Vendor info with link to VendorStore */}
            <div className="card border-0 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <img
                  src={logo}
                  alt={product.vendor.name}
                  className="rounded-circle me-3"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div>
                  <h6 className="mb-0">{product.vendor.name}</h6>
                  <Link
                    to={`/vendor/store/${product.vendor.slug}/${product.vendor.id}`}
                    className="small text-decoration-none"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products (mock) */}
        <div className="mt-5">
          <h4>Related Products</h4>
          <div className="row g-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="col-6 col-md-3">
                <ProductCard
                  title={`Related ${i + 1}`}
                  price={900 + i * 50}
                  slug={`related-${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
