// src/context/NotificationsContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";
import { useAuth } from "./AuthContext";

export const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      const r = await api.get(API_ENDPOINTS.notifications.list);
      const list = Array.isArray(r.data) ? r.data : r.data?.results || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id) => {
    await api.post(API_ENDPOINTS.notifications.markRead(id));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => api.post(API_ENDPOINTS.notifications.markRead(n.id))));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev]);
    if (!notif.is_read) setUnreadCount((c) => c + 1);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.is_read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // polling optional
  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, [isAuthenticated, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAll: () => {
      setNotifications([]);
      setUnreadCount(0);
    },
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
