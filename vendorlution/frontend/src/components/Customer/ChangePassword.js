// components/Customer/ChangePassword.js
import React, { useState } from "react";

function ChangePassword() {
  const [formData, setFormData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.new !== formData.confirm) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed successfully (mock).");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="card shadow-sm p-4">
        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            name="current"
            className="form-control"
            value={formData.current}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="new"
            className="form-control"
            value={formData.new}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            name="confirm"
            className="form-control"
            value={formData.confirm}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark w-100">
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
