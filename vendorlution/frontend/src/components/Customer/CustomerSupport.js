// components/Customer/CustomerSupport.js
import React, { useState } from "react";

function CustomerSupport() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Support request submitted (mock).");
    setMessage("");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Customer Support</h3>
      <form onSubmit={handleSubmit} className="card shadow-sm p-4">
        <div className="mb-3">
          <label className="form-label">Describe your issue</label>
          <textarea
            className="form-control"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-dark w-100">
          Submit
        </button>
      </form>
    </div>
  );
}

export default CustomerSupport;
