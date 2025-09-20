// components/Vendor/VendorHelp.js
import React from "react";

function VendorHelp() {
  return (
    <div className="container py-5">
      <h3 className="mb-4">Help & Support</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <p>
            Need help managing your shop? Here are some quick resources:
          </p>
          <ul>
            <li>📦 Product Management Guide</li>
            <li>💳 How Payouts Work</li>
            <li>📊 Reports & Analytics Overview</li>
            <li>✉️ Contact Support</li>
          </ul>
          <button className="btn btn-dark mt-3">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

export default VendorHelp;
