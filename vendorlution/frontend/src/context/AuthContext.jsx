// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  postMultipart,
} from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    ready: false,
    roles: ["buyer"],
    user: null,
    vendorId: null,
  });

  // Hydrate auth state on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState(prev => ({ ...prev, ready: true }));
      return;
    }

    (async () => {
      try {
        const r = await api.get(API_ENDPOINTS.auth.me);
        setState({
          isAuthenticated: true,
          ready: true,
          roles: r.data?.roles || ["buyer"],
          user: r.data?.user || null,
          vendorId: r.data?.vendor_id || null,
        });
      } catch (err) {
        console.error("Auth hydration failed:", err);
        clearTokens();
        setState({
          isAuthenticated: false,
          ready: true,
          roles: ["buyer"],
          user: null,
          vendorId: null,
        });
      }
    })();
  }, []);

  const value = useMemo(() => {
    return {
      isAuthenticated: !!state.isAuthenticated,
      ready: !!state.ready,
      roles: state.roles || ["buyer"],
      user: state.user || null,
      vendorId: state.vendorId || null,

      // Fixed hasRole with null checks
      hasRole: (role) => {
        if (!role) return true; // No role requirement
        const userRoles = state.roles || [];
        return Array.isArray(userRoles) && userRoles.includes(role);
      },

      // Login function
      async login({ identifier, password }) {
        try {
          const res = await api.post(API_ENDPOINTS.auth.token, {
            username: identifier,
            password,
          });

          if (!res.data?.access) {
            throw new Error("No access token received");
          }

          setAccessToken(res.data.access);
          setRefreshToken(res.data.refresh);

          const me = await api.get(API_ENDPOINTS.auth.me);
          setState({
            isAuthenticated: true,
            ready: true,
            roles: me.data?.roles || ["buyer"],
            user: me.data?.user || null,
            vendorId: me.data?.vendor_id || null,
          });

          return { success: true };
        } catch (err) {
          console.error("Login error:", err);
          const errorMsg = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          "Invalid credentials";
          return { success: false, error: errorMsg };
        }
      },

      // Register function
      async register({ username, email, password, first_name, last_name }) {
        try {
          const res = await api.post(API_ENDPOINTS.auth.register, {
            username,
            email,
            password,
            first_name: first_name || "",
            last_name: last_name || "",
          });

          if (!res.data) {
            throw new Error("Registration failed");
          }

          return { success: true, data: res.data };
        } catch (err) {
          console.error("Register error:", err);
          let errorMsg = "Registration failed";
          
          if (err.response?.data) {
            const data = err.response.data;
            if (typeof data === 'object') {
              const firstKey = Object.keys(data)[0];
              if (firstKey && Array.isArray(data[firstKey])) {
                errorMsg = data[firstKey][0];
              } else if (firstKey) {
                errorMsg = data[firstKey];
              }
            } else if (typeof data === 'string') {
              errorMsg = data;
            }
          }
          
          return { success: false, error: errorMsg };
        }
      },

      // Logout
      async logout() {
        clearTokens();
        setState({
          isAuthenticated: false,
          ready: true,
          roles: ["buyer"],
          user: null,
          vendorId: null,
        });
      },

      // Create vendor/shop
      async createVendor(formDataOrObj) {
        try {
          // Handle both FormData and plain objects
          const fd = formDataOrObj instanceof FormData 
            ? formDataOrObj 
            : new FormData();

          // If plain object, append fields
          if (!(formDataOrObj instanceof FormData)) {
            Object.entries(formDataOrObj || {}).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                // Handle File objects properly
                if (value instanceof File) {
                  fd.append(key, value);
                } else {
                  fd.append(key, String(value));
                }
              }
            });
          }

          const r = await postMultipart(API_ENDPOINTS.auth.createVendor, fd);
          const vendor = r.data?.vendor || r.data;

          // Refresh user data to get updated roles and vendor_id
          const me = await api.get(API_ENDPOINTS.auth.me);
          setState({
            isAuthenticated: true,
            ready: true,
            roles: me.data?.roles || ["buyer", "vendor"],
            user: me.data?.user || state.user,
            vendorId: me.data?.vendor_id || vendor?.id || null,
          });

          return { success: true, data: vendor };
        } catch (err) {
          console.error("Create vendor error:", err);
          let errorMsg = "Failed to create shop";
          
          if (err.response?.data) {
            const data = err.response.data;
            if (data.detail) {
              errorMsg = data.detail;
            } else if (data.shop_name && Array.isArray(data.shop_name)) {
              errorMsg = data.shop_name[0];
            } else if (typeof data === 'string') {
              errorMsg = data;
            }
          }
          
          return { success: false, error: errorMsg };
        }
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}