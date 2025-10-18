// src/components/shared/Header.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import NotificationBell from "../notifications/NotificationBell";
import { ZAR } from "../../utils/formatters";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close dropdowns when route changes
  useEffect(() => {
    setOffcanvasOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const term = searchQuery.trim();
    if (!term) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchQuery("");
  }, [searchQuery, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
  }, [logout, navigate]);

  const isVendor = hasRole("vendor") || !!user?.vendor_id;

  const userNavigation = useMemo(() => [
    { to: "/profile", label: "My Profile", icon: "fa-user" },
    { to: "/orders", label: "My Orders", icon: "fa-shopping-bag" },
    { to: "/wallet", label: "Wallet", icon: "fa-wallet" },
    { to: "/wishlist", label: "Wishlist", icon: "fa-heart" },
    { to: "/settings", label: "Settings", icon: "fa-cog" },
    { type: "divider" },
    { to: "#logout", label: "Sign Out", icon: "fa-sign-out", action: handleLogout }
  ], [handleLogout]);

  return (
    <header className="border-bottom bg-white shadow-sm sticky-top">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light py-2 py-lg-3">
        <div className="container">
          {/* Brand and Mobile Toggle */}
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-dark me-2 d-lg-none"
              onClick={() => setOffcanvasOpen(true)}
              aria-label="Toggle navigation"
            >
              <i className="fa fa-bars" />
            </button>

            <Link to="/" className="navbar-brand fw-bold text-dark fs-4">
              <i className="fa fa-shield-alt text-primary me-2" />
              Vendorlution
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="d-none d-lg-flex mx-4 flex-grow-1"
            style={{ maxWidth: "500px" }}
            role="search"
          >
            <div className="input-group">
              <input
                type="search"
                className="form-control border-end-0"
                placeholder="Search products, vendors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
              <button
                type="submit"
                className="btn btn-dark border-start-0"
                aria-label="Submit search"
              >
                <i className="fa fa-search" />
              </button>
            </div>
          </form>

          {/* Navigation Actions */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            {/* Search Toggle - Mobile */}
            <button
              className="btn btn-outline-dark d-lg-none"
              onClick={() => navigate("/search")}
              aria-label="Search"
            >
              <i className="fa fa-search" />
            </button>

            {/* Vendor Dashboard */}
            {isVendor && (
              <Link to="/vendor/dashboard" className="btn btn-outline-success btn-sm d-none d-md-inline-flex">
                <i className="fa fa-store me-1" />
                Vendor Dashboard
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* Shopping Actions */}
            <Link to="/wishlist" className="btn btn-outline-dark position-relative" title="Wishlist">
              <i className="fa fa-heart" />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="btn btn-outline-dark position-relative" title="Cart">
              <i className="fa fa-shopping-cart" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                0
              </span>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-dark dropdown-toggle d-flex align-items-center"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <i className="fa fa-user me-1" />
                  <span className="d-none d-sm-inline">{user?.username || 'Account'}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2">
                    <div className="dropdown-header">
                      <div className="fw-bold">{user?.username || 'User'}</div>
                      <div className="small text-muted">{user?.email}</div>
                    </div>
                    
                    {userNavigation.map((item, index) => (
                      item.type === "divider" ? (
                        <div key={index} className="dropdown-divider" />
                      ) : (
                        <button
                          key={index}
                          className="dropdown-item d-flex align-items-center"
                          onClick={item.action || (() => navigate(item.to))}
                        >
                          <i className={`fa ${item.icon} me-2 text-muted`} />
                          {item.label}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-dark">Sign In</Link>
                <Link to="/register" className="btn btn-dark">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="border-top bg-light d-none d-lg-block">
        <div className="container">
          <ul className="nav nav-pills justify-content-center py-2">
            <li className="nav-item">
              <NavLink to="/products" className="nav-link">
                <i className="fa fa-grid me-1" />
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/vendors" className="nav-link">
                <i className="fa fa-store me-1" />
                Vendors
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/categories" className="nav-link">
                <i className="fa fa-tags me-1" />
                Categories
              </NavLink>
            </li>
            {isVendor ? (
              <>
                <li className="nav-item">
                  <NavLink to="/vendor/orders" className="nav-link">
                    <i className="fa fa-list-check me-1" />
                    Vendor Orders
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/vendor/products" className="nav-link">
                    <i className="fa fa-box me-1" />
                    My Products
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <NavLink to="/vendor/create" className="nav-link text-success">
                  <i className="fa fa-plus-circle me-1" />
                  Open a Shop
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile Offcanvas Menu */}
      <MobileMenu 
        open={offcanvasOpen} 
        onClose={() => setOffcanvasOpen(false)}
        isAuthenticated={isAuthenticated}
        isVendor={isVendor}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}

// Mobile Menu Component
function MobileMenu({ open, onClose, isAuthenticated, isVendor, user, onLogout }) {
  const navigate = useNavigate();

  const menuSections = [
    {
      title: "Browse",
      links: [
        { to: "/", label: "Home", icon: "fa-house" },
        { to: "/products", label: "Products", icon: "fa-grid" },
        { to: "/vendors", label: "Vendors", icon: "fa-store" },
        { to: "/categories", label: "Categories", icon: "fa-tags" },
      ],
    },
    {
      title: "Account",
      links: [
        { to: "/wallet", label: "Wallet", icon: "fa-wallet" },
        { to: "/orders", label: "Orders", icon: "fa-shopping-bag" },
        { to: "/wishlist", label: "Wishlist", icon: "fa-heart" },
        { to: "/chat", label: "Messages", icon: "fa-comments" },
      ],
    },
    isVendor
      ? {
          title: "My Shop",
          links: [
            { to: "/vendor/dashboard", label: "Dashboard", icon: "fa-gauge" },
            { to: "/vendor/orders", label: "Orders", icon: "fa-list-check" },
            { to: "/vendor/products", label: "Products", icon: "fa-box" },
            { to: "/vendor/analytics", label: "Analytics", icon: "fa-chart-line" },
          ],
        }
      : {
          title: "Become a Vendor",
          links: [{ to: "/vendor/create", label: "Open a Shop", icon: "fa-store" }],
        },
    {
      title: isAuthenticated ? "Account" : "Authentication",
      links: !isAuthenticated
        ? [
            { to: "/login", label: "Sign In", icon: "fa-right-to-bracket" },
            { to: "/register", label: "Register", icon: "fa-user-plus" },
          ]
        : [
            { to: "/profile", label: "Profile", icon: "fa-user" },
            { to: "/settings", label: "Settings", icon: "fa-cog" },
            { to: "#logout", label: "Sign Out", icon: "fa-right-from-bracket", action: onLogout },
          ],
    },
  ];

  return (
    <div
      className={`offcanvas offcanvas-start ${open ? "show" : ""}`}
      style={{ visibility: open ? "visible" : "hidden" }}
      tabIndex="-1"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold">
          <i className="fa fa-shield-alt text-primary me-2" />
          Vendorlution
        </h5>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close menu"
        />
      </div>
      
      <div className="offcanvas-body">
        {isAuthenticated && user && (
          <div className="mb-4 p-3 bg-light rounded">
            <div className="fw-bold">{user.username}</div>
            <div className="small text-muted">{user.email}</div>
          </div>
        )}

        {menuSections.map((section, index) => (
          <div key={index} className="mb-4">
            <div className="fw-bold small text-muted text-uppercase mb-2 px-3">
              {section.title}
            </div>
            <div className="list-group list-group-flush">
              {section.links.map((link, linkIndex) => (
                <button
                  key={linkIndex}
                  className="list-group-item list-group-item-action border-0 px-3 py-2"
                  onClick={link.action || (() => { navigate(link.to); onClose(); })}
                >
                  <i className={`fa ${link.icon} me-3 text-muted`} />
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}