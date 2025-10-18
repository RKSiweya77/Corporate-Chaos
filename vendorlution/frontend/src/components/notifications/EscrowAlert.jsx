// src/components/notifications/EscrowAlert.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { ZAR } from "../../utils/formatters";

export default function EscrowAlert() {
  const { isAuthenticated } = useAuth();
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setPending(0);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadEscrowData() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(API_ENDPOINTS.wallet.me);
        const pendingAmount = parseFloat(res.data?.pending || "0");
        if (isMounted) {
          setPending(isNaN(pendingAmount) ? 0 : pendingAmount);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load escrow data");
          setPending(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEscrowData();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadEscrowData, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Don't show if loading, no pending amount, or error
  if (loading || pending <= 0 || error) return null;

  return (
    <div className="alert alert-warning d-flex align-items-center border-0 shadow-sm" role="alert">
      <div className="flex-shrink-0 me-3">
        <i className="fa fa-shield-alt fa-lg" />
      </div>
      <div className="flex-grow-1">
        <div className="fw-bold mb-1">Order Protection Active</div>
        <div className="small">
          {ZAR(pending)} is currently held in escrow for active orders. 
          Funds will be released to the vendor upon delivery confirmation 
          or automatically after the protection period ends.
        </div>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={() => setPending(0)}
        aria-label="Dismiss alert"
      />
    </div>
  );
}