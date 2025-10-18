// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    // Update document title for better UX
    document.title = "Page Not Found - Vendorlution";
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 text-center">
          {/* Animated 404 graphic */}
          <div className="mb-4">
            <div className="display-1 fw-bold text-muted opacity-25 mb-2">404</div>
            <div className="fa fa-map-signs fa-4x text-muted mb-3 opacity-50"></div>
          </div>
          
          {/* Content */}
          <h1 className="h2 fw-bold mb-3">Page Not Found</h1>
          <p className="text-muted mb-4 lead">
            The page you're looking for doesn't exist or may have been moved. 
            Let's get you back on track.
          </p>
          
          {/* Action buttons */}
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/" className="btn btn-dark btn-lg px-4">
              <i className="fa fa-home me-2" />
              Go Home
            </Link>
            <Link to="/products" className="btn btn-outline-dark btn-lg px-4">
              <i className="fa fa-store me-2" />
              Browse Products
            </Link>
            <Link to="/vendors" className="btn btn-outline-secondary btn-lg px-4">
              <i className="fa fa-storefront me-2" />
              Explore Vendors
            </Link>
          </div>

          {/* Additional help */}
          <div className="mt-5 pt-4 border-top">
            <p className="text-muted small mb-2">Still need help?</p>
            <div className="d-flex gap-2 justify-content-center">
              <a href="/contact" className="text-decoration-none small">
                <i className="fa fa-envelope me-1" /> Contact Support
              </a>
              <span className="text-muted">•</span>
              <a href="/help" className="text-decoration-none small">
                <i className="fa fa-question-circle me-1" /> Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}