// components/Customer/CustomerNotifications.js
import React from "react";

function CustomerNotifications() {
  const notifications = [
    { id: 1, text: "Your order #1234 has been delivered", time: "2h ago" },
    { id: 2, text: "New discount available on electronics", time: "1d ago" },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">Notifications</h3>
      <div className="list-group shadow-sm">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{n.text}</span>
              <small className="text-muted">{n.time}</small>
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-5">
            <i className="fa fa-bell fa-2x mb-2"></i>
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerNotifications;
