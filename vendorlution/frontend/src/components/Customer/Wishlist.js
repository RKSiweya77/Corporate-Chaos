import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const CUSTOMER_ID = localStorage.getItem("customer_id") || "1";
  const load = () => {
    setLoading(true); setErr("");
    api.get(`/wishlist/?customer_id=${CUSTOMER_ID}`)
      .then((res) => { const list = Array.isArray(res.data) ? res.data : (res.data?.results || []); setItems(list); })
      .catch(() => setErr("Failed to load wishlist"))
      .finally(() => setLoading(false));
  };
  const remove = (id) => { api.delete(`/wishlist/${id}/`).then(load); };
  useEffect(load, []);
  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;
  return (
    <div className="container py-4">
      <h3 className="mb-3">My Wishlist</h3>
      {items.length === 0 ? <div className="text-muted">No items yet.</div> : (
        <div className="row g-3">
          {items.map((w) => (
            <div key={w.id} className="col-6 col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                {w.product?.main_image ? <img src={w.product.main_image} alt={w.product.title} className="card-img-top" style={{height:150, objectFit:"cover"}} /> : <div className="bg-light d-flex align-items-center justify-content-center" style={{height:150}}><span className="text-muted small">No image</span></div>}
                <div className="card-body"><div className="fw-semibold">{w.product?.title}</div><div className="small text-muted">R {w.product?.price}</div></div>
                <div className="card-footer bg-white border-0 d-flex gap-2">
                  <a className="btn btn-sm btn-outline-dark flex-grow-1" href={`/products/${w.product?.id}`}>View</a>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(w.id)}><i className="fa fa-trash"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
