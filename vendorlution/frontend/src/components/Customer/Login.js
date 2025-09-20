import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../logo.png";

const Login = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { login, switchRole } = useAuth?.() || {};
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [loading, setLoading] = useState(false);
  const fromVendorShortcut = location.state?.from === "vendor";

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🔒 Unified login (buyer by default). Vendor role can be added later.
    // Adjust to your real API later; for now, we mock via AuthContext.
    try {
      if (login) {
        await login({
          email: form.email,
          name: form.email.split("@")[0] || "User",
          roles: ["buyer"],
        });
        if (switchRole) switchRole("buyer");
      } else {
        // Fallback if AuthContext.login isn't available (keeps dev moving)
        localStorage.setItem(
          "auth_fallback",
          JSON.stringify({ isAuthenticated: true, roles: ["buyer"], activeRole: "buyer" })
        );
      }

      // If they came here from a vendor-only action, land them on Vendor Dashboard after login
      if (fromVendorShortcut) {
        nav("/vendor/dashboard", { replace: true });
      } else {
        nav("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm border-0" style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-3">
            <img src={logo} alt="Vendorlution" height="40" className="mb-2" />
            <h4 className="mb-0">Welcome back</h4>
            <div className="text-muted small">Sign in to continue</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link to="#" className="small">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-dark w-100" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-3">
            <div className="text-muted small">Don’t have an account?</div>
            <Link to="/customer/register" className="btn btn-link">
              Create account
            </Link>
          </div>

          <hr />
          <div className="small text-muted text-center">
            One login for buyers & sellers. Start as a buyer; you can enable your shop anytime.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
