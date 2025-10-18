// src/context/EscrowContext.jsx
import { createContext, useCallback, useContext, useState } from "react";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";

export const EscrowContext = createContext(null);

export function EscrowProvider({ children }) {
  const [escrowData, setEscrowData] = useState({});
  const [loading, setLoading] = useState(false);

  const getEscrowStatus = useCallback(async (orderId) => {
    setLoading(true);
    try {
      const r = await api.get(`/orders/${orderId}/`); // backend returns escrow info on order
      const escrow = r.data?.escrow || r.data;
      setEscrowData((p) => ({ ...p, [orderId]: escrow }));
      return escrow;
    } finally {
      setLoading(false);
    }
  }, []);

  const releaseEscrow = useCallback(async (orderId) => {
    setLoading(true);
    try {
      const r = await api.post(API_ENDPOINTS.orders.confirmDelivery(orderId));
      setEscrowData((p) => ({
        ...p,
        [orderId]: { ...(p[orderId] || {}), status: "released", released_at: new Date().toISOString() },
      }));
      return r.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDispute = useCallback(async (orderId, payload) => {
    setLoading(true);
    try {
      const r = await api.post(API_ENDPOINTS.disputes.create(orderId), payload);
      setEscrowData((p) => ({
        ...p,
        [orderId]: { ...(p[orderId] || {}), status: "disputed", dispute: r.data },
      }));
      return r.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    escrowData,
    loading,
    getEscrowStatus,
    releaseEscrow,
    createDispute,
    hasActiveEscrow: (orderId) => {
      const e = escrowData[orderId];
      return e && ["pending", "held"].includes(e.status);
    },
    isDisputed: (orderId) => escrowData[orderId]?.status === "disputed",
  };

  return <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>;
}

export function useEscrow() {
  const ctx = useContext(EscrowContext);
  if (!ctx) throw new Error("useEscrow must be used within EscrowProvider");
  return ctx;
}
