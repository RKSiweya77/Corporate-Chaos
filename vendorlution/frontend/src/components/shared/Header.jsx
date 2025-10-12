// src/components/shared/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../logo.png";
import { useMemo, useState } from "react";

function Header() {
  const nav = useNavigate();
  const { isAuthenticated, logout, getVendorId } = useAuth();

  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  const vendorId = useMemo(() => {
    const v = getVendorId && getVendorId();
    return v ? Number(v) : null;
  }, [getVendorId]);

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const onSearch = (e) => {
    e.preventDefault();
    const term = (q || "").trim();
    nav(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
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
        >
          <i className="fa fa-bars"></i>
        </button>

        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="Vendorlution" height="28" className="me-2" />
          <span className="fw-bold">Vendorlution</span>
        </Link>

        {/* Searchbar */}
        <form onSubmit={onSearch} className="d-none d-md-flex mx-auto" style={{ width: "40%" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search products, vendors..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Quick icons */}
        <div className="d-flex align-items-center gap-2">
          {vendorId && (
            <Link to="/vendor/dashboard" className="btn btn-sm btn-outline-dark">
              <i className="fa fa-store me-1"></i> My Shop
            </Link>
          )}
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
              <Link to="/customer/login" className="btn btn-sm btn-dark">Sign in</Link>
              <Link to="/customer/register" className="btn btn-sm btn-outline-dark">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">Logout</button>
          )}
        </div>
      </div>

      {/* Offcanvas menu */}
      <div className="offcanvas offcanvas-start" id="mainNav">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Navigation</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>

        <div className="offcanvas-body">
          {/* Buyer */}
          <div className="fw-bold small text-muted mb-2">Buyer</div>
          <div className="list-group mb-3">
            <Link to="/customer/orders" className="list-group-item list-group-item-action">
              <i className="fa fa-bag-shopping me-2"></i> My Orders
            </Link>

            {/* Wallet dropdown */}
            <div
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => setWalletMenuOpen(!walletMenuOpen)}
              style={{ cursor: "pointer" }}
            >
              <span><i className="fa fa-wallet me-2"></i> My Wallet</span>
              <i className={`fa fa-chevron-${walletMenuOpen ? "up" : "down"}`}></i>
            </div>
            {walletMenuOpen && (
              <div className="list-group ps-4">
                <Link to="/customer/wallet" className="list-group-item list-group-item-action">Wallet Overview</Link>
                <Link to="/customer/wallet/deposit" className="list-group-item list-group-item-action">Deposit</Link>
                <Link to="/customer/wallet/withdraw" className="list-group-item list-group-item-action">Withdraw</Link>
                <Link to="/customer/payment-methods" className="list-group-item list-group-item-action">Payment Methods</Link>
              </div>
            )}

            <Link to="/customer/wishlist" className="list-group-item list-group-item-action">
              <i className="fa fa-heart me-2"></i> Wishlist
            </Link>
            <Link to="/customer/inbox" className="list-group-item list-group-item-action">
              <i className="fa fa-comments me-2"></i> Messages
            </Link>
          </div>

          {/* Vendor My Shop */}
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
              {vendorId ? (
                <>
                  <Link to="/vendor/dashboard" className="list-group-item list-group-item-action">
                    <i className="fa fa-store me-2"></i> Shop Overview
                  </Link>
                  <Link to="/vendor/edit-profile" className="list-group-item list-group-item-action">
                    <i className="fa fa-pen-to-square me-2"></i> Edit Shop
                  </Link>
                  <Link to="/vendor/products" className="list-group-item list-group-item-action">
                    <i className="fa fa-box me-2"></i> Linked Products
                  </Link>
                  <Link to="/vendor/add-product" className="list-group-item list-group-item-action">
                    <i className="fa fa-circle-plus me-2"></i> Add Product
                  </Link>
                  <Link to="/vendor/inbox" className="list-group-item list-group-item-action">
                    <i className="fa fa-comments me-2"></i> Messages
                  </Link>
                  <Link to="/vendor/wallet" className="list-group-item list-group-item-action">
                    <i className="fa fa-sack-dollar me-2"></i> Wallet
                  </Link>
                  <Link to="/vendor/payouts" className="list-group-item list-group-item-action">
                    <i className="fa fa-money-bill-transfer me-2"></i> Payouts
                  </Link>
                  <Link to="/vendor/reports" className="list-group-item list-group-item-action">
                    <i className="fa fa-chart-line me-2"></i> Reports
                  </Link>
                  <Link to="/vendor/discounts" className="list-group-item list-group-item-action">
                    <i className="fa fa-tags me-2"></i> Discounts
                  </Link>
                  <Link to="/vendor/reviews" className="list-group-item list-group-item-action">
                    <i className="fa fa-star me-2"></i> Reviews
                  </Link>
                </>
              ) : (
                <Link to={isAuthenticated ? "/vendor/create" : "/customer/login"} className="list-group-item list-group-item-action">
                  <i className="fa fa-circle-plus me-2"></i> Create Shop
                </Link>
              )}
            </div>
          )}

          {/* Settings */}
          <div
            className="fw-bold small text-muted mb-2 d-flex justify-content-between align-items-center"
            onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
            style={{ cursor: "pointer" }}
          >
            <span>Settings</span>
            <i className={`fa fa-chevron-${settingsMenuOpen ? "up" : "down"}`}></i>
          </div>
          {settingsMenuOpen && (
            <div className="list-group mb-3">
              <Link to="/customer/profile" className="list-group-item list-group-item-action">
                <i className="fa fa-user me-2"></i> Update Profile
              </Link>
              <Link to="/customer/change-password" className="list-group-item list-group-item-action">
                <i className="fa fa-key me-2"></i> Change Password
              </Link>
              <div className="list-group-item d-flex align-items-center">
                <i className="fa fa-moon me-2"></i> Dark Mode
                <div className="form-check form-switch ms-auto">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
