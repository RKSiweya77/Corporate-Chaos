import React from "react";

export default function VendorChangePassword() {
  // There is no backend endpoint for password change yet in your project scope.
  // Leaving this as a placeholder so the route doesn’t break.
  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <h3 className="fw-bold mb-3">Change Password</h3>
      <div className="alert alert-info">
        Password change via vendor panel is coming soon.
        <br />
        In the meantime, you can change your password from Django admin or we can add a JWT-friendly endpoint next.
      </div>

      <form className="card p-4 shadow-sm border-0">
        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input className="form-control" type="password" disabled placeholder="Coming soon" />
        </div>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input className="form-control" type="password" disabled placeholder="Coming soon" />
        </div>
        <button className="btn btn-dark" type="button" disabled>
          Update Password
        </button>
      </form>
    </div>
  );
}
