// src/services/api.js
import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // your Django API root
  headers: {
    "Content-Type": "application/json",
  },
});

// Example: fetch all products
export const fetchProducts = () => api.get("products/");

// Example: fetch product detail
export const fetchProductDetail = (id) => api.get(`products/${id}/`);

// Example: fetch vendors
export const fetchVendors = () => api.get("vendors/");

// Example: fetch categories
export const fetchCategories = () => api.get("categories/");

// Example: fetch customer orders
export const fetchOrders = () => api.get("orders/");

export default api;
