// src/utils/constants.js
// Application-wide constants aligned with backend

// Order statuses consistent with backend
export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  RESOLVED: "resolved",
});

export const ORDER_STATUS_LABEL = Object.freeze({
  [ORDER_STATUS.PENDING]: "Pending Payment",
  [ORDER_STATUS.CONFIRMED]: "Order Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
  [ORDER_STATUS.DISPUTED]: "In Dispute",
  [ORDER_STATUS.RESOLVED]: "Resolved",
});

export const ORDER_STATUS_BADGE = Object.freeze({
  [ORDER_STATUS.PENDING]: "warning",
  [ORDER_STATUS.CONFIRMED]: "info",
  [ORDER_STATUS.PROCESSING]: "primary",
  [ORDER_STATUS.SHIPPED]: "primary",
  [ORDER_STATUS.DELIVERED]: "success",
  [ORDER_STATUS.CANCELLED]: "danger",
  [ORDER_STATUS.REFUNDED]: "secondary",
  [ORDER_STATUS.DISPUTED]: "dark",
  [ORDER_STATUS.RESOLVED]: "outline-success",
});

// Escrow lifecycle
export const ESCROW_STATUS = Object.freeze({
  PENDING: "pending",   // Payment initiated
  HELD: "held",         // Funds in escrow
  RELEASED: "released", // Funds released to vendor
  REFUNDED: "refunded", // Funds refunded to buyer
  DISPUTED: "disputed", // Dispute initiated
});

export const ESCROW_STATUS_LABEL = Object.freeze({
  [ESCROW_STATUS.PENDING]: "Pending",
  [ESCROW_STATUS.HELD]: "In Escrow",
  [ESCROW_STATUS.RELEASED]: "Released",
  [ESCROW_STATUS.REFUNDED]: "Refunded",
  [ESCROW_STATUS.DISPUTED]: "In Dispute",
});

// Notification types
export const NOTIFICATION_TYPE = Object.freeze({
  ORDER: "order",
  MESSAGE: "message",
  PAYMENT: "payment",
  SYSTEM: "system",
  REVIEW: "review",
  DISPUTE: "dispute",
  ESCROW: "escrow",
});

export const NOTIFICATION_ICON = Object.freeze({
  [NOTIFICATION_TYPE.ORDER]: "fa-shopping-bag",
  [NOTIFICATION_TYPE.MESSAGE]: "fa-comment",
  [NOTIFICATION_TYPE.PAYMENT]: "fa-credit-card",
  [NOTIFICATION_TYPE.SYSTEM]: "fa-bell",
  [NOTIFICATION_TYPE.REVIEW]: "fa-star",
  [NOTIFICATION_TYPE.DISPUTE]: "fa-gavel",
  [NOTIFICATION_TYPE.ESCROW]: "fa-shield-alt",
});

// Payment methods
export const PAYMENT_METHOD = Object.freeze({
  OZOW: "ozow",
  WALLET: "wallet",
  BANK_TRANSFER: "bank_transfer",
});

export const PAYMENT_METHOD_LABEL = Object.freeze({
  [PAYMENT_METHOD.OZOW]: "Ozow Instant EFT",
  [PAYMENT_METHOD.WALLET]: "Wallet Balance",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Bank Transfer",
});

// User roles
export const USER_ROLE = Object.freeze({
  BUYER: "buyer",
  VENDOR: "vendor",
  ADMIN: "admin",
  MODERATOR: "moderator",
});

// Dispute statuses
export const DISPUTE_STATUS = Object.freeze({
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  CLOSED: "closed",
});

export const DISPUTE_STATUS_LABEL = Object.freeze({
  [DISPUTE_STATUS.OPEN]: "Open",
  [DISPUTE_STATUS.UNDER_REVIEW]: "Under Review",
  [DISPUTE_STATUS.RESOLVED]: "Resolved",
  [DISPUTE_STATUS.CLOSED]: "Closed",
});

// Chat and messaging
export const MESSAGE_TYPE = Object.freeze({
  TEXT: "text",
  IMAGE: "image",
  SYSTEM: "system",
  ORDER_UPDATE: "order_update",
});

export const CONVERSATION_TYPE = Object.freeze({
  ORDER: "order",
  SUPPORT: "support",
  DIRECT: "direct",
});

// Application settings
export const CURRENCY_CODE = "ZAR";
export const CURRENCY_SYMBOL = "R";

// Platform limits (with environment variable fallbacks)
export const MIN_WITHDRAWAL = Number(import.meta.env.VITE_MIN_WITHDRAWAL || 50);
export const MAX_WITHDRAWAL = Number(import.meta.env.VITE_MAX_WITHDRAWAL || 50000);
export const PLATFORM_FEE_PERCENT = Number(import.meta.env.VITE_PLATFORM_FEE || 5);
export const ESCROW_HOLD_DAYS = Number(import.meta.env.VITE_ESCROW_HOLD_DAYS || 3);
export const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE || 5) * 1024 * 1024; // 5MB default

// Pagination
export const ITEMS_PER_PAGE = Object.freeze({
  PRODUCTS: 24,
  VENDORS: 24,
  ORDERS: 12,
  TRANSACTIONS: 20,
  NOTIFICATIONS: 15,
  CONVERSATIONS: 10,
});

// Local storage keys
export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  CART_ITEMS: "cartItems",
  RECENT_SEARCHES: "recentSearches",
  PREFERENCES: "userPreferences",
});

// Feature flags
export const FEATURE_FLAGS = Object.freeze({
  ENABLE_ESCROW: import.meta.env.VITE_ENABLE_ESCROW !== "false",
  ENABLE_CHAT: import.meta.env.VITE_ENABLE_CHAT !== "false",
  ENABLE_OZOW: import.meta.env.VITE_ENABLE_OZOW !== "false",
  ENABLE_VENDOR_REGISTRATION: import.meta.env.VITE_ENABLE_VENDOR_REGISTRATION === "true",
});