import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../logo.png";

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

  const buyerMenu = [
    { to: "/customer/dashboard", label: "Dashboard", icon: "fa-gauge" },
    { to: "/customer/orders", label: "Orders", icon: "fa-bag-shopping" },
    { to: "/cart", label: "Cart", icon: "fa-cart-shopping" },
    { to: "/customer/wishlist", label: "Wishlist", icon: "fa-heart" },
    { to: "/customer/inbox", label: "Messages", icon: "fa-comments" },
    { to: "/customer/notifications", label: "Notifications", icon: "fa-bell" },
    { to: "/customer/wallet", label: "Wallet", icon: "fa-wallet" },
    { to: "/customer/coupons", label: "Coupons", icon: "fa-ticket" },
    { to: "/customer/profile", label: "Profile", icon: "fa-user" },
    { to: "/customer/addresses", label: "Addresses", icon: "fa-location-dot" },
    { to: "/customer/payment-methods", label: "Payment Methods", icon: "fa-credit-card" },
    { to: "/customer/support", label: "Support", icon: "fa-life-ring" },
    { to: "/customer/change-password", label: "Change Password", icon: "fa-key" },
    { to: "/customer/resolution-center", label: "Resolution Center", icon: "fa-scale-balanced" },
  ];

  const vendorMenu = [
    { to: "/vendor/dashboard", label: "Vendor Dashboard", icon: "fa-chart-line" },
    { to: "/vendor/products", label: "Products", icon: "fa-box" },
    { to: "/vendor/add-product", label: "Add Product", icon: "fa-circle-plus" },
    { to: "/vendor/orders", label: "Orders", icon: "fa-list-check" },
    { to: "/vendor/customers", label: "Customers", icon: "fa-users" },
    { to: "/vendor/inbox", label: "Inbox", icon: "fa-comments" },
    { to: "/vendor/wallet", label: "Wallet", icon: "fa-wallet" },
    { to: "/vendor/payouts", label: "Payouts", icon: "fa-sack-dollar" },
    { to: "/vendor/discounts", label: "Discounts", icon: "fa-tags" },
    { to: "/vendor/reviews", label: "Reviews", icon: "fa-star" },
    { to: "/vendor/reports", label: "Reports", icon: "fa-chart-column" },
    { to: "/vendor/profile", label: "Profile", icon: "fa-user-gear" },
    { to: "/vendor/help", label: "Help", icon: "fa-circle-question" },
    { to: "/vendor/change-password", label: "Change Password", icon: "fa-key" },
  ];

  const renderMenuGroup = (title, items) => (
    <>
      <div className="fw-bold text-uppercase small text-muted mb-2">{title}</div>
      <div className="list-group mb-3">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="list-group-item list-group-item-action">
            <i className={`fa ${i.icon} me-2`}></i> {i.label}
          </Link>
        ))}
      </div>
    </>
  );

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom sticky-top">
      <div className="container d-flex align-items-center">
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
        <Link to="/" className="navbar-brand d-flex align-items-center me-3">
          <img src={logo} alt="Vendorlution" height="28" className="me-2" />
          <span className="fw-bold">Vendorlution</span>
        </Link>

        {/* Searchbar (centered, hidden on mobile) */}
        <form className="d-none d-md-flex flex-grow-1 mx-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search for products, vendors..."
          />
        </form>

        {/* Right icons (quick links) */}
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
              <Link to="/customer/login" className="btn btn-sm btn-dark">Sign in</Link>
              <Link to="/customer/register" className="btn btn-sm btn-outline-dark">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">Logout</button>
          )}
        </div>
      </div>

      {/* Offcanvas: main navigation & role switching */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mainNav"
        aria-labelledby="mainNavLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mainNavLabel">
            Navigation
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div className="offcanvas-body">
          {/* Role Switcher */}
          {isAuthenticated && (
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="small text-muted">Active role</div>
                  <div className="fw-semibold text-capitalize">{activeRole}</div>
                </div>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${activeRole === "buyer" ? "btn-dark" : "btn-outline-dark"}`}
                    onClick={() => switchRole("buyer")}
                  >
                    Buyer
                  </button>
                  {hasRole("vendor") ? (
                    <button
                      className={`btn btn-sm ${activeRole === "vendor" ? "btn-dark" : "btn-outline-dark"}`}
                      onClick={() => switchRole("vendor")}
                    >
                      Seller
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-outline-dark" onClick={addVendorRole}>
                      Start Selling
                    </button>
                  )}
                </div>
              </div>
              <hr />
            </div>
          )}

          {/* Buyer section */}
          {hasRole("buyer") && renderMenuGroup("Buyer", buyerMenu)}

          {/* Vendor section */}
          {hasRole("vendor") && renderMenuGroup("Seller", vendorMenu)}

          {/* Explore section */}
          {renderMenuGroup("Explore", [
            { to: "/", label: "Discover", icon: "fa-compass" },
            { to: "/explore-vendors", label: "Shops", icon: "fa-store" },
            { to: "/products", label: "All Products", icon: "fa-grid-2" },
            { to: "/categories", label: "Categories", icon: "fa-layer-group" },
          ])}
        </div>
      </div>
    </nav>
  );
}

export default Header;
