import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function VendorCustomers() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pull all orders that include this vendor's products
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await api.get("/me/vendor/orders/");
        if (!alive) return;
        const data = r.data.results || r.data; // handle paginated/non-paginated
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Deduplicate customers from orders
  const customers = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const c = o.customer;
      if (c?.id && !map.has(c.id)) map.set(c.id, c);
    }
    return Array.from(map.values());
  }, [orders]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="placeholder-glow">
          <div className="placeholder col-6" />
          <div className="placeholder col-8 my-2" />
          <div className="placeholder col-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">Your Customers</h3>
      {customers.length === 0 ? (
        <div className="alert alert-info">No customers yet — as you receive orders, your buyers will show here.</div>
      ) : (
        <div className="list-group">
          {customers.map((c) => (
            <div className="list-group-item d-flex align-items-center" key={c.id}>
              <div className="flex-grow-1">
                <div className="fw-semibold">Customer #{c.id}</div>
                <div className="small text-muted">
                  User ID: {c.user} • Mobile: {c.mobile || "—"}
                </div>
              </div>
              {/* You can link to a future “messages” page here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
