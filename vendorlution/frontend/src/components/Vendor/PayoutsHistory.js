// components/Vendor/PayoutsHistory.js
import React from "react";

function PayoutsHistory() {
  const payouts = [
    { id: 1, date: "2025-01-10", amount: 1200, status: "Completed" },
    { id: 2, date: "2025-02-05", amount: 800, status: "Pending" },
  ];

  return (
    <div className="container py-5">
      <h3 className="mb-4">Payouts History</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>R {p.amount}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "Completed"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No payout history found.
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

export default PayoutsHistory;
