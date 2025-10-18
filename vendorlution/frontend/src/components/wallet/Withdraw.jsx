// src/components/wallet/Withdraw.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { ZAR } from "../../utils/formatters";

export default function Withdraw() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [wallet, setWallet] = useState({ balance: 0 });
  const [form, setForm] = useState({
    amount: "",
    holder: "",
    bank_name: "",
    account_number: "",
    branch_code: "",
  });

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        setLoading(true);
        const w = await api.get(API_ENDPOINTS.wallet.me);
        setWallet({ balance: Number(w.data?.balance || 0) });
      } catch (error) {
        setErr(error?.response?.data?.detail || "Failed to load wallet.");
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    
    const amount = Number(form.amount);
    if (!amount || amount < 10) {
      setErr("Minimum withdrawal amount is R 10.00");
      return;
    }
    if (amount > Number(wallet.balance)) {
      setErr("Insufficient balance.");
      return;
    }

    const payload = {
      amount: String(form.amount),
      bank_account: {
        holder: form.holder.trim(),
        bank_name: form.bank_name.trim(),
        account_number: form.account_number.trim(),
        branch_code: form.branch_code.trim(),
      },
    };

    try {
      setSubmitting(true);
      const res = await api.post(API_ENDPOINTS.wallet.withdraw, payload);
      setOk(`Withdrawal requested. Reference: ${res.data?.id || res.data?.reference || "N/A"}`);
      setForm({
        amount: "",
        holder: "",
        bank_name: "",
        account_number: "",
        branch_code: "",
      });
      
      // Refresh wallet balance
      const w = await api.get(API_ENDPOINTS.wallet.me);
      setWallet({ balance: Number(w.data?.balance || 0) });
    } catch (e2) {
      const msg = e2?.response?.data?.detail || e2?.response?.data?.error || "Failed to request withdrawal.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Please sign in to withdraw funds.</div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-5">
      {err && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{err}</span>
          <button className="btn-close" onClick={() => setErr("")} />
        </div>
      )}
      {ok && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>{ok}</span>
          <button className="btn-close" onClick={() => setOk("")} />
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-500 bg-white">Withdraw Funds</div>
            <div className="card-body">
              <div className="mb-4 p-3 bg-light rounded">
                <div className="text-muted">Available Balance</div>
                <div className="fs-4 fw-bold text-success">{ZAR(wallet.balance)}</div>
              </div>

              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label">Amount (ZAR)</label>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    className="form-control form-control-lg"
                    name="amount"
                    value={form.amount}
                    onChange={onChange}
                    placeholder="e.g. 250.00"
                    required
                  />
                  <div className="form-text">Minimum withdrawal R 10.00</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Account Holder</label>
                    <input
                      className="form-control"
                      name="holder"
                      value={form.holder}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Name</label>
                    <input
                      className="form-control"
                      name="bank_name"
                      value={form.bank_name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Account Number</label>
                    <input
                      className="form-control"
                      name="account_number"
                      value={form.account_number}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Branch Code</label>
                    <input
                      className="form-control"
                      name="branch_code"
                      value={form.branch_code}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <button className="btn btn-dark w-100 mt-4 py-2" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing…
                    </>
                  ) : (
                    "Request Withdrawal"
                  )}
                </button>
              </form>
            </div>
          </div>

          {submitting && <LoadingSpinner />}
        </div>
      </div>
    </div>
  );
}