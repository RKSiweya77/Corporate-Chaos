// src/api/axios.js
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "./endpoints";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  API_BASE_URL ||
  "http://127.0.0.1:8000/api";

// ---- token helpers (localStorage) ----
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
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ---- axios instance ----
const api = axios.create({ baseURL: API_BASE });

// attach Authorization header if JWT exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auto-refresh on 401 (if refresh token exists)
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (status === 401 && !original?._retry) {
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api.request(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const r = await axios.post(`${API_BASE}${API_ENDPOINTS.auth.refresh}`, {
          refresh,
        });
        const newAccess = r.data?.access;
        setAccessToken(newAccess);
        resolveQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api.request(original);
      } catch (e) {
        resolveQueue(e, null);
        clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---- helper for multipart POST ----
export async function postMultipart(url, formDataObj) {
  const fd = formDataObj instanceof FormData ? formDataObj : new FormData();
  if (!(formDataObj instanceof FormData)) {
    Object.entries(formDataObj || {}).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
      else if (v !== undefined && v !== null) fd.append(k, v);
    });
  }
  return api.post(url, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export default api;
