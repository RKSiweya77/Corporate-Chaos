// components/Customer/CustomerCoupons.js
import React from "react";

function CustomerCoupons() {
  const coupons = [
    { code: "WELCOME10", discount: "10% Off", expiry: "2025-12-31" },
    { code: "FREESHIP", discount: "Free Shipping", expiry: "2025-09-30" },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Coupons</h3>
      <div className="row g-3">
        {coupons.length > 0 ? (
          coupons.map((c) => (
            <div className="col-md-6" key={c.code}>
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body text-center">
                  <h5 className="fw-bold">{c.code}</h5>
                  <p className="mb-1">{c.discount}</p>
                  <small className="text-muted">Valid until {c.expiry}</small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted">
            <i className="fa fa-ticket fa-2x mb-2"></i>
            <p>No coupons available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerCoupons;
