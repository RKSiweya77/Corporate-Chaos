// components/Customer/CustomerInbox.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CustomerInbox() {
  const nav = useNavigate();
  const q = useQuery();

  const [me, setMe] = useState(null);
  const [list, setList] = useState([]);
  const [vendorMap, setVendorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // load me + conversations
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [rMe, rConvos] = await Promise.all([
        api.get("/auth/me/"),
        api.get("/me/conversations/"),
      ]);
      setMe(rMe.data);

      const convos = Array.isArray(rConvos.data)
        ? rConvos.data
        : rConvos.data?.results || [];
      setList(convos);

      // fetch vendor details for nicer names/avatars
      const vendorIds = [...new Set(convos.map((c) => c.vendor).filter(Boolean))];
      if (vendorIds.length) {
        const entries = await Promise.all(
          vendorIds.map(async (id) => {
            try {
              const r = await api.get(`/vendors/${id}/`);
              return [id, r.data];
            } catch {
              return [id, null];
            }
          })
        );
        setVendorMap(Object.fromEntries(entries));
      } else {
        setVendorMap({});
      }
    } catch {
      setErr("Failed to load inbox.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // If deep-linked with ?vendor=ID, open (or create) that conversation and redirect to /customer/inbox/:id
  useEffect(() => {
    const vendorId = q.get("vendor");
    if (!vendorId || !list.length || !me?.customer_id) return;

    const existing = list.find((c) => String(c.vendor) === String(vendorId));
    const ensure = async () => {
      if (existing) {
        nav(`/customer/inbox/${existing.id}`, { replace: true });
        return;
      }
      try {
        const r = await api.post("/me/conversations/", { vendor_id: Number(vendorId) });
        const convId = r.data?.id;
        if (convId) {
          nav(`/customer/inbox/${convId}`, { replace: true });
        } else {
          await load();
        }
      } catch {
        await load();
      }
    };
    ensure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, list, me]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-4">Messages</h3>

      <div className="card shadow-sm border-0">
        <div className="list-group list-group-flush">
          {list.length ? (
            list.map((c) => {
              const v = vendorMap[c.vendor];
              const name = v?.shop_name || `Vendor #${c.vendor}`;
              const logo = v?.logo;
              const when =
                c.last_message_at
                  ? new Date(c.last_message_at).toLocaleString()
                  : new Date(c.created_at).toLocaleString();
              return (
                <Link
                  key={c.id}
                  to={`/customer/inbox/${c.id}`}
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={name}
                      width="48"
                      height="48"
                      className="rounded-circle me-3 border"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle me-3 bg-light border"
                      style={{ width: 48, height: 48 }}
                    />
                  )}
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <h6 className="mb-0">{name}</h6>
                      <small className="text-muted">{when}</small>
                    </div>
                    <p className="mb-0 small text-muted">
                      Conversation #{c.id}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center text-muted py-5">
              <i className="fa fa-comments fa-3x mb-3" />
              <p>No conversations yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
