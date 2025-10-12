import React, { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function VendorRegister() {
  const { isAuthenticated, addVendorRole } = useAuth();
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert("Please log in first.");
    try {
      setLoading(true);
      const res = await api.post("/auth/create-vendor/", {
        shop_name: shopName,
        description,
      });
      addVendorRole(res.data.vendor.id);
      alert("Shop created successfully!");
      nav("/vendor/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create shop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h3 className="mb-4 fw-bold">Create Your Shop</h3>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
        <div className="mb-3">
          <label className="form-label">Shop Name</label>
          <input
            type="text"
            className="form-control"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className="btn btn-dark" disabled={loading}>
          {loading ? "Creating..." : "Create Shop"}
        </button>
      </form>
    </div>
  );
}
