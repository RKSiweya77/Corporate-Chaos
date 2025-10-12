import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function PayoutsHistory(){
  const vendorId = localStorage.getItem("vendor_id") || "1";
  const [items, setItems] = useState([]); const [err, setErr] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(()=>{ api.get(`/payouts/?vendor_id=${vendorId}`).then(res=>setItems(Array.isArray(res.data)?res.data:(res.data?.results||[]))).catch(()=>setErr("Failed to load payouts")).finally(()=>setLoading(false)); }, [vendorId]);
  return (
    <div className="container py-5">
      <h3 className="mb-4">Payouts History</h3>
      {loading ? <div>Loading…</div> : err ? <div className="alert alert-danger">{err}</div> : items.length===0 ? <div className="text-muted">No payout history found.</div> : (
        <div className="table-responsive">
          <table className="table align-middle"><thead className="table-light"><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {items.map(p=>(<tr key={p.id}><td>{new Date(p.created_at).toLocaleString()}</td><td>R {p.amount}</td><td><span className={`badge ${p.status==="completed"?"bg-success":p.status==="processing"?"bg-warning text-dark":p.status==="failed"?"bg-danger":"bg-secondary"}`}>{p.status}</span></td></tr>))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
