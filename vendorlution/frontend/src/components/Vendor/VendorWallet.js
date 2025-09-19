import React, { useState } from "react";
import VendorSidebar from "./VendorSidebar";

function VendorWallet() {
  // Mock wallet data
  const [wallet, setWallet] = useState({
    balance: 8500,
    pending: 2300,
    lastPayout: "2025-09-12",
    payouts: [
      { id: 1, amount: 3200, date: "2025-08-20", status: "Completed" },
      { id: 2, amount: 1500, date: "2025-09-01", status: "Completed" },
      { id: 3, amount: 2300, date: "2025-09-12", status: "Pending" },
    ],
  });

  const handleWithdraw = () => {
    alert("Withdraw request submitted (mock). In future, this will trigger a backend API call.");
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
          <h3 className="mb-3">My Wallet</h3>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4 col-6 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h6 className="card-title">Available Balance</h6>
                  <p className="fs-4 fw-bold text-success">R {wallet.balance}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-6 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h6 className="card-title">Pending</h6>
                  <p className="fs-4 fw-bold text-warning">R {wallet.pending}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-12 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h6 className="card-title">Last Payout</h6>
                  <p className="fs-5 fw-bold">{wallet.lastPayout}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Button */}
          <div className="mb-4 text-center">
            <button className="btn btn-primary" onClick={handleWithdraw}>
              <i className="fa fa-money me-2"></i> Request Withdrawal
            </button>
          </div>

          {/* Payout History */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Payout History</h5>
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
                    {wallet.payouts.length > 0 ? (
                      wallet.payouts.map((payout, index) => (
                        <tr key={payout.id}>
                          <td>{index + 1}</td>
                          <td>{payout.amount}</td>
                          <td>{payout.date}</td>
                          <td>
                            {payout.status === "Completed" ? (
                              <span className="badge bg-success">Completed</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center">
                          No payout history yet.
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

export default VendorWallet;
