import { useState } from "react";
import Sidebar from "./Sidebar";

function ChangePassword() {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Password updated:", passwords.newPassword);
    alert("Password updated successfully!");
    // 🔗 Later: Send request to Django API for password change
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-3">
          <Sidebar />
        </aside>

        {/* Change Password Form */}
        <section className="col-md-9">
          <h3 className="mb-3">Change Password</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="form-control"
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ChangePassword;
