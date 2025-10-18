// src/components/shared/Header.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const isVendor = hasRole("vendor") || !!user?.vendor_id;

  // Close any transient UI on route change (placeholder; dock is minimal)
  useEffect(() => {}, [location.pathname]);

  // Global dark theme (remove to revert)
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = "#0a0513";
    document.body.style.color = "#e7e6ea";
    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Dock items
  const items = useMemo(() => {
    const base = [
      { key: "home", label: "Home", icon: "fa-house", action: () => navigate("/") },
      { key: "products", label: "Products", icon: "fa-grid", action: () => navigate("/products") },
      { key: "vendors", label: "Vendors", icon: "fa-store", action: () => navigate("/vendors") },
      { key: "categories", label: "Categories", icon: "fa-tags", action: () => navigate("/categories") },
      { key: "search", label: "Search", icon: "fa-magnifying-glass", action: () => navigate("/search") },
      { key: "wishlist", label: "Wishlist", icon: "fa-heart", action: () => navigate("/wishlist"),
        badge: unreadCount > 0 ? unreadCount : null },
      { key: "cart", label: "Cart", icon: "fa-cart-shopping", action: () => navigate("/cart") },
      { key: "notifications", label: "Alerts", icon: "fa-bell", action: () => navigate("/notifications") },
    ];
    const shop = isVendor
      ? [{ key: "vdash", label: "Vendor", icon: "fa-shop", action: () => navigate("/vendor/dashboard") }]
      : [{ key: "openshop", label: "Open Shop", icon: "fa-plus", action: () => navigate("/vendor/create-shop") }];

    const account = isAuthenticated
      ? [
          { key: "profile", label: "Profile", icon: "fa-user", action: () => navigate("/profile") },
          { key: "logout", label: "Sign out", icon: "fa-right-from-bracket", action: handleLogout },
        ]
      : [
          { key: "login", label: "Sign in", icon: "fa-right-to-bracket", action: () => navigate("/login") },
          { key: "register", label: "Register", icon: "fa-user-plus", action: () => navigate("/register") },
        ];

    return [...base, ...shop, ...account];
  }, [isAuthenticated, isVendor, navigate, unreadCount]);

  return (
    <>
      {/* Local styles (no external CSS required) */}
      <style>{`
        .dock-outer {
          position: fixed; inset-inline: 0; bottom: .5rem;
          display: flex; justify-content: center; z-index: 1040;
          pointer-events: none;
        }
        .dock-panel {
          pointer-events: auto;
          display: flex; align-items: flex-end; gap: .75rem;
          padding: .35rem .5rem .5rem;
          background: rgba(6,0,16,.9);
          border: 1px solid #252038; border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04);
          backdrop-filter: blur(6px);
        }
        .dock-item {
          position: relative;
          width: 50px; height: 50px; border-radius: 12px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #0a0513; border: 1px solid #2b2444;
          color: #d9d8de; cursor: pointer; user-select: none;
          transition: transform .18s ease, background .18s ease, border-color .18s ease;
        }
        .dock-item:hover, .dock-item:focus-visible {
          background: #110a22; border-color: #3b315e;
        }
        .dock-item i { font-size: 18px; }
        .dock-label {
          position: absolute; top: -28px; left: 50%; transform: translateX(-50%);
          padding: 2px 8px; border-radius: 8px; font-size: 12px;
          color: #fff; background: #0a0513; border: 1px solid #2b2444;
          opacity: 0; translate: 0 6px; transition: opacity .15s ease, translate .15s ease;
          white-space: nowrap; pointer-events: none;
        }
        .dock-item:hover .dock-label, .dock-item:focus-visible .dock-label {
          opacity: 1; translate: 0 0;
        }
        .dock-badge {
          position: absolute; top: -6px; right: -6px;
          min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
          font-size: 11px; line-height: 18px; text-align: center; color: #fff;
          background: #dc3545; border: 1px solid #5a0f17;
        }
        /* subtle hover magnification based on group hover */
        .dock-panel:hover .dock-item { transform: translateY(2px) scale(1); }
        .dock-panel:hover .dock-item:hover { transform: translateY(-4px) scale(1.18); }
        /* Top spacer so content doesn't sit under the dock on mobile */
        .dock-spacer { height: 88px; }
        /* Optional top brand strip for identity (minimal) */
        header.site-brand {
          position: sticky; top: 0; z-index: 1020;
          background: linear-gradient(180deg, rgba(10,5,19,.9), rgba(10,5,19,.6));
          border-bottom: 1px solid #1e1830;
          backdrop-filter: blur(6px);
        }
        .brand-inner { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; }
        .brand-title { color:#fff; font-weight:800; letter-spacing:.3px; }
        .brand-dot { width:8px; height:8px; border-radius:999px; background:#0d6efd; display:inline-block; }
      `}</style>

      {/* Minimal identity bar (keeps app feel) */}
      <header className="site-brand">
        <div className="container-fluid">
          <div className="brand-inner">
            <span className="brand-dot" />
            <Link to="/" className="text-decoration-none"><span className="brand-title">Vendorlution</span></Link>
            <span className="ms-2 small text-secondary">Secure marketplace with escrow</span>
          </div>
        </div>
      </header>

      {/* Spacer for bottom dock */}
      <div className="dock-spacer" />

      {/* Bottom Dock */}
      <div className="dock-outer">
        <div className="dock-panel" role="toolbar" aria-label="App dock">
          {items.map((it) => (
            <button
              key={it.key}
              className="dock-item"
              onClick={it.action}
              aria-label={it.label}
              title={it.label}
            >
              <i className={`fa ${it.icon}`} />
              <span className="dock-label">{it.label}</span>
              {it.badge ? <span className="dock-badge">{it.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}