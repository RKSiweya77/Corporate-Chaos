// components/Vendor/VendorDiscounts.js
import React from "react";
import { Link } from "react-router-dom";

function VendorDiscounts() {
  const discounts = [
    { id: 1, code: "SUMMER20", percentage: 20, validUntil: "2025-06-01" },
    { id: 2, code: "WELCOME10", percentage: 10, validUntil: "2025-12-31" },
  ];

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Discounts</h3>
        <Link to="/vendor/discounts/create" className="btn btn-dark">
          <i className="fa fa-plus me-2"></i>New Discount
        </Link>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Percentage</th>
                  <th>Valid Until</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id}>
                    <td>{d.code}</td>
                    <td>{d.percentage}%</td>
                    <td>{d.validUntil}</td>
                  </tr>
                ))}
                {discounts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
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
