import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 mt-5">
      <div className="container">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-md-4">
            <h5 className="fw-bold">Vendorlution</h5>
            <p className="small text-muted">
              <div className="text-decoration-none text-light">A modern marketplace with escrow wallets and trusted vendor buyer
              interactions.</div> 
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled small">
              <li>
                <Link to="/categories" className="text-decoration-none text-light">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-decoration-none text-light">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/customer/support" className="text-decoration-none text-light">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Follow Us</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-light fs-5">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-light fs-5">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light fs-5">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary mt-4" />
        <p className="text-center small text-muted mb-0 py-3">
          <div className="text-decoration-none text-light">© {new Date().getFullYear()} Vendorlution. All rights reserved.</div> 
        </p>
      </div>
    </footer>
  );
}

export default Footer;
