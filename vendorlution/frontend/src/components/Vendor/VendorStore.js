import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Pagination from "../shared/Pagination";

function toMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${apiRoot}${path}`;
}

function useVendorWithProducts(vendor_id, page, pageSize) {
  const [vendor, setVendor] = React.useState(null);
  const [all, setAll] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [vRes, pRes] = await Promise.all([
          api.get(`/vendors/${vendor_id}/`),
          api.get(`/products/?ordering=-created_at`),
        ]);
        if (!alive) return;
        setVendor(vRes.data);

        const list = pRes.data?.results ?? pRes.data ?? [];
        const filtered = (list || []).filter((p) => {
          const vid = p?.vendor?.id ?? p?.vendor;
          return String(vid) === String(vendor_id);
        });
        setAll(filtered);
      } catch (e) {
        console.error(e);
        setErr("Failed to load store.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [vendor_id]);

  // paginate client-side for now
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = all.slice(start, start + pageSize);

  return { vendor, products: pageItems, totalPages, loading, err };
}

export default function VendorStore() {
  const { vendor_slug, vendor_id } = useParams();
  const pageSize = 6;
  const [page, setPage] = React.useState(1);

  const { vendor, products, totalPages, loading, err } = useVendorWithProducts(
    vendor_id,
    page,
    pageSize
  );

  if (loading) return <div className="container mt-3">Loading store…</div>;
  if (err) return <div className="container mt-3"><div className="alert alert-danger">{err}</div></div>;
  if (!vendor) return <div className="container mt-3">Store not found.</div>;

  return (
    <div className="container mt-3">
      {/* Vendor Banner */}
      <div className="card mb-4 border-0 shadow-sm">
        {vendor.banner && (
          <img
            src={toMedia(vendor.banner)}
            alt="Vendor Banner"
            className="card-img-top"
            style={{ maxHeight: "200px", objectFit: "cover" }}
          />
        )}
        <div className="card-body text-center">
          {vendor.logo && (
            <img
              src={toMedia(vendor.logo)}
              alt="Vendor Logo"
              className="rounded-circle border mb-2"
              width="80"
              height="80"
              style={{ objectFit: "cover" }}
            />
          )}
          <h4>{vendor.shop_name}</h4>
          <p className="text-muted">{vendor.description}</p>

          {/* Chat with Seller + Profile Links */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Link
              to={`/customer/inbox?vendor=${vendor.id}`}
              className="btn btn-sm btn-dark"
            >
              <i className="fa fa-comments me-1"></i> Chat with Seller
            </Link>
            <Link
              to={`/vendor/public-profile/${vendor.id}`}
              className="btn btn-sm btn-outline-dark"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Products */}
      <h5 className="mb-3">Products</h5>
      <div className="row g-3">
        {products.map((p) => (
          <motion.div
            key={p.id}
            className="col-12 col-md-6 col-lg-4"
            whileHover={{ y: -4 }}
          >
            <div className="card h-100 shadow-sm border-0">
              {p.main_image && (
                <img
                  src={toMedia(p.main_image)}
                  className="card-img-top"
                  alt={p.title}
                  style={{ height: 200, objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h6 className="fw-bold">{p.title}</h6>
                <p className="fw-semibold">R {Number(p.price).toFixed(2)}</p>
                <Link
                  to={`/product/${p.slug}/${p.id}`}
                  className="btn btn-sm btn-outline-dark"
                >
                  View Product
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {products.length === 0 && (
          <div className="text-muted">No products yet.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}
