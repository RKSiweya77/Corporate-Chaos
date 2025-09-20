// components/Vendor/VendorReports.js
import React from "react";

function VendorReports() {
  return (
    <div className="container py-5">
      <h3 className="mb-4">Reports</h3>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center p-3">
            <i className="fa fa-box fa-2x mb-2 text-primary"></i>
            <h6 className="fw-bold">Products Listed</h6>
            <p className="mb-0">12</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center p-3">
            <i className="fa fa-shopping-cart fa-2x mb-2 text-success"></i>
            <h6 className="fw-bold">Orders Completed</h6>
            <p className="mb-0">58</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center p-3">
            <i className="fa fa-dollar-sign fa-2x mb-2 text-warning"></i>
            <h6 className="fw-bold">Revenue</h6>
            <p className="mb-0">R 45,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorReports;
