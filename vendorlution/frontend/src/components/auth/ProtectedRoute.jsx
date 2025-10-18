// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, role = null, redirect = "/login" }) {
  const { isAuthenticated, hasRole, ready } = useAuth();
  const location = useLocation();

  // Wait for auth to be ready before making decisions
  if (!ready) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirect} replace state={{ from: location }} />;
  }

  // Check role if specified
  if (role && !hasRole(role)) {
    // Not authorized for this role - redirect to appropriate page
    if (hasRole("vendor")) {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Render children if provided, otherwise use Outlet for nested routes
  return children || <Outlet />;
}