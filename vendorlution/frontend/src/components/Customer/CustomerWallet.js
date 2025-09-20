// components/Customer/CustomerWallet.js
import React from "react";
import { Link } from "react-router-dom";

function CustomerWallet() {
  const balance = 1500;
  const history = [
    { id: 1, type: "Deposit", amount: 1000, date: "2025-09-01" },
    { id: 2, type: "Purchase", amount: -500, date: "2025-09-05" },
    { id: 3, type: "Refund", amount: 200, date: "2025-09-10" },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Wallet</h3>
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body text-center">
          <h5 className="fw-bold">Available Balance</h5>
          <h3 className="text-success">R {balance}</h3>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Link to="/customer/payment-methods" className="btn btn-dark">
              Deposit
            </Link>
            <button className="btn btn-outline-dark">Withdraw</button>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Transaction History</h5>
      <div className="list-group shadow-sm">
        {history.map((h) => (
          <div
            key={h.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <i
                className={`fa me-2 ${
                  h.type === "Deposit"
                    ? "fa-arrow-down text-success"
                    : h.type === "Purchase"
                    ? "fa-arrow-up text-danger"
                    : "fa-undo text-info"
                }`}
              ></i>
              {h.type}
            </span>
            <span className={h.amount > 0 ? "text-success" : "text-danger"}>
              {h.amount > 0 ? "+" : "-"}R {Math.abs(h.amount)}
            </span>
            <small className="text-muted">{h.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerWallet;
