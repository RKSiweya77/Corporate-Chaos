// src/components/shared/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand Section */}
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3">
              <i className="fa fa-shield-alt text-primary me-2" />
              Vendorlution
            </h5>
            <p className="mb-3 text-light-emphasis">
              A trusted marketplace with escrow protection. Buy and sell securely with instant EFT, 
              wallet payments, and professional dispute resolution.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <a
                className="btn btn-sm btn-outline-light"
                href="mailto:support@vendorlution.com"
              >
                <i className="fa fa-envelope me-1" />
                Email Support
              </a>
              <a
                className="btn btn-sm btn-outline-light"
                href="https://help.vendorlution.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa fa-question-circle me-1" />
                Help Center
              </a>
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="col-lg-2 col-md-3 col-sm-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-3">Marketplace</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/products">
                  Browse Products
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/vendors">
                  Discover Vendors
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/categories">
                  Categories
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/deals">
                  Special Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="col-lg-2 col-md-3 col-sm-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-3">Your Account</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/wallet">
                  Wallet
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/orders">
                  Orders
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/wishlist">
                  Wishlist
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/settings">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-lg-2 col-md-3 col-sm-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/about">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/how-it-works">
                  How It Works
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/trust-safety">
                  Trust & Safety
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/careers">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-lg-2 col-md-3 col-sm-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-3">Legal</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/terms">
                  Terms of Service
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/cookie-policy">
                  Cookie Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-light text-decoration-none" to="/disputes">
                  Dispute Resolution
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="mb-2 mb-md-0">
            <span className="text-muted">
              &copy; {currentYear} Vendorlution. All rights reserved.
            </span>
          </div>
          <div className="d-flex gap-3">
            <span className="text-muted small">
              <i className="fa fa-shield-alt me-1 text-primary" />
              Protected by Escrow
            </span>
            <span className="text-muted small">
              <i className="fa fa-lock me-1 text-success" />
              Secure Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}