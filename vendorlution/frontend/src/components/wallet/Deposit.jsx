// src/components/wallet/DepositOzow.jsx
import React, { useState } from "react";
import { createOzowDeposit } from "./api";

export default function DepositOzow() {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const a = Number(amount);
    if (!a || a <= 0) {
      setErr("Enter a valid amount.");
      return;
    }
    try {
      setSubmitting(true);
      const { redirect_url } = await createOzowDeposit(a);
      // Redirect to Ozow hosted page (sandbox)
      window.location.href = redirect_url;
    } catch (e) {
      setErr("Could not start deposit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Amount (ZAR)</label>
        <input
          type="number"
          min="10"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="form-control"
          placeholder="e.g. 100"
        />
        <div className="form-text">
          You’ll be redirected to Ozow (Instant EFT sandbox).
        </div>
      </div>

      <div className="col-12">
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <button className="btn btn-success" disabled={submitting}>
          {submitting ? "Starting…" : "Deposit with Ozow"}
        </button>
      </div>
    </form>
  );
}
