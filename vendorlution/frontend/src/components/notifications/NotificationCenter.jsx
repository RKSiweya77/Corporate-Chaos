// src/components/notifications/NotificationCenter.jsx
import { useEffect, useState, useCallback } from "react";
import { useNotifications } from "../../context/NotificationsContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import { relativeTime, typeIcon } from "../../utils/formatters";

export default function NotificationCenter() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      setLocalLoading(true);
      await fetchNotifications();
      setLocalLoading(false);
    };
    loadNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [markAsRead]);

  const handleRemoveNotification = useCallback(async (notificationId) => {
    try {
      await removeNotification(notificationId);
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  }, [removeNotification]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [markAllAsRead]);

  const hasUnread = notifications?.some(n => !n.is_read);

  if (loading || localLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Notifications</h1>
          <p className="text-muted mb-0">
            {notifications?.length || 0} total notifications
            {hasUnread && ` • ${notifications.filter(n => !n.is_read).length} unread`}
          </p>
        </div>
        {hasUnread && (
          <button 
            className="btn btn-primary"
            onClick={handleMarkAllAsRead}
            disabled={loading}
          >
            <i className="fa fa-check-double me-2" />
            Mark all as read
          </button>
        )}
      </div>

      {!notifications?.length ? (
        <EmptyState
          icon="fa-bell-slash"
          title="No notifications yet"
          subtitle="You'll see important updates about orders, messages, and account activity here."
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="list-group list-group-flush">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`list-group-item border-0 ${
                  !notification.is_read ? "bg-light" : ""
                }`}
              >
                <div className="d-flex align-items-start">
                  <div className="flex-shrink-0 mt-1 me-3">
                    <i className={`fa ${typeIcon(notification.type)} text-primary fa-lg`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-0 fw-semibold">
                        {notification.title || "Notification"}
                        {!notification.is_read && (
                          <span className="badge bg-primary ms-2">New</span>
                        )}
                      </h6>
                      <small className="text-muted flex-shrink-0 ms-2">
                        {relativeTime(notification.created_at)}
                      </small>
                    </div>
                    {notification.message && (
                      <p className="text-muted mb-2">{notification.message}</p>
                    )}
                    {notification.link && (
                      <a 
                        href={notification.link} 
                        className="btn btn-sm btn-outline-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View details
                      </a>
                    )}
                  </div>
                  <div className="flex-shrink-0 ms-3 d-flex gap-1">
                    {!notification.is_read && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={loading}
                        title="Mark as read"
                      >
                        <i className="fa fa-check" />
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveNotification(notification.id)}
                      disabled={loading}
                      title="Delete notification"
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}