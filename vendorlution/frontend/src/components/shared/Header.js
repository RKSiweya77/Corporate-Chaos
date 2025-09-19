import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../logo.png";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock counts (replace with Redux/Context later)
  const cartCount = 2;
  const wishlistCount = 5;
  const messageCount = 1;
  const notificationCount = 3;
  const isLoggedIn = false; // replace with auth state

  return (
    <header className="sticky-top bg-white shadow-sm">
      <nav className="navbar navbar-expand-lg navbar-light container">
        {/* Left: Hamburger & Brand */}
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-dark me-2"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mainMenu"
            aria-controls="mainMenu"
            aria-label="Open menu"
          >
            <i className="fa fa-bars" />
          </button>

          <Link
            to="/"
            className="navbar-brand d-flex align-items-center fw-bold me-3"
          >
            <img src={logo} alt="Vendorlution" height="32" className="me-2" />
            Vendorlution
          </Link>
        </div>

        {/* Middle: Search bar */}
        <form className="d-flex flex-grow-1 mx-3">
          <input
            className="form-control"
            type="search"
            placeholder="Search items, shops…"
            aria-label="Search"
          />
          <Link to="/products" className="btn btn-dark ms-2">
            <i className="fa fa-search" />
          </Link>
        </form>

        {/* Right: Icons & Auth */}
        <ul className="navbar-nav ms-auto d-flex align-items-center gap-3">
          {/* Vendors */}
          <li className="nav-item">
            <Link to="/categories" className="nav-link position-relative">
              <i className="fa fa-store fa-lg" title="Vendors"></i>
            </Link>
          </li>

          {/* Wishlist */}
          <li className="nav-item">
            <Link to="/customer/wishlist" className="nav-link position-relative">
              <i className="fa fa-heart fa-lg" title="Wishlist"></i>
              {wishlistCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </li>

          {/* Cart */}
          <li className="nav-item">
            <Link to="/cart" className="nav-link position-relative">
              <i className="fa fa-shopping-cart fa-lg" title="Cart"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>

          {/* Messages */}
          <li className="nav-item">
            <Link to="/customer/inbox" className="nav-link position-relative">
              <i className="fa fa-comments fa-lg" title="Messages"></i>
              {messageCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {messageCount}
                </span>
              )}
            </Link>
          </li>

          {/* Notifications */}
          <li className="nav-item">
            <Link to="/customer/notifications" className="nav-link position-relative">
              <i className="fa fa-bell fa-lg" title="Notifications"></i>
              {notificationCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notificationCount}
                </span>
              )}
            </Link>
          </li>

          {/* Auth buttons */}
          {!isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link
                  className="btn btn-sm btn-outline-dark"
                  to="/customer/login"
                >
                  Sign In
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-sm btn-dark" to="/customer/register">
                  Register
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item dropdown">
              <button
                className="btn btn-outline-dark dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa fa-user me-1"></i> My Account
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/customer/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/customer/orders">
                    Orders
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item text-danger" to="/logout">
                    Logout
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </nav>

      {/* Offcanvas Menu */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mainMenu"
        aria-labelledby="mainMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 id="mainMenuLabel" className="mb-0">
            Browse
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body">
          {/* Categories */}
          <div className="mb-4">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/categories" className="text-decoration-none d-flex align-items-center">
                  <i className="fa fa-plug me-2" /> Electronics
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/categories" className="text-decoration-none d-flex align-items-center">
                  <i className="fa fa-shirt me-2" /> Fashion
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/categories" className="text-decoration-none d-flex align-items-center">
                  <i className="fa fa-couch me-2" /> Home & Living
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-decoration-none d-flex align-items-center">
                  <i className="fa fa-ellipsis-h me-2" /> All Categories
                </Link>
              </li>
            </ul>
          </div>

          <hr />

          {/* Customer shortcuts */}
          <h6 className="text-uppercase text-muted small">Your Account</h6>
          <ul className="list-unstyled mb-4">
            <li>
              <Link to="/customer/dashboard" className="text-decoration-none">
                <i className="fa fa-user me-2" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/customer/orders" className="text-decoration-none">
                <i className="fa fa-box me-2" /> Orders
              </Link>
            </li>
            <li>
              <Link to="/customer/wishlist" className="text-decoration-none">
                <i className="fa fa-heart me-2" /> Wishlist
              </Link>
            </li>
            <li>
              <Link to="/customer/wallet" className="text-decoration-none">
                <i className="fa fa-wallet me-2" /> Wallet
              </Link>
            </li>
            <li>
              <Link to="/customer/inbox" className="text-decoration-none">
                <i className="fa fa-comments me-2" /> Messages
              </Link>
            </li>
          </ul>

          <hr />

          {/* Vendor shortcuts */}
          <h6 className="text-uppercase text-muted small">Sell on Vendorlution</h6>
          <ul className="list-unstyled">
            <li>
              <Link to="/vendor/register" className="text-decoration-none">
                <i className="fa fa-store me-2" /> Become a Seller
              </Link>
            </li>
            <li>
              <Link to="/vendor/dashboard" className="text-decoration-none">
                <i className="fa fa-gauge me-2" /> Vendor Dashboard
              </Link>
            </li>
            <li>
              <Link to="/vendor/products" className="text-decoration-none">
                <i className="fa fa-tags me-2" /> Manage Products
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;
