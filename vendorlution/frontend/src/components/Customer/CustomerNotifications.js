// components/Customer/CustomerNotifications.js
import React, { useState } from "react";

function CustomerNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your order #1234 has been delivered 🎉", time: "2h ago", read: false },
    { id: 2, text: "New discount available on electronics 💻", time: "1d ago", read: false },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Notifications</h3>
        {notifications.length > 0 && (
          <button className="btn btn-sm btn-outline-dark" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="list-group list-group-flush">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  !n.read ? "fw-semibold bg-light" : ""
                }`}
              >
                <div>
                  <i className="fa fa-bell me-2 text-warning"></i>
                  {n.text}
                  <div className="small text-muted">{n.time}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {!n.read && <span className="badge bg-danger">New</span>}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-5">
              <i className="fa fa-bell fa-3x mb-3"></i>
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerNotifications;
