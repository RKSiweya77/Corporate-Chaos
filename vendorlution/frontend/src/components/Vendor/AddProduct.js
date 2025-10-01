import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vendor: "",
    category: "",
    title: "",
    detail: "",
    // Use values that match the backend choices:
    // new, used_like_new, used_good, used_fair, refurbished
    condition: "new",
    price: "",
    stock: "1",
    main_image: null, // must match backend field name
  });

  useEffect(() => {
    // Fetch dropdown data
    Promise.all([api.get("/categories/all/"), api.get("/vendors/all/")])
      .then(([catRes, venRes]) => {
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setVendors(Array.isArray(venRes.data) ? venRes.data : []);
      })
      .catch((err) => {
        console.error("Error fetching dropdowns:", err);
        setError("Failed to load categories/vendors.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData((p) => ({ ...p, main_image: file })); // key = main_image
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // quick client-side checks
    if (!formData.vendor) return setError("Please select a vendor.");
    if (!formData.category) return setError("Please select a category.");
    if (!formData.title.trim()) return setError("Please enter a product title.");
    if (!formData.price) return setError("Please enter a price.");

    setSubmitting(true);

    const data = new FormData();
    data.append("vendor", formData.vendor);         // id
    data.append("category", formData.category);     // id
    data.append("title", formData.title);
    data.append("detail", formData.detail);
    data.append("condition", formData.condition);   // one of allowed choices
    data.append("price", formData.price);
    data.append("stock", formData.stock || "1");
    if (formData.main_image) data.append("main_image", formData.main_image);

    api
      .post("/products/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("✅ Product added");
        setFormData({
          vendor: "",
          category: "",
          title: "",
          detail: "",
          condition: "new",
          price: "",
          stock: "1",
          main_image: null,
        });
      })
      .catch((err) => {
        console.error("❌ Error adding product:", err?.response?.data || err);
        setError(
          err?.response?.data
            ? JSON.stringify(err.response.data)
            : "Error adding product. Check console for details."
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Add New Product</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="shadow p-4 bg-white rounded"
      >
        {/* Vendor */}
        <div className="mb-3">
          <label className="form-label">Vendor</label>
          <select
            name="vendor"
            className="form-select"
            value={formData.vendor}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Vendor --</option>
            {Array.isArray(vendors) &&
              vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.shop_name}
                </option>
              ))}
          </select>
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Category --</option>
            {Array.isArray(categories) &&
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
          </select>
        </div>

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Product Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Details */}
        <div className="mb-3">
          <label className="form-label">Details</label>
          <textarea
            name="detail"
            className="form-control"
            rows="3"
            value={formData.detail}
            onChange={handleChange}
          />
        </div>

        {/* Condition */}
        <div className="mb-3">
          <label className="form-label">Condition</label>
          <select
            name="condition"
            className="form-select"
            value={formData.condition}
            onChange={handleChange}
            required
          >
            <option value="new">New</option>
            <option value="used_like_new">Used — Like New</option>
            <option value="used_good">Used — Good</option>
            <option value="used_fair">Used — Fair</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>

        {/* Price */}
        <div className="mb-3">
          <label className="form-label">Price (R)</label>
          <input
            type="number"
            name="price"
            className="form-control"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        {/* Stock */}
        <div className="mb-3">
          <label className="form-label">Stock</label>
          <input
            type="number"
            name="stock"
            className="form-control"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleChange}
          />
        </div>

        {/* Main Image */}
        <div className="mb-3">
          <label className="form-label">Product Image</label>
          <input
            type="file"
            name="main_image"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-dark" disabled={submitting}>
          {submitting ? "Adding…" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;