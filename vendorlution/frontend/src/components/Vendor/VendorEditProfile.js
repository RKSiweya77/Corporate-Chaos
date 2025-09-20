// components/Vendor/VendorEditProfile.js
import React, { useState } from "react";
import { useVendor } from "../../context/VendorContext";
import { useNavigate } from "react-router-dom";

function VendorEditProfile() {
  const { vendor, setVendor } = useVendor();
  const [form, setForm] = useState(vendor);
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setForm({ ...form, [field]: imgUrl });
    }
  };

  const handleSave = () => {
    setVendor(form); // update context
    alert("Profile updated successfully!");
    nav("/vendor/profile"); // redirect back
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Edit Store Profile</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label className="form-label">Store Name</label>
              <input
                type="text"
                className="form-control"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Owner Name</label>
              <input
                type="text"
                className="form-control"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Furniture">Furniture</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Upload Logo</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "logo")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Upload Banner</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "banner")}
              />
            </div>

            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VendorEditProfile;
