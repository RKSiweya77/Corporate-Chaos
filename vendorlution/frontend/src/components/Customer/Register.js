import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../logo.png";

const Register = () => {
  const nav = useNavigate();
  const { login, addVendorRole, switchRole } = useAuth?.() || {};
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    startSelling: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);

    // 🔒 Unified registration (creates buyer by default).
    // Later hook this to your API; for now, log them in via AuthContext.
    try {
      if (login) {
        await login({
          email: form.email,
          name: form.name || form.email.split("@")[0] || "User",
          roles: ["buyer"],
        });
        if (switchRole) switchRole("buyer");
        if (form.startSelling && addVendorRole) {
          addVendorRole(); // instantly enables vendor tools in header
        }
      } else {
        // Fallback if AuthContext.login isn't present
        localStorage.setItem(
          "auth_fallback",
          JSON.stringify({
            isAuthenticated: true,
            roles: form.startSelling ? ["buyer", "vendor"] : ["buyer"],
            activeRole: "buyer",
          })
        );
      }

      nav("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm border-0" style={{ maxWidth: 520, width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-3">
            <img src={logo} alt="Vendorlution" height="40" className="mb-2" />
            <h4 className="mb-0">Create your account</h4>
            <div className="text-muted small">Shop as a buyer. Start selling anytime.</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Naledi Mokoena"
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Confirm password</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                />
              </div>

              <div className="col-12 form-check mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="startSelling"
                  name="startSelling"
                  checked={form.startSelling}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="startSelling">
                  I want to start selling (create my shop)
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-dark w-100 mt-3" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="text-center mt-3">
            <div className="text-muted small">Already have an account?</div>
            <Link to="/customer/login" className="btn btn-link">
              Sign in
            </Link>
          </div>

          <hr />
          <div className="small text-muted">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
