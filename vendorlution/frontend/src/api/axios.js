// src/api/axios.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// ---- token helpers expected by AuthContext ----
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) || "";
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || "";
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
}

// ---- axios instance ----
const api = axios.create({
  baseURL: API_BASE,
});

// attach Authorization header if JWT exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- helper used by AddProduct / CreateShop ----
export async function postMultipart(url, formDataObj) {
  const fd = formDataObj instanceof FormData ? formDataObj : new FormData();
  if (!(formDataObj instanceof FormData)) {
    Object.entries(formDataObj || {}).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
      else fd.append(k, v);
    });
  }

  const res = await api.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
}

export default api;
