// src/components/shared/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dock-footer mt-auto">
      <style>{`
        .dock-footer {
          --bg: #0b0614;
          --panel: #0b0614;
          --panel-soft: #100a1f;
          --panel-border: #1f1932;
          --text: #e7e6ea;
          --text-muted: #bfb9cf;
          --accent: #0d6efd;
          --glass: rgba(6,0,16,.9);
          --shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04);

          background: var(--bg);
          color: var(--text);
          border-top: 1px solid var(--panel-border);
        }

        .dock-footer .wrap {
          background: var(--glass);
          border: 1px solid var(--panel-border);
          border-radius: 16px;
          box-shadow: var(--shadow);
        }

        .dock-footer h5,
        .dock-footer h6 { color: #fff; }

        .dock-footer .muted { color: var(--text-muted); }

        .dock-footer .link {
          color: var(--text);
          text-decoration: none;
          border-radius: 8px;
          padding: 2px 0;
          transition: color .15s ease, background .15s ease;
        }
        .dock-footer .link:hover { color: #fff; }

        .dock-footer .chip-btn {
          border: 1px solid var(--panel-border);
          background: var(--panel-soft);
          color: var(--text);
          padding: .4rem .6rem;
          border-radius: 10px;
          transition: background .15s ease, border-color .15s ease;
        }
        .dock-footer .chip-btn:hover {
          background: #16102a;
          border-color: #2b2444;
        }

        .dock-footer .divider {
          border-color: var(--panel-border) !important;
          opacity: 1;
        }

        .dock-footer .kicker {
          color: var(--text-muted);
        }

        /* prevent dock overlap room at the very bottom on pages with short content */
        .dock-footer .bottom-pad { height: 12px; }

        /* fine-tune list spacing */
        .dock-footer ul { margin: 0; padding: 0; list-style: none; }
        .dock-footer li { margin-bottom: .55rem; }
      `}</style>

      <div className="container py-4">
        <div className="wrap p-4 p-md-5">
          <div className="row g-4">
            {/* Brand */}
            <div className="col-lg-4 col-md-6">
              <h5 className="fw-bold mb-3">
                <i className="fa fa-shield-alt text-primary me-2" />
                Vendorlution
              </h5>
              <p className="mb-3 muted">
                A trusted marketplace with escrow protection. Buy and sell securely with Instant EFT,
                wallet payments, and professional dispute resolution.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <a className="chip-btn" href="mailto:support@vendorlution.com">
                  <i className="fa fa-envelope me-1" />
                  Email Support
                </a>
                <a
                  className="chip-btn"
                  href="https://help.vendorlution.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-question-circle me-1" />
                  Help Center
                </a>
              </div>
            </div>

            {/* Marketplace */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <h6 className="text-uppercase small fw-bold muted mb-3">Marketplace</h6>
              <ul>
                <li><Link className="link" to="/products">Browse Products</Link></li>
                <li><Link className="link" to="/vendors">Discover Vendors</Link></li>
                <li><Link className="link" to="/categories">Categories</Link></li>
                <li><Link className="link" to="/deals">Special Deals</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <h6 className="text-uppercase small fw-bold muted mb-3">Your Account</h6>
              <ul>
                <li><Link className="link" to="/wallet">Wallet</Link></li>
                <li><Link className="link" to="/orders">Orders</Link></li>
                <li><Link className="link" to="/wishlist">Wishlist</Link></li>
                <li><Link className="link" to="/settings">Settings</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <h6 className="text-uppercase small fw-bold muted mb-3">Company</h6>
              <ul>
                <li><Link className="link" to="/about">About Us</Link></li>
                <li><Link className="link" to="/how-it-works">How It Works</Link></li>
                <li><Link className="link" to="/trust-safety">Trust & Safety</Link></li>
                <li><Link className="link" to="/careers">Careers</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <h6 className="text-uppercase small fw-bold muted mb-3">Legal</h6>
              <ul>
                <li><Link className="link" to="/terms">Terms of Service</Link></li>
                <li><Link className="link" to="/privacy">Privacy Policy</Link></li>
                <li><Link className="link" to="/cookie-policy">Cookie Policy</Link></li>
                <li><Link className="link" to="/disputes">Dispute Resolution</Link></li>
              </ul>
            </div>
          </div>

          <hr className="divider my-4" />

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="mb-2 mb-md-0 kicker">
              &copy; {currentYear} Vendorlution. All rights reserved.
            </div>
            <div className="d-flex gap-3 kicker">
              <span>
                <i className="fa fa-shield-alt me-1 text-primary" />
                Protected by Escrow
              </span>
              <span>
                <i className="fa fa-lock me-1 text-success" />
                Secure Payments
              </span>
            </div>
          </div>
        </div>

        {/* small buffer so the fixed Dock never overlaps footer content */}
        <div className="bottom-pad" />
      </div>
    </footer>
  );
}