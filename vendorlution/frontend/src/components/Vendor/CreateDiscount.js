import React, { useState } from "react";
import VendorSidebar from "./VendorSidebar";

function CreateDiscount() {
  const [form, setForm] = useState({
    code: "",
    type: "Percentage",
    amount: "",
    validUntil: "",
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Discount created (mock): ${JSON.stringify(form, null, 2)}`);
    // Later: send to backend with axios.post("/api/discounts/", form)
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <VendorSidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Create New Discount</h3>

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Discount Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. WELCOME10"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Shipping">Free Shipping</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="10% or R100"
                    required
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
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-success">
                  <i className="fa fa-save me-2"></i> Save Discount
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDiscount;
