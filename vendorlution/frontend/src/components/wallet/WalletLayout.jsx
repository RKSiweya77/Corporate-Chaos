import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function WalletLayout() {
  return (
    <div className="container py-4">
      <h3 className="mb-4">Wallet</h3>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="list-group shadow-sm">
            <NavLink end to="/wallet" className="list-group-item list-group-item-action">
              Overview
            </NavLink>
            <NavLink to="/wallet/deposit" className="list-group-item list-group-item-action">
              Deposit (Instant EFT)
            </NavLink>
            <NavLink to="/wallet/withdraw" className="list-group-item list-group-item-action">
              Withdraw
            </NavLink>
            <NavLink to="/wallet/transactions" className="list-group-item list-group-item-action">
              Transactions
            </NavLink>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
