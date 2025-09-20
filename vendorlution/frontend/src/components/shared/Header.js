import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../logo.png";
import { useState } from "react";

function Header() {
  const nav = useNavigate();
  const {
    isAuthenticated,
    roles,
    activeRole,
    hasRole,
    addVendorRole,
    switchRole,
    logout,
  } = useAuth();

  const [shopMenuOpen, setShopMenuOpen] = useState(false);

  const buyerMenu = [
    { to: "/customer/orders", label: "My Orders", icon: "fa-bag-shopping" },
    { to: "/customer/wallet", label: "My Wallet", icon: "fa-wallet" },
    { to: "/customer/wishlist", label: "Wishlist", icon: "fa-heart" },
    { to: "/customer/inbox", label: "Messages", icon: "fa-comments" },
    { to: "/customer/notifications", label: "Notifications", icon: "fa-bell" },
    { to: "/customer/profile", label: "Profile", icon: "fa-user" },
    { to: "/customer/settings", label: "Settings", icon: "fa-gear" },
  ];

  const shopMenu = [
    { to: "/vendor/dashboard", label: "Dashboard", icon: "fa-chart-line" },
    { to: "/vendor/orders", label: "Orders", icon: "fa-list-check" },
    { to: "/vendor/products", label: "Linked Products", icon: "fa-box" },
    { to: "/vendor/add-product", label: "Add Product", icon: "fa-circle-plus", sub: true },
    { to: "/vendor/inbox", label: "Messages", icon: "fa-comments" },
    { to: "/vendor/wallet", label: "Wallet", icon: "fa-sack-dollar" },
    { to: "/vendor/payouts", label: "Payouts", icon: "fa-money-bill-transfer" },
    { to: "/vendor/reports", label: "Reports", icon: "fa-chart-pie" },
    { to: "/vendor/discounts", label: "Discounts", icon: "fa-tags" },
    { to: "/vendor/reviews", label: "Reviews", icon: "fa-star" },
    { to: "/vendor/profile", label: "Shop Profile", icon: "fa-store" },
    { to: "/vendor/settings", label: "Settings", icon: "fa-gear" },
  ];

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        {/* Hamburger */}
        <button
          className="btn btn-outline-dark me-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
        >
          <i className="fa fa-bars"></i>
        </button>

        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="Vendorlution" height="28" className="me-2" />
          <span className="fw-bold">Vendorlution</span>
        </Link>

        {/* Right icons */}
        <div className="d-flex align-items-center ms-auto gap-2">
          <Link to="/explore-vendors" className="btn btn-sm btn-outline-dark">
            <i className="fa fa-store me-1"></i> Vendors
          </Link>
          <Link to="/customer/wishlist" className="btn btn-sm btn-outline-dark">
            <i className="fa fa-heart"></i>
          </Link>
          <Link to="/cart" className="btn btn-sm btn-outline-dark">
            <i className="fa fa-shopping-cart"></i>
          </Link>
          <Link to="/customer/inbox" className="btn btn-sm btn-outline-dark">
            <i className="fa fa-comments"></i>
          </Link>
          <Link to="/customer/notifications" className="btn btn-sm btn-outline-dark">
            <i className="fa fa-bell"></i>
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/customer/login" className="btn btn-sm btn-dark">
                Sign in
              </Link>
              <Link to="/customer/register" className="btn btn-sm btn-outline-dark">
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Offcanvas */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mainNav"
        aria-labelledby="mainNavLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Navigation</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
          {/* Buyer section */}
          {isAuthenticated && (
            <>
              <div className="fw-bold small text-muted mb-2">Buyer</div>
              <div className="list-group mb-3">
                {buyerMenu.map((i) => (
                  <Link key={i.to} to={i.to} className="list-group-item list-group-item-action">
                    <i className={`fa ${i.icon} me-2`}></i> {i.label}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Vendor: My Shop */}
          {hasRole("vendor") && (
            <>
              <div
                className="fw-bold small text-muted mb-2 d-flex justify-content-between align-items-center"
                onClick={() => setShopMenuOpen(!shopMenuOpen)}
                style={{ cursor: "pointer" }}
              >
                <span>My Shop</span>
                <i className={`fa fa-chevron-${shopMenuOpen ? "up" : "down"}`}></i>
              </div>
              {shopMenuOpen && (
                <div className="list-group mb-3">
                  {shopMenu.map((i) => (
                    <Link key={i.to} to={i.to} className="list-group-item list-group-item-action">
                      <i className={`fa ${i.icon} me-2`}></i> {i.label}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Explore */}
          <div className="fw-bold small text-muted mb-2">Explore</div>
          <div className="list-group">
            <Link to="/" className="list-group-item list-group-item-action">
              <i className="fa fa-compass me-2"></i> Discover
            </Link>
            <Link to="/explore-vendors" className="list-group-item list-group-item-action">
              <i className="fa fa-store me-2"></i> Shops
            </Link>
            <Link to="/products" className="list-group-item list-group-item-action">
              <i className="fa fa-grid-2 me-2"></i> All Products
            </Link>
            <Link to="/categories" className="list-group-item list-group-item-action">
              <i className="fa fa-layer-group me-2"></i> Categories
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
