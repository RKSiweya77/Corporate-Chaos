// components/Vendor/CreateDiscount.js
import React, { useState } from "react";

function CreateDiscount() {
  const [form, setForm] = useState({
    code: "",
    percentage: "",
    description: "",
    validUntil: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Discount created (mock). API integration later.");
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h3 className="mb-4">Create Discount</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Discount Code</label>
              <input
                type="text"
                className="form-control"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="E.g. SUMMER20"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Percentage (%)</label>
              <input
                type="number"
                className="form-control"
                name="percentage"
                value={form.percentage}
                onChange={handleChange}
                placeholder="E.g. 20"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                className="form-control"
                name="validUntil"
                value={form.validUntil}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-dark w-100">
              <i className="fa fa-plus me-2"></i>Create Discount
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateDiscount;
