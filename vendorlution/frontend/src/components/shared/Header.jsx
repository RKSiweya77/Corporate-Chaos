// src/components/shared/Header.jsx
import { useEffect, useMemo, useRef, useState, Children, cloneElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { useCart } from "../../context/CartContext";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";

/* ---------------- React-Bits style Dock ---------------- */
function DockItem({ children, className = "", onClick, mouseX, spring, distance, magnification, baseItemSize }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.button
      type="button"
      ref={ref}
      style={{ width: size, height: size, willChange: "width, height" }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) => cloneElement(child, { isHovered }))}
    </motion.button>
  );
}

function DockLabel({ children, className = "", ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsub = isHovered.on("change", (latest) => setIsVisible(latest === 1));
    return () => unsub();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.18 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "" }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

function Dock({
  items,
  className = "",
  spring = { mass: 0.2, stiffness: 180, damping: 22 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  baseItemSize = 50
}) {
  const mouseX = useMotionValue(Infinity);
  const stableRowHeight = panelHeight + Math.ceil(magnification / 2) + 8;

  return (
    <div style={{ height: stableRowHeight, scrollbarWidth: "none" }} className="dock-outer">
      <div
        onMouseMove={({ pageX }) => mouseX.set(pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>
              <i className={`fa ${item.icon} ${item.iconClass || ""}`} />
              {item.badge ? <span className="dock-badge">{item.badge}</span> : null}
            </DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Header with bottom Dock ---------------- */
export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { items: cartItems } = useCart?.() || { items: [] };
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((n, it) => n + (Number(it.quantity || 1) || 0), 0)
    : 0;

  const isVendor = hasRole("vendor") || !!user?.vendor_id;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const items = useMemo(() => {
    const base = [
      { label: "Home",       icon: "fa-home",             onClick: () => navigate("/") },
      { label: "Products",   icon: "fa-bag-shopping",     onClick: () => navigate("/products") },
      { label: "Vendors",    icon: "fa-store",            onClick: () => navigate("/vendors") },
      { label: "Categories", icon: "fa-tags",             onClick: () => navigate("/categories") },
      { label: "Search",     icon: "fa-magnifying-glass", onClick: () => navigate("/search") },
      { label: "Favourites",   icon: "fa-heart",            onClick: () => navigate("/wishlist") },
      { label: "Chat",       icon: "fa-comments",         onClick: () => navigate("/chat") },
      {
        label: "Cart",
        icon: "fa-cart-shopping",
        onClick: () => navigate("/cart"),
        badge: cartCount > 0 ? (cartCount > 99 ? "99+" : String(cartCount)) : null
      },
      {
        label: "Alerts",
        icon: "fa-bell",
        onClick: () => navigate("/notifications"),
        badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null
      }
    ];

    const shop = isVendor
      ? [{ label: "My Shop", icon: "fa-shop", onClick: () => navigate("/vendor/dashboard") }]
      : [{ label: "Open Shop", icon: "fa-plus", onClick: () => navigate("/vendor/create-shop") }];

    const account = isAuthenticated
      ? [
          { label: "Profile",  icon: "fa-user",               onClick: () => navigate("/profile") },
          { label: "Sign out", icon: "fa-right-from-bracket", onClick: handleLogout }
        ]
      : [
          { label: "Sign in",  icon: "fa-right-to-bracket", onClick: () => navigate("/login") },
          { label: "Register", icon: "fa-address-card",    onClick: () => navigate("/register") }
        ];

    return [...base, ...shop, ...account];
  }, [isAuthenticated, isVendor, navigate, unreadCount, cartCount]);

  return (
    <>
      <style>{`
       
        :root {
          --surface-0: #060010;
          --surface-1: #0b0614;
          --panel-bg: rgba(6, 0, 16, 0.88);
          --border-0: #222;
          --text-0: #ffffff;
          --text-1: #bfb9cf;
          --primary-500: #0d6efd;
          --hover-outline: rgba(0,0,0,0.9);
        }
        /* Light-theme overrides (match ANY ancestor) */
        :where([data-theme="light"], html[data-theme="light"], body[data-theme="light"], html.light, body.light, .light) {
          --surface-0: #ffffff;
          --surface-1: #ffffff;
          --panel-bg: rgba(255,255,255,0.96);   /* brighter translucent white */
          --border-0: #dfe3ef;
          --text-0: #111111;
          --text-1: #666a7a;
          --primary-500: #0b5ed7;
          --hover-outline: rgba(0,0,0,1);
        }

        /* -------- Brand bar -------- */
        header.site-brand {
          position: sticky; top: 0; z-index: 1020;
          background: var(--surface-0);
          border-bottom: 1px solid var(--border-0);
          backdrop-filter: blur(6px);
        }
        .brand-inner { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; }
        .brand-title { color: var(--text-0); font-weight:800; letter-spacing:.3px; }
        .brand-sub { color: var(--text-1); }
        .brand-dot { width:8px; height:8px; border-radius:999px; background: var(--primary-500); display:inline-block; }

        /* -------- Dock (react-bits look) -------- */
        .dock-outer {
          margin: 0 .5rem;
          display: flex;
          max-width: 100%;
          align-items: center;
          position: fixed;
          bottom: .5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1040;
          pointer-events: none;
        }
        .dock-panel {
          pointer-events: auto;
          display: flex;
          align-items: flex-end;
          width: fit-content;
          gap: 1rem;
          border-radius: 1rem;
          background-color: var(--panel-bg);    /* toggles with theme */
          border: 1px solid var(--border-0);    /* toggles with theme */
          padding: 0 .5rem .5rem;
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255,255,255,.03);
          backdrop-filter: blur(12px);
        }
        /* FORCE the panel to white in light mode (wins over anything else) */
        :where([data-theme="light"], html[data-theme="light"], body[data-theme="light"], html.light, body.light, .light) .dock-panel {
          background-color: rgba(255,255,255,0.96) !important;
          border-color: #dfe3ef !important;
        }

        .dock-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background-color: var(--surface-0);
          border: 1px solid var(--border-0);
          color: var(--text-0);
          cursor: pointer;
          outline: 2px solid transparent;
          outline-offset: 0;
          transition: background-color .15s ease, border-color .15s ease, outline-color .12s ease;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .dock-item:hover,
        .dock-item:focus-visible {
          outline-color: var(--hover-outline);
        }

        .dock-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          height: 100%;
          color: var(--text-0);
        }
        .dock-icon i { font-size: 18px; }

        .dock-label {
          position: absolute;
          top: -1.5rem;
          left: 50%;
          width: fit-content;
          white-space: pre;
          border-radius: 0.375rem;
          border: 1px solid var(--border-0);
          background-color: var(--surface-0);
          padding: 0.125rem 0.5rem;
          font-size: 0.75rem;
          color: var(--text-0);
          transform: translateX(-50%);
        }

        .dock-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          font-size: 11px;
          line-height: 18px;
          text-align: center;
          color: #fff;
          background: var(--primary-500);
          border: 1px solid rgba(0,0,0,.18);
        }

        /* Spacer so content doesn't collide with dock */
        .dock-spacer { height: 96px; }
      `}</style>

      {/* Brand bar */}
      <header className="site-brand">
        <div className="container-fluid">
          <div className="brand-inner">
            <span className="brand-dot" />
            <Link to="/" className="text-decoration-none">
              <span className="brand-title">Vendorlution</span>
            </Link>
            <span className="ms-2 small brand-sub">Secure marketplace with escrow</span>
          </div>
        </div>
      </header>

      {/* Keep page content clear of the dock */}
      <div className="dock-spacer" />

      {/* Bottom Dock */}
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </>
  );
}