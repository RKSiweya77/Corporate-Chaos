// frontend/src/components/Customer/Login.js
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // You can type username OR email in the Username field
      await login(form.username, form.password);
      const redirectTo = (loc.state && loc.state.from) || "/";
      nav(redirectTo, { replace: true });
    } catch (e2) {
      // Normalize common errors
      const data = e2?.response?.data;
      let msg = "Invalid username/email or password.";
      if (typeof data === "string") msg = data;
      else if (data?.detail) msg = data.detail;
      // Prevent the confusing {"refresh":["This field may not be null."]} message
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h3 className="mb-3">Sign in</h3>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="username or email"
                autoComplete="username"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
              />
            </div>
            <button className="btn btn-dark w-100" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-3">
            New here? <Link to="/customer/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
