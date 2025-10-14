import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function CustomerInbox() {
  const { search } = useLocation();
  const vendorParam = new URLSearchParams(search).get("vendor"); // optional deep-link
  const productParam = new URLSearchParams(search).get("product");

  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);

  // If user arrives with ?vendor=ID, ensure a conversation exists
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        if (vendorParam) {
          await api.post("/conversations/", { vendor_id: Number(vendorParam) }).catch(() => {});
        }
        const r = await api.get("/conversations/");
        if (!alive) return;
        const data = Array.isArray(r.data) ? r.data : r.data?.results || [];
        setConvos(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [vendorParam]);

  const empty = useMemo(() => convos.length === 0, [convos]);

  if (loading) return <div className="container py-4">Loading…</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-4">Messages</h3>

      <div className="card shadow-sm border-0">
        <div className="list-group list-group-flush">
          {empty ? (
            <div className="list-group-item text-muted">No conversations yet.</div>
          ) : (
            convos.map((c) => (
              <Link
                key={c.id}
                to={`/customer/inbox/${c.id}${productParam ? `?product=${productParam}` : ""}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-semibold">
                    {c?.vendor?.shop_name || `Vendor #${c.vendor?.id || "-"}`}
                  </div>
                  <div className="small text-muted">
                    Buyer: {c?.buyer?.user?.username || "me"} &middot; Conversation #{c.id}
                  </div>
                </div>
                <small className="text-muted">
                  {c.last_message_at
                    ? new Date(c.last_message_at).toLocaleString()
                    : new Date(c.created_at).toLocaleString()}
                </small>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
