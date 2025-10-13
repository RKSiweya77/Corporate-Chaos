import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function toMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${apiRoot}${path}`;
}

export default function VendorProfile() {
  const { getVendorId } = useAuth();
  const [vendorId, setVendorId] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // ensure we read the *current* vendor id (after create shop)
        const me = await api.get("/auth/me/");
        const vid = me?.data?.vendor_id ?? getVendorId?.();
        if (!alive) return;
        setVendorId(vid);

        if (vid) {
          const v = await api.get(`/vendors/${vid}/`);
          if (!alive) return;
          setVendor(v.data);
        } else {
          setVendor(null);
        }
      } catch (e) {
        console.error(e);
        setErr("Failed to load vendor profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [getVendorId]);

  if (loading) return <div className="container py-5">Loading…</div>;
  if (err) return <div className="container py-5"><div className="alert alert-danger">{err}</div></div>;
  if (!vendorId) return <div className="container py-5">You don’t have a shop yet.</div>;
  if (!vendor) return <div className="container py-5">Shop not found.</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      {vendor.banner && (
        <img
          src={toMedia(vendor.banner)}
          alt={vendor.shop_name}
          className="img-fluid rounded mb-3"
          style={{ maxHeight: 260, objectFit: "cover", width: "100%" }}
        />
      )}
      <div className="d-flex align-items-center gap-3">
        {vendor.logo && (
          <img
            src={toMedia(vendor.logo)}
            alt="Logo"
            width={72}
            height={72}
            className="rounded-circle border"
            style={{ objectFit: "cover" }}
          />
        )}
        <div>
          <h3 className="fw-bold mb-1">{vendor.shop_name}</h3>
          <div className="text-muted">Rating: {vendor.rating_avg} ★</div>
        </div>
      </div>
      <p className="mt-3">{vendor.description}</p>
      <p className="text-muted">Address: {vendor.address || "Not set"}</p>
    </div>
  );
}
