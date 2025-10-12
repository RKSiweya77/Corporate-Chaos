import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function VendorPublicProfile() {
  const { vendor_id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingP, setLoadingP] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingV(true);
        const r = await api.get(`/vendors/${vendor_id}/`);
        if (!alive) return;
        setVendor(r.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoadingV(false);
      }
    })();
    return () => (alive = false);
  }, [vendor_id]);

  // We don’t have a vendor-filtered products endpoint on the backend yet.
  // Workaround: pull a page of products and filter by vendor.id client-side.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingP(true);
        const r = await api.get(`/products/?ordering=-created_at`);
        if (!alive) return;
        const data = r.data.results || r.data;
        const filtered = (data || []).filter((p) => p?.vendor?.id === Number(vendor_id));
        setProducts(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoadingP(false);
      }
    })();
    return () => (alive = false);
  }, [vendor_id]);

  const bannerEl = useMemo(() => {
    if (!vendor?.banner) return null;
    return (
      <img
        src={vendor.banner}
        alt={vendor.shop_name}
        className="img-fluid rounded mb-3"
        style={{ maxHeight: 260, objectFit: "cover", width: "100%" }}
      />
    );
  }, [vendor]);

  if (loadingV) return <div className="container py-5">Loading vendor...</div>;
  if (!vendor) return <div className="container py-5">Vendor not found.</div>;

  return (
    <div className="container py-5">
      {bannerEl}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="fw-bold mb-0">{vendor.shop_name}</h3>
        <div className="text-muted">Rating: {vendor.rating_avg} ★</div>
      </div>
      <p className="text-muted">{vendor.description}</p>

      <hr className="my-4" />

      <h5 className="fw-semibold mb-3">Products</h5>
      {loadingP ? (
        <div>Loading products…</div>
      ) : products.length === 0 ? (
        <div className="alert alert-info">No products from this vendor yet.</div>
      ) : (
        <div className="row g-3">
          {products.map((p) => (
            <div className="col-md-4" key={p.id}>
              <div className="card h-100 shadow-sm">
                {p.main_image && (
                  <img
                    src={p.main_image}
                    alt={p.title}
                    className="card-img-top"
                    style={{ height: 180, objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h6 className="fw-semibold mb-1">{p.title}</h6>
                  <div className="small text-muted mb-2">R {p.price}</div>
                  <Link to={`/product/${p.slug}/${p.id}`} className="btn btn-sm btn-outline-dark">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
