import React, { useState } from "react";
import Sidebar from "./Sidebar";

function ResolutionCenter() {
  const [cases, setCases] = useState([
    {
      id: 1,
      orderId: 1024,
      issue: "Item not received",
      status: "Open",
      date: "2025-09-15",
      resolution: null,
    },
    {
      id: 2,
      orderId: 1019,
      issue: "Item not as described",
      status: "Resolved",
      date: "2025-09-10",
      resolution: "Refund issued",
    },
  ]);

  const [form, setForm] = useState({
    orderId: "",
    issue: "",
    details: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.orderId || !form.issue) {
      alert("Please fill in all required fields.");
      return;
    }
    const newCase = {
      id: Date.now(),
      orderId: form.orderId,
      issue: form.issue,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
      resolution: null,
    };
    setCases([newCase, ...cases]);
    setForm({ orderId: "", issue: "", details: "" });
    alert("Dispute case opened (mock). This will be handled via backend later.");
  };

  const renderStatus = (status) => {
    switch (status) {
      case "Open":
        return <span className="badge bg-warning text-dark">{status}</span>;
      case "Resolved":
        return <span className="badge bg-success">{status}</span>;
      case "Rejected":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Resolution Center</h3>

          {/* Open Case Form */}
          <div className="card mb-4">
            <div className="card-body">
              <h5>Open a Dispute</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Order ID</label>
                  <input
                    type="text"
                    name="orderId"
                    value={form.orderId}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter order number"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Issue</label>
                  <select
                    name="issue"
                    value={form.issue}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select issue</option>
                    <option>Item not received</option>
                    <option>Item not as described</option>
                    <option>Refund request</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Details</label>
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Provide details about your issue"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-danger">
                  <i className="fa fa-exclamation-circle me-2"></i> Submit Dispute
                </button>
              </form>
            </div>
          </div>

          {/* Case History */}
          <div className="card">
            <div className="card-body">
              <h5>My Cases</h5>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Order ID</th>
                      <th>Issue</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.length > 0 ? (
                      cases.map((c, index) => (
                        <tr key={c.id}>
                          <td>{index + 1}</td>
                          <td>{c.orderId}</td>
                          <td>{c.issue}</td>
                          <td>{renderStatus(c.status)}</td>
                          <td>{c.date}</td>
                          <td>{c.resolution || "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No dispute cases opened.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p className="text-muted small mt-2">
            <i className="fa fa-info-circle me-1"></i>
            Use the Resolution Center if something goes wrong with your order.
            Funds will only be released once disputes are resolved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResolutionCenter;
