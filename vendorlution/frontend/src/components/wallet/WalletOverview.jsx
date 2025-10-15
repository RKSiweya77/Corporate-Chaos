import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function WalletOverview() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/wallet/");
        if (!alive) return;
        setBalance(res?.data?.balance ?? "0.00");
      } catch (e) {
        setErr("Failed to load wallet balance");
      } finally {
        setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  if (loading) return <div>Loading…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <div>
      <h5 className="mb-2">Available Balance</h5>
      <h2 className="text-success">R {Number(balance).toFixed(2)}</h2>

      <div className="mt-3 d-flex gap-2">
        <Link to="/wallet/deposit" className="btn btn-dark">Deposit</Link>
        <Link to="/wallet/withdraw" className="btn btn-outline-dark">Withdraw</Link>
        <Link to="/wallet/transactions" className="btn btn-outline-secondary">View Transactions</Link>
      </div>

      <p className="text-muted small mt-3">
        This wallet is unified for both your buyer and seller activity. Deposits are instant once Ozow notifies our system.
      </p>
    </div>
  );
}
