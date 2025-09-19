import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

function CustomerWallet() {
  // Mock wallet data (replace later with backend)
  const [wallet] = useState({
    balance: 2000,
    transactions: [
      {
        id: 1,
        type: "Deposit",
        amount: 1500,
        date: "2025-09-10",
        status: "Completed",
      },
      {
        id: 2,
        type: "Purchase",
        amount: -500,
        date: "2025-09-12",
        status: "Completed",
      },
      {
        id: 3,
        type: "Refund",
        amount: 300,
        date: "2025-09-15",
        status: "Completed",
      },
      {
        id: 4,
        type: "Withdrawal",
        amount: -200,
        date: "2025-09-16",
        status: "Pending",
      },
    ],
  });

  const handleWithdraw = () => {
    alert("Withdrawal request submitted (mock). Later this will connect to backend.");
  };

  const renderStatus = (status) => {
    switch (status) {
      case "Completed":
        return <span className="badge bg-success">{status}</span>;
      case "Pending":
        return <span className="badge bg-warning text-dark">{status}</span>;
      case "Failed":
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
          <h3 className="mb-3">My Wallet</h3>

          {/* Wallet Summary */}
          <div className="row mb-4">
            <div className="col-md-6 col-12 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h6 className="card-title">Available Balance</h6>
                  <p className="fs-3 fw-bold text-success">R {wallet.balance}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-12 mb-3 d-flex flex-column justify-content-center">
              <Link to="/customer/payment-methods" className="btn btn-primary mb-2">
                <i className="fa fa-plus-circle me-2"></i> Deposit Funds
              </Link>
              <button className="btn btn-outline-danger" onClick={handleWithdraw}>
                <i className="fa fa-money me-2"></i> Withdraw Funds
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Transaction History</h5>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Amount (R)</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.transactions.length > 0 ? (
                      wallet.transactions.map((t, index) => (
                        <tr key={t.id}>
                          <td>{index + 1}</td>
                          <td>{t.type}</td>
                          <td
                            className={
                              t.amount < 0 ? "text-danger fw-bold" : "text-success fw-bold"
                            }
                          >
                            {t.amount < 0 ? `- R ${Math.abs(t.amount)}` : `R ${t.amount}`}
                          </td>
                          <td>{t.date}</td>
                          <td>{renderStatus(t.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No transactions found.
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
            Payments go into your Vendorlution Wallet. When you purchase, funds
            move to the seller’s wallet and are released after order confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerWallet;
