// src/pages/Products.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints"; // ← FIXED: Remove { } since it's default export
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductCard from "../components/marketplace/ProductCard";


export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const price = useMemo(() => {
    if (!product) return 0;
    // tolerate different field names from backend
    return Number(product.price ?? product.unit_price ?? product.amount ?? 0);
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(API_ENDPOINTS.products.detail(id));
        if (!cancelled) setProduct(res.data);
      } catch (e) {
        if (!cancelled) setError("Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onAddToCart = async () => {
    if (!id || qty < 1) return;
    try {
      setAdding(true);
      await api.post(API_ENDPOINTS.cart.addItem, {
        product_id: Number(id),
        quantity: Number(qty),
      });
      nav("/cart");
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to add to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <EmptyState title="Product not found" subtitle={error} />;
  if (!product) return <EmptyState title="Product not found" />;

  const img = getProductImage(product);
  const title =
    product.title || product.name || `Product #${product.id || id}`;
  const vendor =
    product.vendor?.shop_name ||
    product.vendor?.name ||
    product.vendor_name ||
    null;

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              {img ? (
                <img
                  src={img}
                  alt={title}
                  className="responsive-img"
                  style={{ maxHeight: 420, objectFit: "contain", width: "100%" }}
                />
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fa fa-image fa-2x mb-2" />
                  <div>No image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="fw-bold mb-2">{title}</h3>
              {vendor && (
                <div className="mb-2 text-muted">
                  Sold by <strong className="text-dark">{vendor}</strong>
                </div>
              )}

              <div className="fs-4 fw-bold my-3">
                {ZAR} {formatCurrency(price)}
              </div>

              {product.description && (
                <p className="text-muted">{product.description}</p>
              )}

              <div className="d-flex align-items-center gap-2 my-3">
                <label htmlFor="qty" className="form-label mb-0">
                  Qty
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="form-control"
                  style={{ width: 100 }}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-dark"
                  disabled={adding}
                  onClick={onAddToCart}
                >
                  {adding ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <i className="fa fa-cart-plus me-2" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  className="btn btn-outline-dark"
                  onClick={() => nav(-1)}
                  type="button"
                >
                  Back
                </button>
              </div>

              {/* simple meta grid */}
              <div className="mt-4">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="p-2 bg-light rounded">
                      <small className="text-muted d-block">Category</small>
                      <div>
                        {product.category?.name ||
                          product.category_name ||
                          "—"}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-light rounded">
                      <small className="text-muted d-block">Stock</small>
                      <div>
                        {product.stock ?? product.quantity ?? product.inventory ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /meta */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}