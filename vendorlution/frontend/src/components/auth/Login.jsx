// src/components/auth/Login.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { search } = useLocation();
  const { login, isAuthenticated, ready } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get redirect URL from query params or default to home
  const next = new URLSearchParams(search).get("next") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (ready && isAuthenticated) {
      nav(next, { replace: true });
    }
  }, [isAuthenticated, ready, nav, next]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ identifier: identifier.trim(), password });
      
      if (result.success) {
        nav(next, { replace: true });
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (!ready) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h3 className="card-title">Sign in to Vendorlution</h3>
            <p className="text-muted">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="identifier" className="form-label">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label d-flex justify-content-between">
                <span>Password</span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-dark w-100 py-2" 
              disabled={loading || !identifier || !password}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="text-decoration-none">
              Create one here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}