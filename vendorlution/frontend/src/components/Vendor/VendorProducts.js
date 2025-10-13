// src/components/Vendor/VendorProducts.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function VendorProducts() {
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [error, setError] = useState("");

  // Build absolute media URL for product images
  const toImg = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // api.defaults.baseURL is like http://127.0.0.1:8000/api
    const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
    return `${apiRoot}${path}`;
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Who am I? (get vendor_id)
        const me = await api.get("/auth/me/");
        const vid = me?.data?.vendor_id || null;
        if (!alive) return;
        setVendorId(vid);

        // 2) Load products (public list)
        const res = await api.get("/products/?ordering=-created_at");
        if (!alive) return;
        setAllProducts(Array.isArray(res.data?.results) ? res.data.results : res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your products.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Only my shop’s products
  const products = useMemo(() => {
    if (!vendorId) return [];
    return (allProducts || []).filter((p) => {
      // ProductListSerializer typically nests vendor like { id, shop_name, ... }
      const pid = p?.vendor?.id ?? p?.vendor; // handle cases where serializer returns just the id
      return String(pid) === String(vendorId);
    });
  }, [allProducts, vendorId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center text-muted">Loading your products…</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">My Products</h3>
        <Link to="/vendor/add-product" className="btn btn-dark">
          <i className="fa fa-plus me-2" />
          Add Product
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {products.length === 0 ? (
        <div className="text-center text-muted py-5">
          You haven’t listed any products yet.
          <div className="mt-3">
            <Link to="/vendor/add-product" className="btn btn-sm btn-dark">
              Add your first product
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((p) => (
            <div key={p.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <img
                  src={toImg(p.image)}
                  alt={p.title}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover" }}
                />
                <div className="card-body">
                  <h6 className="fw-bold mb-1">{p.title}</h6>
                  <div className="small text-muted mb-2">
                    {p.category?.title ?? ""}
                  </div>
                  <div className="fw-semibold">R {Number(p.price).toFixed(2)}</div>
                </div>
                <div className="card-footer d-flex justify-content-between bg-light">
                  <Link to={`/product/${p.id}`} className="btn btn-sm btn-outline-dark">
                    <i className="fa fa-eye me-1" />
                    View
                  </Link>

                  {/* Placeholder for future actions (edit/delete) */}
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary" disabled title="Coming soon">
                      <i className="fa fa-pen" />
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" disabled title="Coming soon">
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorProducts;
