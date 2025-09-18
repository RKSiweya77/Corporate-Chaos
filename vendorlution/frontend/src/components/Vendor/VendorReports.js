import React from "react";
import VendorSidebar from "./VendorSidebar";

function VendorReports() {
  // Mock stats (replace later with API data)
  const stats = {
    totalSales: 15400,
    totalOrders: 27,
    topProduct: "Designer Jacket",
    pendingPayout: 4200,
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
          <h3 className="mb-3">Reports & Analytics</h3>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3 col-6 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Sales</h5>
                  <p className="fs-4 fw-bold">R {stats.totalSales}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Orders</h5>
                  <p className="fs-4 fw-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Top Product</h5>
                  <p className="fs-6 fw-bold">{stats.topProduct}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Pending Payout</h5>
                  <p className="fs-4 fw-bold">R {stats.pendingPayout}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for chart */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sales Overview</h5>
              <p className="text-muted">[Chart Placeholder – coming soon]</p>
              <div
                style={{
                  height: "200px",
                  background: "#f8f9fa",
                  border: "1px dashed #ccc",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Sales Chart (mock)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorReports;
