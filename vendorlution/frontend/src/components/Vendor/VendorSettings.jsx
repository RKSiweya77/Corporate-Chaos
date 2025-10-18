// src/components/vendor/VendorSettings.jsx
import { useEffect, useState } from "react";

const LS_KEY = "vendorlution_vendor_prefs";

export default function VendorSettings() {
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    order_updates: true,
    message_alerts: true,
    low_stock_alerts: false,
    dark_mode: false,
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const savePrefs = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(prefs));
      setMsg("Settings saved.");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Failed to save settings.");
    }
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">Vendor Settings</h4>

      <div className="card shadow-sm">
        <div className="card-header fw-600">Preferences</div>
        <div className="card-body">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="emailNotifications"
              checked={prefs.email_notifications}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, email_notifications: e.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="emailNotifications">
              Email notifications
            </label>
          </div>

          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="orderUpdates"
              checked={prefs.order_updates}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, order_updates: e.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="orderUpdates">
              Order status updates
            </label>
          </div>

          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="messageAlerts"
              checked={prefs.message_alerts}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, message_alerts: e.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="messageAlerts">
              Message alerts
            </label>
          </div>

          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="lowStockAlerts"
              checked={prefs.low_stock_alerts}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, low_stock_alerts: e.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="lowStockAlerts">
              Low stock alerts
            </label>
          </div>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="darkMode"
              checked={prefs.dark_mode}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, dark_mode: e.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="darkMode">
              Dark mode (UI preference)
            </label>
          </div>

          {msg && (
            <div
              className={`alert ${
                msg.includes("Failed") ? "alert-danger" : "alert-success"
              } py-2`}
            >
              {msg}
            </div>
          )}

          <button className="btn btn-dark" onClick={savePrefs}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}