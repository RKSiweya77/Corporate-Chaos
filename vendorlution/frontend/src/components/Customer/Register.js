// frontend/src/components/Customer/Register.js
import React, { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Register() {
  const nav = useNavigate();
  const { login, createVendor } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    password2: "",
    create_shop: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const splitName = (full) => {
    const parts = (full || "").trim().split(/\s+/);
    const first_name = parts.shift() || "";
    const last_name = parts.join(" ");
    return { first_name, last_name };
  };

  const makeUsername = (email, full) => {
    if (email && email.includes("@")) {
      const base = email.split("@")[0].slice(0, 24) || "user";
      return slugify(base);
    }
    const base = slugify(full) || "user";
    return (base + "-" + Math.random().toString(36).slice(2, 6)).slice(0, 30);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.password || form.password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.password2) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { first_name, last_name } = splitName(form.full_name);
      const username = makeUsername(form.email, form.full_name);

      // 1) Register (buyer by default)
      await api.post("/auth/register/", {
        username,
        email: form.email || "",
        password: form.password,
        first_name,
        last_name,
      });

      // 2) Auto-login (send both fields to match either backend token view)
      await login(username, form.password);

      // 3) Optional: create shop immediately
      if (form.create_shop) {
        const shopName =
          (form.full_name ? `${form.full_name}'s Shop` : `${username}'s Shop`).slice(0, 150);
        await createVendor(shopName);
        nav("/vendor/dashboard", { replace: true });
        return;
      }

      // Otherwise go home as a buyer
      nav("/", { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data
          ? typeof e2.response.data === "string"
            ? e2.response.data
            : JSON.stringify(e2.response.data)
          : "Registration failed.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="text-center mb-3">
            <img src="/logo192.png" alt="" width={32} height={32} />
          </div>
          <h3 className="mb-2 text-center">Create your account</h3>
          <p className="text-center text-muted mb-4">Shop as a buyer. Start selling anytime.</p>

          {err && <div className="alert alert-danger">{err}</div>}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input
                name="full_name"
                className="form-control"
                placeholder="e.g. Naledi Mokoena"
                value={form.full_name}
                onChange={onChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
              />
            </div>

            <div className="row">
              <div className="mb-3 col-sm-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3 col-sm-6">
                <label className="form-label">Confirm password</label>
                <input
                  type="password"
                  name="password2"
                  className="form-control"
                  placeholder="Repeat password"
                  value={form.password2}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="form-check mb-3">
              <input
                id="create_shop"
                className="form-check-input"
                type="checkbox"
                name="create_shop"
                checked={form.create_shop}
                onChange={onChange}
              />
              <label className="form-check-label" htmlFor="create_shop">
                I want to start selling (create my shop)
              </label>
            </div>

            <button className="btn btn-dark w-100" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

            <div className="text-center mt-3">
              Already have an account? <Link to="/customer/login">Sign in</Link>
            </div>

          <p className="text-muted small mt-3 mb-0">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
