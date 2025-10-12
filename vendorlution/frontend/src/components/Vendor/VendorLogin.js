import React from "react";
import { Link } from "react-router-dom";

export default function VendorLogin() {
  // Vendors use the same universal login as buyers.
  // If you want a separate landing, keep this page to guide users.
  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <h3 className="fw-bold mb-3">Vendor Sign In</h3>
      <p className="text-muted">
        Vendors sign in with the same account as buyers. After logging in, create your shop to
        access the vendor dashboard.
      </p>
      <Link to="/customer/login" className="btn btn-dark">
        Go to Login
      </Link>
      <div className="mt-3">
        New here? <Link to="/customer/register">Create an account</Link>
      </div>
    </div>
  );
}
