// src/utils/formatters.js

// Base root for media file URLs (Django serves /media/)
const API_ROOT =
  import.meta.env.VITE_API_ROOT ||
  process.env.REACT_APP_API_ROOT ||
  "http://127.0.0.1:8000";

// ---- media helpers
export function toMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_ROOT}${clean}`;
}

// ---- currency helpers
export function ZAR(amount) {
  const n = Number(amount ?? 0) || 0;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(n);
}
export const formatCurrency = ZAR;

// ---- number formatting (ADDED THIS FUNCTION)
export function formatNumber(number, options = {}) {
  const num = typeof number === 'number' ? number : parseFloat(number || 0);
  
  if (isNaN(num)) {
    return formatNumber(0, options);
  }

  const defaults = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat("en-ZA", { ...defaults, ...options }).format(num);
}

// ---- date/time formatting
export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-ZA");
}

export function relativeTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDate(iso);
}

// ---- misc UI helpers
export function truncate(text, len = 80) {
  if (!text) return "";
  return text.length > len ? `${text.slice(0, len)}…` : text;
}

export function typeIcon(type) {
  switch ((type || "").toLowerCase()) {
    case "order":
      return "fa-shopping-bag";
    case "message":
      return "fa-envelope";
    case "payment":
      return "fa-credit-card";
    case "review":
      return "fa-star";
    default:
      return "fa-bell";
  }
}