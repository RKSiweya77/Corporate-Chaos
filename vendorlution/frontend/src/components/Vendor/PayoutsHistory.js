import React, { useState } from "react";
import VendorSidebar from "./VendorSidebar";

function PayoutsHistory() {
  // Mock payout history (replace with API later)
  const [payouts] = useState([
    { id: 1, amount: 3200, date: "2025-08-20", status: "Completed" },
    { id: 2, amount: 1500, date: "2025-09-01", status: "Completed" },
    { id: 3, amount: 2300, date: "2025-09-12", status: "Pending" },
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
          <h3 className="mb-3">Payout History</h3>

          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Amount (R)</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.length > 0 ? (
                      payouts.map((payout, index) => (
                        <tr key={payout.id}>
                          <td>{index + 1}</td>
                          <td>{payout.amount}</td>
                          <td>{payout.date}</td>
                          <td>
                            {payout.status === "Completed" ? (
                              <span className="badge bg-success">Completed</span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center">
                          No payouts found.
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

export default PayoutsHistory;
