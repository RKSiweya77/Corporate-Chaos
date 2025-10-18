// src/api/endpoints.js
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://127.0.0.1:8000/api";

export const API_ENDPOINTS = {
  // AUTH
  auth: {
    token: "/auth/token/",
    refresh: "/auth/token/refresh/",
    verify: "/auth/token/verify/",
    register: "/auth/register/",
    me: "/auth/me/",
    createVendor: "/auth/create-vendor/",
  },

  // CATEGORIES
  categories: { list: "/categories/", all: "/categories/all/" },

  // PRODUCTS
  products: {
    list: "/products/",
    detail: (id) => `/products/${id}/`,
    new: "/products/new/",
    popular: "/products/popular/",
  },

  // VENDORS
  vendors: {
    list: "/vendors/",
    featured: "/vendors/featured/",
    all: "/vendors/all/",
    detail: (id) => `/vendors/${id}/`,
    bySlug: (slug) => `/vendors/slug/${slug}/`,
    getProfile: "/me/vendor/profile/", // optional profile
  },

  // RATINGS
  ratings: { list: "/ratings/" },

  // WISHLIST
  wishlist: {
    list: "/me/wishlist/",
    remove: (id) => `/me/wishlist/${id}/`,
  },

  // CART
  cart: {
    detail: "/me/cart/",
    addItem: "/me/cart/items/",
    updateItem: (id) => `/me/cart/items/${id}/`,
  },

  // ORDERS
  orders: {
    my: "/me/orders/",
    vendorOrders: "/me/vendor/orders/",
    confirmDelivery: (orderId) => `/orders/${orderId}/confirm-delivery/`,
  },

  // CHECKOUT
  checkout: "/checkout/",

  // WALLET
  wallet: {
    me: "/wallet/",
    transactions: "/wallet/transactions/",
    vendorProfile: "/wallet/me/vendor/profile/",
    ozowStart: "/wallet/ozow/deposit/start/",
    ozowWebhook: "/wallet/webhooks/ozow/",
    withdraw: "/wallet/withdraw/",
    payoutRequest: "/wallet/payouts/request/",
  },

  payouts: { my: "/me/payouts/" },
  discounts: { my: "/me/discounts/" },
  paymentMethods: { my: "/me/payment-methods/" },

  // MESSAGES
  messages: {
    conversations: "/me/conversations/",
    send: "/me/messages/",
    conversationMessages: (id) => `/me/conversations/${id}/messages/`,
  },

  // ADDRESSES
  addresses: {
    list: "/me/addresses/",
    detail: (id) => `/me/addresses/${id}/`,
  },

  // NOTIFICATIONS
  notifications: {
    list: "/me/notifications/",
    markRead: (id) => `/me/notifications/${id}/read/`,
  },

  support: { my: "/me/support/" },
  resolutions: { my: "/me/resolutions/" },

  // SHIPMENTS
  shipments: {
    create: (orderId) => `/orders/${orderId}/shipment/`,
    detail: (shipmentId) => `/shipments/${shipmentId}/`,
  },

  // DISPUTES
  disputes: {
    create: (orderId) => `/orders/${orderId}/dispute/`,
    list: "/disputes/",
    detail: (disputeId) => `/disputes/${disputeId}/`,
  },

  // VENDOR PRODUCT MGMT
  vendorProducts: {
    list: "/vendor/products/",
    create: "/vendor/products/create/",
    update: (id) => `/vendor/products/${id}/`,
    delete: (id) => `/vendor/products/${id}/delete/`,
  },
};

export const API_BASE_URL = API_BASE;

export const buildUrl = (endpoint) => {
  if (!endpoint) return API_BASE;
  if (endpoint.startsWith("http")) return endpoint;
  return `${API_BASE}${endpoint}`;
};

export default API_ENDPOINTS;
