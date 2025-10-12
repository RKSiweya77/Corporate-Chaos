// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// ---- in-memory token storage ----
let ACCESS = null;
let REFRESH = null;

export const setAccessToken = (t) => { ACCESS = t || null; };
export const getAccessToken = () => ACCESS;

export const setRefreshToken = (t) => { REFRESH = t || null; };
export const getRefreshToken = () => REFRESH;

// Attach Authorization header when we have an access token
api.interceptors.request.use((config) => {
  if (ACCESS) {
    config.headers.Authorization = `Bearer ${ACCESS}`;
  }
  return config;
});

// Helper: POST multipart without forcing a content-type.
// The browser will set the proper boundary for FormData.
export const postMultipart = (url, formData) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": undefined,
    },
  });
};

export default api;