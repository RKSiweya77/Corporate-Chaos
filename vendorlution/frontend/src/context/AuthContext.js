import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAccessToken, setRefreshToken, getAccessToken } from "../api/axios";

const LS_KEY = "vendorlution_auth";
const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || { isAuthenticated: false, roles: ["buyer"] }; }
    catch { return { isAuthenticated: false, roles: ["buyer"] }; }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  // hydrate if a token is already present
  useEffect(() => {
    if (!getAccessToken()) return;
    api.get("/auth/me/").then((r) => {
      setState({
        isAuthenticated: true,
        roles: r.data?.roles || ["buyer"],
        user: r.data?.user || null,
        customerId: r.data?.customer_id || null,
        vendorId: r.data?.vendor_id || null,
      });
    }).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: !!state.isAuthenticated,
    roles: state.roles || ["buyer"],
    user: state.user || null,
    vendorId: state.vendorId || null,

    async login(identifier, password) {
      // IMPORTANT: backend expects {username, password}. 'identifier' can be email or username
      const res = await api.post("/auth/token/", { username: identifier, password });
      setAccessToken(res.data?.access);
      setRefreshToken(res.data?.refresh);

      const me = await api.get("/auth/me/");
      setState({
        isAuthenticated: true,
        roles: me.data?.roles || ["buyer"],
        user: me.data?.user || null,
        customerId: me.data?.customer_id || null,
        vendorId: me.data?.vendor_id || null,
      });
    },

    async logout() {
      setAccessToken(null);
      setRefreshToken(null);
      setState({ isAuthenticated: false, roles: ["buyer"] });
    },

    hasRole(role) {
      return (state.roles || []).includes(role);
    },

    // used by CreateShop page
    async createVendor(form) {
      const fd = new FormData();
      ["shop_name", "description", "address"].forEach(k => form[k] && fd.append(k, form[k]));
      if (form.logo) fd.append("logo", form.logo);
      if (form.banner) fd.append("banner", form.banner);
      const r = await api.post("/auth/create-vendor/", fd);
      const v = r.data?.vendor;
      setState(s => ({ ...s, roles: Array.from(new Set([...(s.roles||[]), "vendor"])), vendorId: v?.id || s.vendorId }));
      return v;
    }
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}