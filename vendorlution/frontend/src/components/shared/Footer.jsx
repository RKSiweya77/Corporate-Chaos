// src/components/shared/Footer.jsx
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-dark text-light mt-5">
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="mb-2">Vendorlution</h5>
            <p className="small text-muted mb-0">
              A modern marketplace with escrow wallets and trusted vendor–buyer interactions.
            </p>
          </div>

          <div className="col-md-4">
            <h6 className="mb-2">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-1">
                <Link className="text-decoration-none text-light" to="/categories">
                  Categories
                </Link>
              </li>
              <li className="mb-1">
                <Link className="text-decoration-none text-light" to="/products">
                  All Products
                </Link>
              </li>
              <li>
                <Link className="text-decoration-none text-light" to="/customer/support">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="mb-2">Follow Us</h6>
            <ul className="list-inline mb-0">
              <li className="list-inline-item me-3"><i className="fa-brands fa-facebook"></i></li>
              <li className="list-inline-item me-3"><i className="fa-brands fa-twitter"></i></li>
              <li className="list-inline-item"><i className="fa-brands fa-instagram"></i></li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex justify-content-between small text-muted">
          <span>© {new Date().getFullYear()} Vendorlution. All rights reserved.</span>
          <span>Made with ❤️</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
