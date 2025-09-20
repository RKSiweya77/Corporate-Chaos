// components/Vendor/VendorProfile.js
import React from "react";
import { Link } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";

function VendorProfile() {
  const { vendor } = useVendor();

  const menuItems = [
    { to: "/vendor/orders", label: "Orders", icon: "fa-list-check", color: "primary" },
    { to: "/vendor/products", label: "Products", icon: "fa-box", color: "success" },
    { to: "/vendor/add-product", label: "Add Product", icon: "fa-circle-plus", color: "dark" },
    { to: "/vendor/inbox", label: "Messages", icon: "fa-comments", color: "info" },
    { to: "/vendor/wallet", label: "Wallet", icon: "fa-wallet", color: "secondary" },
    { to: "/vendor/payouts", label: "Payouts", icon: "fa-sack-dollar", color: "warning" },
    { to: "/vendor/discounts", label: "Discounts", icon: "fa-tags", color: "danger" },
    { to: "/vendor/reviews", label: "Reviews", icon: "fa-star", color: "success" },
    { to: "/vendor/reports", label: "Reports", icon: "fa-chart-line", color: "primary" },
    { to: "/vendor/help", label: "Help", icon: "fa-circle-question", color: "dark" },
    { to: "/vendor/change-password", label: "Change Password", icon: "fa-key", color: "secondary" },
    { to: "/vendor/edit-profile", label: "Edit Store Profile", icon: "fa-pen-to-square", color: "info" },
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Banner */}
      <div className="position-relative">
        <img
          src={vendor.banner}
          alt="Banner"
          className="w-100"
          style={{ height: "220px", objectFit: "cover" }}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.4)" }}
        ></div>
        <div className="position-absolute bottom-0 start-50 translate-middle-x text-center text-white mb-3">
          <img
            src={vendor.logo}
            alt="Logo"
            className="rounded-circle border border-3 border-white shadow"
            width="100"
            height="100"
            style={{ objectFit: "cover" }}
          />
          <h3 className="mt-2 fw-bold">{vendor.storeName}</h3>
          <span
            className={`badge ${vendor.status === "Active" ? "bg-success" : "bg-secondary"}`}
          >
            {vendor.status}
          </span>
          <p className="mt-2 small">{vendor.description}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container my-5">
        <div className="row g-4">
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <i className="fa fa-box fa-2x mb-2 text-primary"></i>
                <h6 className="fw-bold">Products</h6>
                <p className="mb-0">{vendor.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <i className="fa fa-shopping-bag fa-2x mb-2 text-success"></i>
                <h6 className="fw-bold">Orders</h6>
                <p className="mb-0">{vendor.completedOrders}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <i className="fa fa-star fa-2x mb-2 text-warning"></i>
                <h6 className="fw-bold">Rating</h6>
                <p className="mb-0">⭐ {vendor.rating}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <i className="fa fa-calendar fa-2x mb-2 text-secondary"></i>
                <h6 className="fw-bold">Joined</h6>
                <p className="mb-0">{vendor.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu as Cards */}
      <div className="container my-5">
        <h4 className="mb-4 fw-bold">Shop Management</h4>
        <div className="row g-4">
          {menuItems.map((item) => (
            <div key={item.to} className="col-md-4 col-sm-6">
              <Link to={item.to} className="text-decoration-none">
                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                  <div className="card-body py-4">
                    <i className={`fa ${item.icon} fa-2x mb-3 text-${item.color}`}></i>
                    <h6 className="fw-bold text-dark">{item.label}</h6>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;
