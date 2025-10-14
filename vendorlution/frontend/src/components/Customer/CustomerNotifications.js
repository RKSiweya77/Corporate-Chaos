// components/Customer/CustomerNotifications.js
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function fmt(d) {
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

export default function CustomerNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    setErr("");
    api.get("/me/notifications/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setItems(data);
      })
      .catch(() => setErr("Failed to load notifications"))
      .finally(() => setLoading(false));
  };

  const markRead = async (id) => {
    try {
      await api.post(`/me/notifications/${id}/read/`);
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    const unread = items.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => api.post(`/me/notifications/${n.id}/read/`).catch(()=>{})));
    load();
  };

  useEffect(load, []);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Notifications</h3>
        {items.some((n) => !n.is_read) && (
          <button className="btn btn-sm btn-outline-dark" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="list-group list-group-flush">
          {items.length ? (
            items.map((n) => (
              <div
                key={n.id}
                className={`list-group-item d-flex justify-content-between align-items-start ${!n.is_read ? "bg-light" : ""}`}
              >
                <div className="me-3">
                  <i className={`fa me-2 ${n.type === "order"
                      ? "fa-box text-success"
                      : n.type === "promo"
                      ? "fa-tags text-primary"
                      : n.type === "dispute"
                      ? "fa-scale-balanced text-danger"
                      : "fa-bell text-secondary"}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="small">{n.message}</div>
                  <div className="small text-muted">{fmt(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <button className="btn btn-sm btn-outline-dark" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
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
