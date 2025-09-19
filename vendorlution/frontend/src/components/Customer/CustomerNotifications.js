import React, { useState } from "react";
import Sidebar from "./Sidebar";

function CustomerNotifications() {
  // Mock notifications (replace later with backend)
  const [notifications] = useState([
    {
      id: 1,
      type: "Order",
      message: "Your order #1024 has been shipped.",
      date: "2025-09-17 14:30",
      read: false,
    },
    {
      id: 2,
      type: "Message",
      message: "TechWorld Store replied to your message.",
      date: "2025-09-16 09:15",
      read: true,
    },
    {
      id: 3,
      type: "System",
      message: "New coupon available: WELCOME10",
      date: "2025-09-15 12:00",
      read: false,
    },
  ]);

  const renderBadge = (type) => {
    switch (type) {
      case "Order":
        return <span className="badge bg-primary me-2">{type}</span>;
      case "Message":
        return <span className="badge bg-success me-2">{type}</span>;
      case "System":
        return <span className="badge bg-warning text-dark me-2">{type}</span>;
      default:
        return <span className="badge bg-secondary me-2">{type}</span>;
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Notifications</h3>

          {notifications.length > 0 ? (
            <div className="list-group">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={
                    "list-group-item list-group-item-action d-flex justify-content-between align-items-start " +
                    (n.read ? "opacity-75" : "fw-bold")
                  }
                >
                  <div className="me-auto">
                    {renderBadge(n.type)}
                    {n.message}
                  </div>
                  <small className="text-muted">{n.date}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No notifications at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerNotifications;
