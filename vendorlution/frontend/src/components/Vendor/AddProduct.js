// src/pages/vendor/AddProduct.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { postMultipart } from "../../api/axios";

export default function AddProduct() {
  const nav = useNavigate();

  // form fields
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);

  // aux
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // load categories once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/categories/all/");
        if (!alive) return;
        setCategories(res.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (!price || isNaN(Number(price))) return setError("Price must be a number");
    if (!categoryId) return setError("Select a category");
    if (!image) return setError("Choose a product image");

    setSubmitting(true);
    try {
      // 1) find my vendor id
      const me = await api.get("/auth/me/");
      const vendorId = me?.data?.vendor_id;
      if (!vendorId) {
        setSubmitting(false);
        return setError("You need a shop before adding products.");
      }

      // 2) compose multipart body
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("detail", detail.trim());
      fd.append("price", String(price));
      fd.append("category", String(categoryId));
      fd.append("vendor", String(vendorId));
      fd.append("is_active", "true");

      // IMPORTANT: backend expects "main_image" (not "image")
      fd.append("main_image", image);

      // 3) submit
      await postMultipart("/products/", fd);

      // optional: toast here
      nav("/vendor/products");
    } catch (err) {
      console.error(err);
      let msg = "Failed to add product.";
      if (err?.response?.data) {
        try {
          msg = typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
        } catch {}
      }
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-4">
      <h3 className="mb-3">
        <i className="fa fa-box me-2" />
        Add Product
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 12 (64GB)"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={4}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Tell buyers about the product..."
          />
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Price (ZAR) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label">Image *</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
          {image && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                style={{ height: 120, objectFit: "cover" }}
                className="rounded"
              />
            </div>
          )}
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-dark" disabled={submitting}>
            {submitting ? "Saving…" : "Add Product"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => nav("/vendor/dashboard")}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}