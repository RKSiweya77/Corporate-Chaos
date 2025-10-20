import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function Deposit() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("100.00");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("Secure Instant EFT via Ozow. You will be redirected to the Ozow payment page.");
  }, []);

  const isDark = useMemo(() => window.matchMedia?.("(prefers-color-scheme: dark)")?.matches, []);
  const styles = (
    <style>{`
      .dock-surface { color: var(--text-0); }
      :root {
        color-scheme: ${isDark ? "dark" : "light"};
      }
      .panel {
        border: 1px solid var(--border-0);
        border-radius: 14px;
        background: var(--surface-1);
        box-shadow: 0 10px 30px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04);
      }
      .panel-header {
        padding: .85rem 1rem;
        border-bottom: 1px solid var(--border-0);
        font-weight: 700;
      }
      .panel-body { padding: 1rem; }
      .btn-ghost { border:1px solid var(--border-0); background:var(--surface-1); color:var(--text-0); }
      .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }
    `}</style>
  );

  async function startDeposit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const amt = String(amount || "").trim();
      if (!amt || Number(amt) < 10) {
        setErr("Minimum deposit amount is R 10.00");
        setLoading(false);
        return;
      }
      const res = await api.post(API_ENDPOINTS.wallet.ozowStart, { amount: amt });
      const { redirect_url } = res.data || {};
      if (redirect_url) {
        window.location.assign(redirect_url);
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
      <div className="container py-5 dock-surface">
        {styles}
        <div className="panel">
          <div className="panel-header">Deposit via Ozow</div>
          <div className="panel-body">
            <div className="alert alert-info mb-0">Please sign in to deposit funds.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 dock-surface">
      {styles}
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="panel">
            <div className="panel-header">Deposit via Ozow (Instant EFT)</div>
            <div className="panel-body">
              {note ? <div className="alert alert-info">{note}</div> : null}
              {err ? (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>{err}</span>
                  <button type="button" className="btn-close" onClick={() => setErr("")} />
                </div>
              ) : null}
              <form onSubmit={startDeposit}>
                <div className="mb-3">
                  <label className="form-label">Amount (ZAR)</label>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    className="form-control form-control-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
              <div className="text-center mt-3">
                <a href="https://hub.ozow.com/docs/" target="_blank" rel="noreferrer" className="text-decoration-none">
                  Learn more about Ozow
                </a>
              </div>
            </div>
          </div>
          {loading && <LoadingSpinner />}
        </div>
      </div>
      <div style={{ height: 96 }} />
    </div>
  );
}