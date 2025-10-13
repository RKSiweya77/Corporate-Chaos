import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

function toMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${apiRoot}${path}`;
}

export default function VendorPublicProfile() {
  const { vendor_id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingP, setLoadingP] = useState(true);

  // vendor info
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
        setVendor(null);
      } finally {
        if (alive) setLoadingV(false);
      }
    })();
    return () => { alive = false; };
  }, [vendor_id]);

  // products (filter client-side to this vendor)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingP(true);
        const r = await api.get(`/products/?ordering=-created_at`);
        if (!alive) return;
        const data = r.data?.results ?? r.data ?? [];
        const filtered = (data || []).filter((p) => {
          const vid = p?.vendor?.id ?? p?.vendor;
          return String(vid) === String(vendor_id);
        });
        setProducts(filtered);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        if (alive) setLoadingP(false);
      }
    })();
    return () => { alive = false; };
  }, [vendor_id]);

  const bannerEl = useMemo(() => {
    if (!vendor?.banner) return null;
    return (
      <img
        src={toMedia(vendor.banner)}
        alt={vendor.shop_name}
        className="img-fluid rounded mb-3"
        style={{ maxHeight: 260, objectFit: "cover", width: "100%" }}
      />
    );
  }, [vendor]);

  if (loadingV) return <div className="container py-5">Loading vendor…</div>;
  if (!vendor) return <div className="container py-5">Vendor not found.</div>;

  return (
    <div className="container py-5">
      {bannerEl}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          {vendor.logo && (
            <img
              src={toMedia(vendor.logo)}
              alt="Logo"
              width={64}
              height={64}
              className="rounded-circle border"
              style={{ objectFit: "cover" }}
            />
          )}
          <div>
            <h3 className="fw-bold mb-0">{vendor.shop_name}</h3>
            <div className="text-muted">Rating: {vendor.rating_avg} ★</div>
          </div>
        </div>
        <Link
          to={`/vendor/store/${encodeURIComponent(vendor.slug)}/${vendor.id}`}
          className="btn btn-sm btn-dark"
        >
          Visit Store
        </Link>
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
                    src={toMedia(p.main_image)}
                    alt={p.title}
                    className="card-img-top"
                    style={{ height: 180, objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h6 className="fw-semibold mb-1">{p.title}</h6>
                  <div className="small text-muted mb-2">R {Number(p.price).toFixed(2)}</div>
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
