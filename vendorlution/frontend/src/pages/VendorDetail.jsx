// src/pages/VendorDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints"; // ← FIXED: Remove { } since it's default export
import { toMediaUrl } from "../utils/media"; // ← FIXED: This should work now
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductCard from "../components/marketplace/ProductCard";

export default function VendorDetail() {
  const { id } = useParams(); // could be numeric id or slug, depending on route usage
  const nav = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingVendor, setLoadingVendor] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  const isNumericId = useMemo(() => /^\d+$/.test(String(id || "")), [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadVendor() {
      setLoadingVendor(true);
      setError("");
      try {
        // FIXED: Use the correct endpoint format from API_ENDPOINTS
        const url = API_ENDPOINTS.vendors.detail(id);
        const res = await api.get(url);
        if (!cancelled) setVendor(res.data);
      } catch (e) {
        if (!cancelled) {
          setError("Vendor not found.");
          setVendor(null);
        }
      } finally {
        if (!cancelled) setLoadingVendor(false);
      }
    }

    if (id) loadVendor();
    return () => {
      cancelled = true;
    };
  }, [id, isNumericId]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts(vendorId) {
      setLoadingProducts(true);
      try {
        // FIXED: Use the correct endpoint and parameter name
        const res = await api.get(API_ENDPOINTS.products.list, {
          params: { vendor: vendorId },
        });
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        if (!cancelled) setProducts(list);
      } catch (e) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    if (vendor?.id) loadProducts(vendor.id);
    return () => {
      cancelled = true;
    };
  }, [vendor?.id]);

  if (loadingVendor) return <LoadingSpinner fullPage />;

  if (error || !vendor) {
    return (
      <div className="container py-4">
        <EmptyState title="Vendor not found" subtitle={error || "We couldn't locate this shop."} />
        <button className="btn btn-outline-dark mt-3" onClick={() => nav(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const banner = vendor.banner ? toMediaUrl(vendor.banner) : null;
  const logo = vendor.logo ? toMediaUrl(vendor.logo) : null;
  const shopName = vendor.shop_name || vendor.name || `Vendor #${vendor.id}`;
  const productCount = vendor.product_count ?? products.length ?? 0;

  return (
    <div className="container py-4">
      {/* Banner */}
      <div className="card shadow-sm mb-3">
        <div className="card-body p-0">
          {banner ? (
            <img
              src={banner}
              alt={`${shopName} banner`}
              className="img-fluid"
              style={{ width: "100%", maxHeight: "260px", objectFit: "cover" }}
            />
          ) : (
            <div className="p-5 text-center text-muted">No banner</div>
          )}
        </div>
      </div>

      {/* Vendor header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-light d-flex align-items-center justify-content-center"
            style={{ width: "80px", height: "80px", overflow: "hidden", flexShrink: 0 }}
          >
            {logo ? (
              <img
                src={logo}
                alt={`${shopName} logo`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <i className="fa fa-store fa-2x text-muted" />
            )}
          </div>

          <div className="flex-grow-1">
            <h3 className="fw-bold mb-1">{shopName}</h3>
            {vendor.description && (
              <div className="text-muted">{vendor.description}</div>
            )}
            <div className="small text-muted mt-2">
              <span className="me-3">Products: <strong>{productCount}</strong></span>
              {vendor.created_at && (
                <span className="me-3">Joined: {new Date(vendor.created_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <Link to="/products" className="btn btn-outline-dark">Browse all products</Link>
        </div>
      </div>

      {/* Products */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">Products from {shopName}</h5>
        {!loadingProducts && (
          <span className="text-muted small">{products.length} item(s)</span>
        )}
      </div>

      {loadingProducts ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          subtitle="This vendor hasn't listed any products."
        />
      ) : (
        <div className="row g-3">
          {products.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}