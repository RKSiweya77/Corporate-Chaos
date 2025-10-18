// src/components/auth/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function splitName(full) {
  const parts = (full || "").trim().split(/\s+/);
  const first_name = parts.shift() || "";
  const last_name = parts.join(" ") || "";
  return { first_name, last_name };
}

function makeUsername(email, full) {
  if (email && email.includes("@")) {
    const base = email.split("@")[0].slice(0, 24) || "user";
    return slugify(base);
  }
  const base = slugify(full) || "user";
  return (base + "-" + Math.random().toString(36).slice(2, 6)).slice(0, 30);
}

export default function Register() {
  const nav = useNavigate();
  const { register, login, createVendor } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    create_shop: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.full_name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Split full name and generate username
      const { first_name, last_name } = splitName(form.full_name);
      const username = makeUsername(form.email, form.full_name);

      // Register the user
      const registerResult = await register({
        username,
        email: form.email.trim(),
        password: form.password,
        first_name,
        last_name,
      });

      if (!registerResult.success) {
        setError(registerResult.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const loginResult = await login({
        identifier: username,
        password: form.password,
      });

      if (loginResult.success) {
        // Create vendor shop if requested
        if (form.create_shop) {
          const shopName = (form.full_name ? `${form.full_name}'s Shop` : `${username}'s Shop`).slice(0, 150);
          const vendorResult = await createVendor({
            shop_name: shopName,
            description: "Welcome to my shop!",
            address: "",
          });

          if (vendorResult.success) {
            nav("/vendor/dashboard", { replace: true });
            return;
          } else {
            // Continue to home even if shop creation fails
            console.warn("Shop creation failed:", vendorResult.error);
          }
        }

        // Redirect to home for regular buyers
        nav("/", { replace: true });
      } else {
        setError("Registration successful, but auto-login failed. Please sign in manually.");
        nav("/login", { replace: true });
      }

    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h3 className="card-title">Join Vendorlution</h3>
            <p className="text-muted">Shop securely with escrow protection. Start selling anytime.</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="full_name" className="form-label">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="form-control"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="confirm_password" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  className="form-control"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-check my-4">
              <input
                id="create_shop"
                name="create_shop"
                type="checkbox"
                className="form-check-input"
                checked={form.create_shop}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="create_shop" className="form-check-label">
                I want to start selling (create my shop immediately)
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-2"
              disabled={loading || !form.full_name || !form.email || !form.password || !form.confirm_password}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-decoration-none">
              Sign in here
            </Link>
          </div>

          <p className="text-muted small mt-4 mb-0 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}