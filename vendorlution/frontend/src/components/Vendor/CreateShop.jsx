// src/pages/vendor/CreateShop.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { postMultipart } from "../../api/axios";

export default function CreateShop() {
  const nav = useNavigate();
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const fd = new FormData();
    fd.append("shop_name", shopName);
    if (address) fd.append("address", address);
    if (description) fd.append("description", description);
    if (logo) fd.append("logo", logo);
    if (banner) fd.append("banner", banner);

    try {
      await postMultipart("auth/create-vendor/", fd);
      nav("/vendor/dashboard");
    } catch (err) {
      // In case a dev accidentally forces JSON, the server now still accepts JSON,
      // but images won't upload. If you land here, it's likely a different error.
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Failed to create shop";
      setError(msg);
    }
  };

  return (
    <div className="container py-4">
      <h3>Create your shop</h3>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      <form className="mt-3" onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Shop name *</label>
            <input className="form-control" value={shopName}
                   onChange={(e) => setShopName(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Street / Address</label>
            <input className="form-control" value={address}
                   onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="col-12">
            <label className="form-label">About your shop</label>
            <textarea className="form-control" rows={4} value={description}
                      onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="col-md-6">
            <label className="form-label">Logo (square)</label>
            <input type="file" accept="image/*" className="form-control"
                   onChange={(e) => setLogo(e.target.files?.[0] || null)} />
          </div>

          <div className="col-md-6">
            <label className="form-label">Banner (wide)</label>
            <input type="file" accept="image/*" className="form-control"
                   onChange={(e) => setBanner(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-dark" type="submit">Create shop</button>
          <button className="btn btn-outline-secondary" type="button" onClick={() => nav(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
