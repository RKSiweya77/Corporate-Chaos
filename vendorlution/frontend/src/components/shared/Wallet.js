import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Wallet({ mode="customer" }){
  const vendorId = localStorage.getItem("vendor_id");
  const customerId = localStorage.getItem("customer_id") || "1";
  const [wallet, setWallet] = useState(null); const [tx, setTx] = useState([]); const [err, setErr] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const params = mode==="vendor" ? `vendor_id=${vendorId||"1"}` : `customer_id=${customerId}`;
    api.get(`/wallet/?${params}`).then(res=>{
      setWallet(res.data);
      return api.get(`/transactions/?wallet_id=${res.data.id}`);
    }).then(res=>setTx(Array.isArray(res.data)?res.data:(res.data?.results||[]))).catch(()=>setErr("Failed to load wallet")).finally(()=>setLoading(false));
  }, [mode, vendorId, customerId]);
  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;
  if (!wallet) return null;
  return (
    <div className="container py-4">
      <h3 className="mb-3">{mode==="vendor" ? "Vendor Wallet" : "My Wallet"}</h3>
      <div className="card border-0 shadow-sm mb-3"><div className="card-body d-flex justify-content-between"><div>Wallet #{wallet.id} • {wallet.type}</div><div className="h4 mb-0">R {wallet.balance}</div></div></div>
      <h5 className="mb-2">Transactions</h5>
      {tx.length===0 ? <div className="text-muted">No transactions.</div> : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light"><tr><th>Date</th><th>Kind</th><th>Amount</th><th>Description</th><th>Ref</th></tr></thead>
            <tbody>{tx.map(t=>(<tr key={t.id}><td>{new Date(t.created_at).toLocaleString()}</td><td>{t.kind}</td><td>{t.kind==="credit" ? "+" : "-"} R {t.amount}</td><td>{t.description || "—"}</td><td>{t.reference || "—"}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
