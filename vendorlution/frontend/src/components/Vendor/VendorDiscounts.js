import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function VendorDiscounts(){
  const vendorId = localStorage.getItem("vendor_id") || "1";
  const [items, setItems] = useState([]); const [err, setErr] = useState(""); const [loading, setLoading] = useState(true);
  const load = ()=>{ setLoading(true); api.get(`/discounts/?vendor_id=${vendorId}`).then(res=>setItems(Array.isArray(res.data)?res.data:(res.data?.results||[]))).catch(()=>setErr("Failed to load discounts")).finally(()=>setLoading(false)); };
  useEffect(load, []);
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Discounts</h3>
        <Link to="/vendor/discounts/create" className="btn btn-dark"><i className="fa fa-plus me-2"></i>New Discount</Link>
      </div>
      {loading ? <div>Loading…</div> : err ? <div className="alert alert-danger">{err}</div> : items.length===0 ? <div className="text-muted">No discounts created yet.</div> : (
        <div className="table-responsive">
          <table className="table align-middle"><thead className="table-light"><tr><th>Name</th><th>Percent</th><th>Valid</th></tr></thead><tbody>
            {items.map(d=>(<tr key={d.id}><td>{d.name}</td><td>{d.percent}%</td><td>{new Date(d.valid_from).toLocaleDateString()} – {new Date(d.valid_to).toLocaleDateString()}</td></tr>))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
