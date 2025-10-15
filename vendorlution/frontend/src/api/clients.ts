import axios, { AxiosError } from "axios";
import { tokenStore } from "./tokenStore";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api",
  withCredentials: false, // set true only if you actually use httpOnly cookies
});

// Attach Authorization on each request
api.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access) {
    config.headers = config.headers || {};
    // SimpleJWT default is "Bearer"
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Avoid infinite loops
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

// Refresh on 401 once
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    const status = error.response?.status;

    // If no response or not 401, bail
    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // mark so we don't loop
    original._retry = true;

    // If multiple 401s happen together, queue them
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            if (token) {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refresh = tokenStore.getRefresh();
      if (!refresh) throw new Error("No refresh token");

      const resp = await axios.post(
        `${process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api"}/auth/token/refresh/`,
        { refresh }
      );

      const newAccess = (resp.data && (resp.data.access || resp.data.access_token)) as string;
      if (!newAccess) throw new Error("No access token in refresh response");

      tokenStore.updateAccess(newAccess);
      processQueue(null, newAccess);

      // retry original with new token
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      processQueue(e as any, null);
      tokenStore.clear();
      // Optional: redirect to login or emit an event
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
