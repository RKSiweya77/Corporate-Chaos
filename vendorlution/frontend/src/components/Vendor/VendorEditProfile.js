// src/components/Vendor/VendorEditProfile.js
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function VendorEditProfile() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const fetchMeVendor = async () => {
    try {
      const res = await api.get("/me/vendor/profile/");
      setData(res.data);
    } catch (e) {
      setErr("Could not load vendor profile.");
    }
  };

  useEffect(() => {
    fetchMeVendor();
  }, []);

  const onField = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const save = async (e) => {
    e.preventDefault();
    if (!data) return;
    setErr("");
    try {
      setSaving(true);
      const form = new FormData();
      if (data.shop_name != null) form.append("shop_name", data.shop_name);
      if (data.description != null) form.append("description", data.description);
      if (data.address != null) form.append("address", data.address);
      if (data._logo instanceof File) form.append("logo", data._logo);
      if (data._banner instanceof File) form.append("banner", data._banner);

      const res = await api.patch("/me/vendor/profile/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(res.data); // keep latest (server-side paths)
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        "Save failed.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="container py-4">
        <p>Loading shop…</p>
        {err && <div className="alert alert-danger mt-2">{err}</div>}
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h3 className="mb-3">Edit Shop</h3>
      {err && <div className="alert alert-danger">{err}</div>}

      <form className="card p-3 shadow-sm border-0" onSubmit={save}>
        {/* Preview banner */}
        <div className="mb-3">
          <label className="form-label">Banner</label>
          <div className="mb-2">
            {data.banner ? (
              <img src={data.banner} alt="banner" style={{ maxWidth: "100%", maxHeight: 220, objectFit: "cover" }} />
            ) : (
              <div className="text-muted small">No banner uploaded</div>
            )}
          </div>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => onField("_banner", e.target.files?.[0] || null)}
          />
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label className="form-label">Logo</label>
          <div className="mb-2">
            {data.logo ? (
              <img src={data.logo} alt="logo" style={{ height: 80, objectFit: "contain" }} />
            ) : (
              <div className="text-muted small">No logo uploaded</div>
            )}
          </div>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => onField("_logo", e.target.files?.[0] || null)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Shop name</label>
          <input
            className="form-control"
            value={data.shop_name || ""}
            onChange={(e) => onField("shop_name", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={4}
            value={data.description || ""}
            onChange={(e) => onField("description", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            rows={2}
            value={data.address || ""}
            onChange={(e) => onField("address", e.target.value)}
            placeholder="Street, City, Country"
          />
        </div>

        <button className="btn btn-dark" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      <div className="mt-3">
        <p className="small text-muted">
          Manage reviews, payments, discounts, linked products and more from your vendor dashboard.
        </p>
      </div>
    </div>
  );
}
