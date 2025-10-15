// src/components/Vendor/VendorInbox.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import VendorSidebar from "./VendorSidebar";

export default function VendorInbox() {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/me/conversations/");
        setConvos(res.data);
      } catch (e) {
        if (e?.response?.status === 401)
          nav("/vendor/login?next=" + encodeURIComponent(window.location.pathname));
        else setError("Failed to load inbox");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-3 mb-3">
          <VendorSidebar />
        </div>
        <div className="col-md-9">
          <h3 className="mb-3">Vendor Messages</h3>
          <div className="list-group shadow-sm">
            {convos.length === 0 && (
              <div className="text-center text-muted py-5">No conversations yet.</div>
            )}
            {convos.map((c) => {
              const buyer = c.buyer || c.buyer_obj || {};
              const product = c.product || {};
              return (
                <Link
                  key={c.id}
                  to={`/customer/inbox?conversation=${c.id}`}
                  className="list-group-item list-group-item-action"
                >
                  <div className="d-flex justify-content-between">
                    <strong>{buyer.user?.username || `Buyer #${buyer.id}`}</strong>
                    <small className="text-muted">
                      {c.last_message_at
                        ? new Date(c.last_message_at).toLocaleString()
                        : ""}
                    </small>
                  </div>
                  {product?.title && (
                    <div className="small text-muted">Product: {product.title}</div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
