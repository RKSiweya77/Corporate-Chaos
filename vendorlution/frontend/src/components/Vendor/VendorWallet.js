// components/Vendor/VendorWallet.js
import React from "react";

function VendorWallet() {
  const balance = 2500;

  return (
    <div className="container py-5">
      <h3 className="mb-4">Vendor Wallet</h3>
      <div className="card shadow-sm border-0 text-center p-4">
        <h5>Available Balance</h5>
        <h2 className="fw-bold">R {balance}</h2>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="btn btn-dark">
            <i className="fa fa-plus me-2"></i>Deposit
          </button>
          <button className="btn btn-outline-dark">
            <i className="fa fa-arrow-down me-2"></i>Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

export default VendorWallet;
