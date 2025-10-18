// src/components/notifications/NotificationBell.jsx
import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationsContext";
import { relativeTime, typeIcon } from "../../utils/formatters";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  // Add event listener for outside clicks
  useState(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const recentNotifications = (notifications || []).slice(0, 8);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
    setIsOpen(false);
  }, [markAllAsRead]);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-outline-dark position-relative border-0"
        style={{ background: "transparent" }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <i className="fa fa-bell fa-lg" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? "99+" : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute top-100 end-0 mt-2 shadow-lg rounded"
          style={{ width: "380px", maxWidth: "90vw", zIndex: 1060 }}
        >
          <div className="card border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="mb-0 fw-bold">
                Notifications
                {unreadCount > 0 && (
                  <span className="badge bg-primary ms-2">{unreadCount}</span>
                )}
              </h6>
              {unreadCount > 0 && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div 
              className="list-group list-group-flush" 
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {recentNotifications.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fa fa-bell-slash fa-2x mb-2" />
                  <div>No notifications</div>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`list-group-item list-group-item-action text-start border-0 ${
                      notification.is_read ? "" : "bg-light fw-medium"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="d-flex gap-2">
                      <div className="flex-shrink-0 pt-1">
                        <i className={`fa ${typeIcon(notification.type)} text-primary`} />
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="fw-semibold text-truncate">
                            {notification.title || "Notification"}
                          </div>
                          <small className="text-muted flex-shrink-0 ms-2">
                            {relativeTime(notification.created_at)}
                          </small>
                        </div>
                        {notification.message && (
                          <div className="small text-muted text-truncate-2">
                            {notification.message}
                          </div>
                        )}
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <span 
                            className="badge bg-primary rounded-circle"
                            style={{ width: "8px", height: "8px" }}
                            aria-label="Unread"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="card-footer bg-light text-center py-2">
              <Link 
                to="/notifications" 
                className="btn btn-sm btn-outline-dark"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}