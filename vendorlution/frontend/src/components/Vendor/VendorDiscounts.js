import React, { useState } from "react";
import { Link } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

function VendorDiscounts() {
  // Mock discounts (replace with API later)
  const [discounts] = useState([
    {
      id: 1,
      code: "WELCOME10",
      type: "Percentage",
      amount: "10%",
      validUntil: "2025-09-30",
      status: "Active",
    },
    {
      id: 2,
      code: "JACKET50",
      type: "Fixed",
      amount: "R 50",
      validUntil: "2025-09-20",
      status: "Expired",
    },
    {
      id: 3,
      code: "FREESHIP",
      type: "Shipping",
      amount: "Free",
      validUntil: "2025-10-15",
      status: "Active",
    },
  ]);

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <VendorSidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Discounts & Promotions</h3>
            <Link to="/vendor/discounts/create" className="btn btn-primary">
              <i className="fa fa-plus me-2"></i> New Discount
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length > 0 ? (
                  discounts.map((d, index) => (
                    <tr key={d.id}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="fw-bold">{d.code}</span>
                      </td>
                      <td>{d.type}</td>
                      <td>{d.amount}</td>
                      <td>{d.validUntil}</td>
                      <td>
                        {d.status === "Active" ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Expired</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No discounts created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDiscounts;
