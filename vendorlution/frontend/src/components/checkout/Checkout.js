import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

function feeBuyerProtection(subtotal) {
  // 6.5% + 19.90 (flat), like your copy. Round to 2 decimals.
  return +(subtotal * 0.065 + 19.9).toFixed(2);
}
function deliveryCost(method) {
  switch (method) {
    case "pargo": return 49;
    case "courier": return 59;
    case "postnet": return 109;
    case "pickup": return 0;
    default: return 0;
  }
}

export default function Checkout() {
  const [delivery, setDelivery] = useState("pargo");
  const [payment, setPayment] = useState("wallet");
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/me/cart/").then((r) => setCart(r.data)).catch(()=>setErr("Failed to load cart"));
  }, []);

  const items = cart?.items || [];
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price_snapshot || it.product?.price || 0) * (it.quantity || 0)),
        0
      ),
    [items]
  );
  const protection = feeBuyerProtection(subtotal);
  const ship = deliveryCost(delivery);
  const total = +(subtotal + protection + ship).toFixed(2);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const placeOrder = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await api.post("/checkout/", {
        delivery_method: delivery,
        payment_method: payment, // "wallet" | "ozow" | "mobicred" (wallet is supported in backend patch)
        protection_fee: protection,
        shipping_fee: ship,
      });
      // simple success UI:
      alert(`Order #${res.data.id} placed successfully!`);
      window.location.href = "/customer/orders";
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "string"
          ? e.response.data
          : "Failed to place order.");
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mt-3">
      <h3 className="mb-3">Checkout</h3>

      {/* Stepper */}
      <div className="d-flex justify-content-between mb-4">
        {["Delivery", "Payment", "Review"].map((label, i) => (
          <div
            key={i}
            className={`flex-fill text-center ${
              step === i + 1
                ? "fw-bold text-primary"
                : step > i + 1
                ? "text-success"
                : "text-muted"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* Step 1: Delivery (same UI, state kept) */}
      {step === 1 && (
        <div className="card mb-3">
          <div className="card-body">
            <h5><i className="fa fa-truck me-2"></i> Delivery Options</h5>
            {["pargo","courier","postnet","pickup"].map((opt) => (
              <div className="form-check mt-3" key={opt}>
                <input
                  type="radio"
                  className="form-check-input"
                  id={opt}
                  value={opt}
                  checked={delivery === opt}
                  onChange={(e) => setDelivery(e.target.value)}
                />
                <label className="form-check-label fw-bold" htmlFor={opt}>
                  {opt === "pargo" && <>Pargo Store-to-Store <span className="text-muted">+ R 49</span></>}
                  {opt === "courier" && <>The Courier Guy Locker &amp; Kiosk <span className="text-muted">+ R 59</span></>}
                  {opt === "postnet" && <>PostNet-to-PostNet <span className="text-muted">+ R 109</span></>}
                  {opt === "pickup" && <>Pick up from Seller <span className="text-muted">+ R 0</span></>}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Payment (kept, drives `payment` state) */}
      {step === 2 && (
        <>
          <div className="card mb-3 border-info">
            <div className="card-body">
              <h5 className="text-info">
                <i className="fa fa-shield-alt me-2"></i> Buyer Protection
              </h5>
              <p>6.5% of the full price + R 19.90 is applied automatically at checkout.</p>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h5><i className="fa fa-credit-card me-2"></i> Payment Methods</h5>
              {["wallet","ozow","mobicred"].map((pm) => (
                <div className="form-check mt-2" key={pm}>
                  <input
                    type="radio"
                    className="form-check-input"
                    id={pm}
                    value={pm}
                    checked={payment === pm}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                  <label className="form-check-label fw-bold" htmlFor={pm}>
                    {pm === "wallet" ? "Vendorlution Wallet" : pm === "ozow" ? "Ozow (Instant EFT)" : "Mobicred"}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Step 3: Review (uses real cart totals) */}
      {step === 3 && (
        <div className="card mb-3">
          <div className="card-body">
            <h5><i className="fa fa-receipt me-2"></i> Summary</h5>

            <ul className="list-group mb-3">
              {items.map((it) => {
                const price = Number(it.price_snapshot || it.product?.price || 0);
                return (
                  <li key={it.id} className="list-group-item d-flex justify-content-between">
                    <span>{it.quantity} × {it.product?.title}</span>
                    <span>R {(price * it.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>

            <table className="table">
              <tbody>
                <tr><td>Subtotal</td><td>R {subtotal.toFixed(2)}</td></tr>
                <tr><td>Delivery</td><td>R {ship.toFixed(2)}</td></tr>
                <tr><td>Buyer Protection</td><td>R {protection.toFixed(2)}</td></tr>
                <tr className="fw-bold"><td>Total</td><td>R {total.toFixed(2)}</td></tr>
              </tbody>
            </table>

            <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" id="terms" />
              <label className="form-check-label" htmlFor="terms">
                I agree to the terms and conditions
              </label>
            </div>

            <button className="btn btn-success w-100" onClick={placeOrder} disabled={busy}>
              {busy ? "Placing…" : "Place Order"}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between">
        {step > 1 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            Back
          </button>
        )}
        {step < 3 && (
          <button className="btn btn-primary ms-auto" onClick={nextStep}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
