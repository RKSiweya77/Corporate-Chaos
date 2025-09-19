import React, { useState } from "react";
import Sidebar from "./Sidebar";

function CustomerCoupons() {
  // Mock coupons (replace later with backend)
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: "WELCOME10",
      description: "Get 10% off your first order",
      validUntil: "2025-09-30",
      status: "Available",
    },
    {
      id: 2,
      code: "FREESHIP",
      description: "Free shipping on orders above R500",
      validUntil: "2025-10-15",
      status: "Available",
    },
    {
      id: 3,
      code: "OLD50",
      description: "R50 off selected items",
      validUntil: "2025-08-30",
      status: "Expired",
    },
  ]);

  const [redeemCode, setRedeemCode] = useState("");

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) {
      alert("Please enter a coupon code.");
      return;
    }
    alert(`Coupon "${redeemCode}" redeemed (mock).`);
    setRedeemCode("");
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>My Coupons</h3>
          </div>

          {/* Redeem Coupon Form */}
          <div className="card mb-4">
            <div className="card-body">
              <h5>Redeem a Coupon</h5>
              <form onSubmit={handleRedeem} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Enter coupon code"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Redeem
                </button>
              </form>
            </div>
          </div>

          {/* Coupons List */}
          <div className="card">
            <div className="card-body">
              <h5>Available & Past Coupons</h5>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length > 0 ? (
                      coupons.map((c, index) => (
                        <tr key={c.id}>
                          <td>{index + 1}</td>
                          <td className="fw-bold">{c.code}</td>
                          <td>{c.description}</td>
                          <td>{c.validUntil}</td>
                          <td>
                            {c.status === "Available" ? (
                              <span className="badge bg-success">Available</span>
                            ) : (
                              <span className="badge bg-secondary">Expired</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No coupons available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCoupons;
