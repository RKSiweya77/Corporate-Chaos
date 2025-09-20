// components/Vendor/VendorProfile.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.png";
import banner from "../../logo.png";

function VendorProfile() {
  const [menuOpen, setMenuOpen] = useState(false);

  const vendor = {
    storeName: "TechWorld",
    ownerName: "John Doe",
    description: "We sell affordable electronics and accessories.",
    logo: logo,
    banner: banner,
    status: "Active",
    joinDate: "2024-07-01",
    totalProducts: 12,
    completedOrders: 58,
    rating: 4.5,
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center bg-white border-bottom p-2 sticky-top">
        <Link to="/" className="btn btn-outline-dark btn-sm">
          <i className="fa fa-arrow-left me-1"></i> Back Home
        </Link>
        <h5 className="mb-0">{vendor.storeName} Shop Manager</h5>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => setMenuOpen(true)}
        >
          <i className="fa fa-bars"></i>
        </button>
      </div>

      {/* Banner + Logo */}
      <div className="position-relative">
        <img
          src={vendor.banner}
          alt="Banner"
          className="w-100"
          style={{ maxHeight: "200px", objectFit: "cover" }}
        />
        <div className="position-absolute bottom-0 start-50 translate-middle-x text-center">
          <img
            src={vendor.logo}
            alt="Logo"
            className="rounded-circle border border-3 border-white"
            width="100"
            height="100"
            style={{ objectFit: "cover" }}
          />
          <h4 className="mt-2">{vendor.storeName}</h4>
          <span
            className={`badge ${
              vendor.status === "Active" ? "bg-success" : "bg-secondary"
            }`}
          >
            {vendor.status}
          </span>
          <p className="mt-2">{vendor.description}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container my-4">
        <div className="row g-3">
          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-0 text-center p-3">
              <h6>Total Products</h6>
              <h4>{vendor.totalProducts}</h4>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-0 text-center p-3">
              <h6>Orders</h6>
              <h4>{vendor.completedOrders}</h4>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-0 text-center p-3">
              <h6>Rating</h6>
              <h4>⭐ {vendor.rating}</h4>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-0 text-center p-3">
              <h6>Joined</h6>
              <h4>{vendor.joinDate}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Right-Side Hamburger Menu */}
      <div
        className={`offcanvas offcanvas-end ${menuOpen ? "show" : ""}`}
        tabIndex="-1"
        style={{ visibility: menuOpen ? "visible" : "hidden" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Shop Menu</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setMenuOpen(false)}
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="list-group">
            <Link to="/vendor/orders" className="list-group-item list-group-item-action">
              <i className="fa fa-list-check me-2"></i> Orders
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
              <i className="fa fa-wallet me-2"></i> Wallet
            </Link>
            <Link to="/vendor/payouts" className="list-group-item list-group-item-action">
              <i className="fa fa-sack-dollar me-2"></i> Payouts
            </Link>
            <Link to="/vendor/discounts" className="list-group-item list-group-item-action">
              <i className="fa fa-tags me-2"></i> Discounts
            </Link>
            <Link to="/vendor/reviews" className="list-group-item list-group-item-action">
              <i className="fa fa-star me-2"></i> Reviews
            </Link>
            <Link to="/vendor/reports" className="list-group-item list-group-item-action">
              <i className="fa fa-chart-line me-2"></i> Reports
            </Link>
            <Link to="/vendor/help" className="list-group-item list-group-item-action">
              <i className="fa fa-circle-question me-2"></i> Help
            </Link>
            <Link to="/vendor/change-password" className="list-group-item list-group-item-action">
              <i className="fa fa-key me-2"></i> Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;
