// src/components/wallet/DepositOzow.jsx
import { useState } from "react";
import api from "../../api/axios";

export default function DepositOzow() {
  const [amount, setAmount] = useState("50.00");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const start = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await api.post("/wallet/ozow/deposit/start/", { amount });
      const url = res.data?.redirect_url;
      if (!url) throw new Error("No redirect URL from gateway");
      window.location.href = url; // go to Ozow hosted payment page
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || "Failed to start deposit");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Deposit via Instant EFT (Ozow)</h3>
      <form className="card p-3 shadow-sm" onSubmit={start}>
        <div className="mb-3">
          <label className="form-label">Amount (ZAR)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {err && <div className="alert alert-danger">{err}</div>}
        <button disabled={busy} className="btn btn-dark">
          {busy ? "Starting…" : "Proceed to Ozow"}
        </button>
      </form>
      <p className="text-muted small mt-3">
        You’ll be redirected to Ozow to complete payment securely. When complete, Ozow returns you here and
        our server credits your wallet on the payment notification.
      </p>
    </div>
  );
}
