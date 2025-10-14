import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function toMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${apiRoot}${path}`;
}

export default function VendorPublicProfile() {
  const { vendor_id, vendor_slug } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingP, setLoadingP] = useState(true);
  const [err, setErr] = useState("");

  // load vendor by slug (preferred) or id
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoadingV(true);
        const url = vendor_slug
          ? `/vendors/slug/${encodeURIComponent(vendor_slug)}/`
          : `/vendors/${vendor_id}/`;
        const r = await api.get(url);
        if (!alive) return;
        setVendor(r.data);
      } catch (e) {
        console.error(e);
        setErr("Failed to load vendor.");
        setVendor(null);
      } finally {
        if (alive) setLoadingV(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [vendor_id, vendor_slug]);

  // load products (client-side filter by vendor for now)
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
          const wanted = vendor?.id;
          return wanted ? String(vid) === String(wanted) : false;
        });
        setProducts(filtered);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        if (alive) setLoadingP(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [vendor?.id]);

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

  const logoEl = useMemo(() => {
    if (!vendor?.logo) return null;
    return (
      <img
        src={toMedia(vendor.logo)}
        alt="Logo"
        width={64}
        height={64}
        className="rounded-circle border"
        style={{ objectFit: "cover" }}
      />
    );
  }, [vendor]);

  const handleChatSeller = async () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(location.pathname);
      nav(`/customer/login?next=${next}`);
      return;
    }
    try {
      const res = await api.post("/me/conversations/", { vendor_id: Number(vendor.id) });
      const convo = res.data;
      const convoId = convo?.id;
      nav(convoId ? `/customer/inbox/${convoId}` : `/customer/inbox`);
    } catch (e) {
      console.error(e);
      alert("Could not start a chat with this seller.");
    }
  };

  if (loadingV) return <div className="container py-5">Loading vendor…</div>;
  if (err) return <div className="container py-5"><div className="alert alert-danger">{err}</div></div>;
  if (!vendor) return <div className="container py-5">Vendor not found.</div>;

  const storeUrl = `/vendor/store/${encodeURIComponent(vendor.slug)}/${vendor.id}`;
  const productCount = products.length;

  return (
    <div className="container py-5">
      {bannerEl}

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center gap-3">
          {logoEl}
          <div>
            <h3 className="fw-bold mb-1">{vendor.shop_name}</h3>
            <div className="text-muted small">
              {vendor.rating_avg ?? 0} ★ • {productCount} product{productCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-dark" onClick={handleChatSeller}>
            <i className="fa fa-comments me-1" /> Chat with Seller
          </button>
          <Link to={storeUrl} className="btn btn-sm btn-outline-dark">
            Visit Store
          </Link>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={async () => {
              try {
                const abs = `${window.location.origin}${storeUrl}`;
                await navigator.clipboard.writeText(abs);
                alert("Store link copied!");
              } catch {
                alert("Could not copy link.");
              }
            }}
          >
            <i className="fa fa-link me-1" /> Copy Store Link
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">About this shop</h6>
              <p className="mb-2">{vendor.description || "No description yet."}</p>
              <div className="small text-muted">
                <i className="fa fa-location-dot me-2" />
                {vendor.address || "Address not specified"}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between small mb-2">
                <span>Products</span>
                <span className="fw-semibold">{productCount}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span>Rating</span>
                <span className="fw-semibold">{vendor.rating_avg ?? 0} ★</span>
              </div>
              <hr />
              <Link to={storeUrl} className="btn btn-sm btn-dark w-100">
                Browse Store
              </Link>
            </div>
          </div>
        </div>
      </div>

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