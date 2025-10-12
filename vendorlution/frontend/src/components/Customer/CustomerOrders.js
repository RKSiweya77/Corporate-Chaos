import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CustomerOrders(){
  const CUSTOMER_ID = localStorage.getItem("customer_id") || "1";
  const [items, setItems] = useState([]); const [err, setErr] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(()=>{ api.get(`/orders/?customer_id=${CUSTOMER_ID}`).then(res=>setItems(Array.isArray(res.data)?res.data:(res.data?.results||[]))).catch(()=>setErr("Failed to load orders")).finally(()=>setLoading(false)); }, []);
  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;
  return (
    <div className="container py-4">
      <h3 className="mb-3">My Orders</h3>
      {items.length===0 ? <div className="text-muted">No orders yet.</div> : items.map((o)=>(
        <div key={o.id} className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between"><div><strong>Order #{o.id}</strong> • {o.status}</div><div className="fw-bold">R {o.total_amount}</div></div>
            <ul className="small mt-2 mb-0">{o.items?.map(it=>(<li key={it.id}>{it.quantity} × {it.product?.title} @ R {it.price_snapshot}</li>))}</ul>
          </div>
        </div>
      ))}
    </div>
  );
}
