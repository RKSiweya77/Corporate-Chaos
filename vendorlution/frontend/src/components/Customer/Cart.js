import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setErr("");
    api
      .get("/me/cart/")
      .then((res) => setCart(res.data))
      .catch(() => setErr("Failed to load cart"))
      .finally(() => setLoading(false));
  }, []);

  const updateQty = (itemId, quantity) => {
    const q = Math.max(1, parseInt(quantity || "1", 10));
    api.patch(`/me/cart/items/${itemId}/`, { quantity: q }).then(load);
  };

  const removeItem = (itemId) => {
    api.delete(`/me/cart/items/${itemId}/`).then(load);
  };

  useEffect(load, [load]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;
  if (!cart) return null;

  const items = cart.items || [];
  const total = items.reduce((s, it) => {
    const price = parseFloat(it.price_snapshot || it.product?.price || 0);
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="container py-4">
      <h3 className="mb-3">My Cart</h3>

      {items.length === 0 ? (
        <div className="text-muted">Cart is empty.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th style={{ width: 120 }}>Qty</th>
                  <th style={{ width: 160 }}>Price</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const price = parseFloat(it.price_snapshot || it.product?.price || 0);
                  return (
                    <tr key={it.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {it.product?.main_image ? (
                            <img
                              src={it.product.main_image}
                              alt=""
                              style={{ height: 48, width: 48, objectFit: "cover" }}
                              className="rounded me-2"
                            />
                          ) : (
                            <div
                              className="rounded me-2 bg-light"
                              style={{ height: 48, width: 48 }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{it.product?.title}</div>
                            <div className="small text-muted">R {price.toFixed(2)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => updateQty(it.id, e.target.value)}
                        />
                      </td>
                      <td>R {(price * it.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(it.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="2" className="text-end fw-semibold">
                    Total
                  </td>
                  <td colSpan="2" className="fw-bold">
                    R {total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end">
            <a href="/checkout" className="btn btn-dark">
              Proceed to Checkout
            </a>
          </div>
        </>
      )}
    </div>
  );
}
