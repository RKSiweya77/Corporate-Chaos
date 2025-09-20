// components/Customer/AddAddress.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import"./AddAddress.css";

const AddAddress = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem("addresses") || "[]");
    const newId =
      existing.length > 0 ? Math.max(...existing.map((a) => a.id)) + 1 : 1;

    const newAddress = { ...formData, id: newId };
    let updated;
    if (newAddress.isDefault) {
      updated = existing.map((a) => ({ ...a, isDefault: false }));
      updated.push(newAddress);
    } else {
      updated = [...existing, newAddress];
    }
    localStorage.setItem("addresses", JSON.stringify(updated));
    navigate("/customer/addresses");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Add New Address</h3>
      <form onSubmit={handleSubmit} className="card shadow-sm p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Address Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Home, Work..."
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Province</label>
            <select
              className="form-select"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
            >
              <option value="">Select Province</option>
              <option>Eastern Cape</option>
              <option>Free State</option>
              <option>Gauteng</option>
              <option>KwaZulu-Natal</option>
              <option>Limpopo</option>
              <option>Mpumalanga</option>
              <option>Northern Cape</option>
              <option>North West</option>
              <option>Western Cape</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              className="form-control"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              className="form-control"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 form-check mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault" className="form-check-label">
              Set as default address
            </label>
          </div>
        </div>
        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-dark">
            Save Address
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/customer/addresses")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddress;
