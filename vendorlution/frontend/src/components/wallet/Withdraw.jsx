import React, { useState } from "react";
import api from "../../api/axios";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    const value = parseFloat(amount || "0");
    if (isNaN(value) || value <= 0) {
      setErr("Enter a valid amount greater than zero.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/wallet/payouts/request/", {
        amount: value,
        bank_account: {
          holder: bankHolder,
          bank_name: bankName,
          account_number: accountNumber,
          branch_code: branchCode,
        },
      });
      setOk("Withdrawal request submitted. You’ll be notified when it’s processed.");
      setAmount("");
      setBankHolder("");
      setBankName("");
      setAccountNumber("");
      setBranchCode("");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to submit withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Withdraw to Bank</h5>
      <form onSubmit={submit} className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Amount (ZAR)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500.00"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Account Holder</label>
          <input className="form-control" value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Bank Name</label>
          <input className="form-control" value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Account Number</label>
          <input className="form-control" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Branch Code</label>
          <input className="form-control" value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
        </div>

        <div className="col-12">
          <button className="btn btn-dark" disabled={loading}>
            {loading ? "Submitting…" : "Request Withdrawal"}
          </button>
        </div>
      </form>

      {err && <div className="alert alert-danger mt-3">{err}</div>}
      {ok && <div className="alert alert-success mt-3">{ok}</div>}

      <p className="text-muted small mt-3">
        Minimum withdrawal may apply. Transfers are processed to your bank and can take 1–2 business days after approval.
      </p>
    </div>
  );
}
