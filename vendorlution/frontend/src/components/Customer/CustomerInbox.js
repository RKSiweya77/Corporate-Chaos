// components/Customer/CustomerInbox.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.png";

function CustomerInbox() {
  const [conversations] = useState([
    {
      id: 1,
      vendor: "TechWorld",
      lastMessage: "Your order has shipped 🚚",
      time: "10:45 AM",
      unread: true,
    },
    {
      id: 2,
      vendor: "Fashion Hub",
      lastMessage: "New arrivals in store! 👗",
      time: "Yesterday",
      unread: false,
    },
  ]);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Messages</h3>

      <div className="card shadow-sm border-0">
        <div className="list-group list-group-flush">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/customer/inbox/${c.id}`}
              className="list-group-item list-group-item-action d-flex align-items-center"
            >
              {/* Vendor avatar (placeholder logo for now) */}
              <img
                src={logo}
                alt={c.vendor}
                width="48"
                height="48"
                className="rounded-circle me-3 border"
                style={{ objectFit: "cover" }}
              />

              {/* Message content */}
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <h6 className={`mb-0 ${c.unread ? "fw-bold" : ""}`}>
                    {c.vendor}
                  </h6>
                  <small className="text-muted">{c.time}</small>
                </div>
                <p
                  className={`mb-0 small ${
                    c.unread ? "fw-semibold text-dark" : "text-muted"
                  }`}
                >
                  {c.lastMessage}
                </p>
              </div>

              {/* Unread indicator */}
              {c.unread && (
                <span className="badge bg-danger rounded-pill ms-2">New</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerInbox;
