import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // mock logged-in
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("vl_roles");
    return saved ? JSON.parse(saved) : ["buyer"];
  });
  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem("vl_activeRole");
    return saved || "buyer";
  });

  useEffect(() => {
    localStorage.setItem("vl_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("vl_activeRole", activeRole);
  }, [activeRole]);

  const hasRole = (role) => roles.includes(role);

  const addVendorRole = () => {
    if (!roles.includes("vendor")) {
      const next = [...roles, "vendor"];
      setRoles(next);
      setActiveRole("vendor");
    }
  };

  const switchRole = (role) => {
    if (roles.includes(role)) setActiveRole(role);
  };

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setRoles(["buyer"]);
    setActiveRole("buyer");
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      roles,
      activeRole,
      hasRole,
      addVendorRole,
      switchRole,
      login,
      logout,
    }),
    [isAuthenticated, roles, activeRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
