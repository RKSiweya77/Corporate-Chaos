// src/components/wallet/Deposit.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function Deposit() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState("100.00");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("Deposits are processed via Ozow (Instant EFT). You will be redirected to the Ozow hosted payment page.");
  }, []);

  async function startDeposit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    
    try {
      const amount = String(prefill || "").trim();
      if (!amount || Number(amount) < 10) {
        setErr("Minimum deposit amount is R 10.00");
        setLoading(false);
        return;
      }

      const res = await api.post(API_ENDPOINTS.wallet.ozowStart, { amount });
      const { redirect_url } = res.data || {};
      
      if (redirect_url) {
        window.location.href = redirect_url;
        return;
      }
      setErr("Payment gateway unavailable. Please try again.");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to start deposit.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Please sign in to deposit funds.</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header fw-500">Deposit via Ozow (Instant EFT)</div>
            <div className="card-body">
              {note && <div className="alert alert-info">{note}</div>}
              {err && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>{err}</span>
                  <button className="btn-close" onClick={() => setErr("")} />
                </div>
              )}

              <form onSubmit={startDeposit}>
                <div className="mb-3">
                  <label className="form-label">Amount (ZAR)</label>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    className="form-control form-control-lg"
                    value={prefill}
                    onChange={(e) => setPrefill(e.target.value)}
                    placeholder="e.g. 100.00"
                    required
                  />
                  <div className="form-text">Minimum deposit R 10.00</div>
                </div>

                <button className="btn btn-dark w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Starting deposit…
                    </>
                  ) : (
                    <>
                      <i className="fa fa-bolt me-2" />
                      Continue to Ozow
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-3">
            <a href="https://hub.ozow.com/docs/" target="_blank" rel="noreferrer">
              Learn about Ozow
            </a>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
    </div>
  );
}