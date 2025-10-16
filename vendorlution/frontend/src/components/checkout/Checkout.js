// frontend/src/components/checkout/Checkout.js - WITH WALLET INTEGRATION
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

function feeBuyerProtection(subtotal) {
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
  const [walletBalance, setWalletBalance] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Load cart and wallet balance
  useEffect(() => {
    Promise.all([
      api.get("/me/cart/"),
      api.get("/wallet/"),
    ])
      .then(([cartRes, walletRes]) => {
        setCart(cartRes.data);
        setWalletBalance(Number(walletRes.data?.balance || 0));
      })
      .catch(() => setErr("Failed to load checkout data"));
  }, []);

  const items = cart?.items || [];
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price_snapshot || it.product?.price || 0) * (it.quantity || 0)), 0),
    [items]
  );
  
  const protection = feeBuyerProtection(subtotal);
  const ship = deliveryCost(delivery);
  const total = +(subtotal + protection + ship).toFixed(2);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const placeOrder = async () => {
    setErr("");
    
    // Validate wallet balance if using wallet payment
    if (payment === "wallet" && walletBalance < total) {
      setErr(`Insufficient wallet balance. You need R ${total.toFixed(2)} but only have R ${walletBalance.toFixed(2)}`);
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/checkout/", {
        delivery_method: delivery,
        payment_method: payment,
        protection_fee: protection,
        shipping_fee: ship,
      });
      
      // Success! Show confirmation and redirect
      alert(`Order #${res.data.id} placed successfully! Funds are held securely in escrow until delivery.`);
      window.location.href = "/customer/orders";
    } catch (e) {
      const msg = e?.response?.data?.detail || (typeof e?.response?.data === "string" ? e.response.data : "Failed to place order.");
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!cart) return <div className="container py-4">Loading checkout...</div>;

  return (
    <div className="container mt-3">
      <h3 className="mb-3">Checkout</h3>

      {/* Progress Stepper */}
      <div className="d-flex justify-content-between mb-4">
        {["Delivery", "Payment", "Review"].map((label, i) => (
          <div
            key={i}
            className={`flex-fill text-center ${
              step === i + 1 ? "fw-bold text-primary" : step > i + 1 ? "text-success" : "text-muted"
            }`}
          >
            <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${
              step === i + 1 ? "bg-primary text-white" : step > i + 1 ? "bg-success text-white" : "bg-light"
            }`} style={{ width: 32, height: 32 }}>
              {step > i + 1 ? <i className="fa fa-check"></i> : i + 1}
            </div>
            <div className="small">{label}</div>
          </div>
        ))}
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* STEP 1: Delivery */}
      {step === 1 && (
        <div className="card mb-3">
          <div className="card-body">
            <h5><i className="fa fa-truck me-2"></i> Delivery Options</h5>
            <div className="row g-3 mt-2">
              {[
                { id: "pargo", name: "Pargo Store-to-Store", cost: 49, desc: "Collect from any Pargo point" },
                { id: "courier", name: "Courier Guy Locker", cost: 59, desc: "24/7 locker access" },
                { id: "postnet", name: "PostNet-to-PostNet", cost: 109, desc: "Nationwide network" },
                { id: "pickup", name: "Seller Pickup", cost: 0, desc: "Arrange with seller directly" },
              ].map((opt) => (
                <div className="col-md-6" key={opt.id}>
                  <div
                    className={`card h-100 ${delivery === opt.id ? "border-primary" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDelivery(opt.id)}
                  >
                    <div className="card-body">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id={opt.id}
                          value={opt.id}
                          checked={delivery === opt.id}
                          onChange={(e) => setDelivery(e.target.value)}
                        />
                        <label className="form-check-label fw-bold" htmlFor={opt.id}>
                          {opt.name}
                        </label>
                      </div>
                      <div className="small text-muted mt-1">{opt.desc}</div>
                      <div className="fw-semibold text-primary mt-2">+ R {opt.cost}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Payment */}
      {step === 2 && (
        <>
          {/* Buyer Protection Info */}
          <div className="card mb-3 border-info">
            <div className="card-body">
              <h5 className="text-info">
                <i className="fa fa-shield-alt me-2"></i> Buyer Protection
              </h5>
              <p className="mb-1">6.5% of subtotal + R 19.90 = <strong>R {protection.toFixed(2)}</strong></p>
              <p className="small text-muted mb-0">
                Your funds are held securely in escrow until you confirm delivery. 
                If the item doesn't arrive or doesn't match the description, you're protected.
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card mb-3">
            <div className="card-body">
              <h5><i className="fa fa-credit-card me-2"></i> Payment Method</h5>
              <div className="row g-3 mt-2">
                {/* Wallet Option */}
                <div className="col-md-4">
                  <div
                    className={`card h-100 ${payment === "wallet" ? "border-success" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPayment("wallet")}
                  >
                    <div className="card-body text-center">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="wallet"
                          value="wallet"
                          checked={payment === "wallet"}
                          onChange={(e) => setPayment(e.target.value)}
                        />
                      </div>
                      <i className="fa fa-wallet fa-2x text-success my-2"></i>
                      <div className="fw-bold">Vendorlution Wallet</div>
                      <div className="small text-muted">Balance: R {walletBalance.toFixed(2)}</div>
                      {walletBalance < total && (
                        <div className="badge bg-warning text-dark mt-2">Insufficient funds</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ozow Option */}
                <div className="col-md-4">
                  <div
                    className={`card h-100 ${payment === "ozow" ? "border-primary" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPayment("ozow")}
                  >
                    <div className="card-body text-center">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="ozow"
                          value="ozow"
                          checked={payment === "ozow"}
                          onChange={(e) => setPayment(e.target.value)}
                        />
                      </div>
                      <i className="fa fa-university fa-2x text-primary my-2"></i>
                      <div className="fw-bold">Ozow (Instant EFT)</div>
                      <div className="small text-muted">Pay directly from your bank</div>
                      <div className="badge bg-info text-dark mt-2">Coming Soon</div>
                    </div>
                  </div>
                </div>

                {/* Mobicred Option */}
                <div className="col-md-4">
                  <div
                    className={`card h-100 ${payment === "mobicred" ? "border-warning" : ""}`}
                    style={{ cursor: "pointer", opacity: 0.6 }}
                  >
                    <div className="card-body text-center">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="mobicred"
                          value="mobicred"
                          disabled
                        />
                      </div>
                      <i className="fa fa-credit-card fa-2x text-warning my-2"></i>
                      <div className="fw-bold">Mobicred</div>
                      <div className="small text-muted">Buy now, pay later</div>
                      <div className="badge bg-secondary mt-2">Coming Soon</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Balance Warning */}
              {payment === "wallet" && walletBalance < total && (
                <div className="alert alert-warning mt-3 d-flex justify-content-between align-items-center">
                  <span>
                    <i className="fa fa-exclamation-triangle me-2"></i>
                    You need R {(total - walletBalance).toFixed(2)} more in your wallet.
                  </span>
                  <Link to="/wallet/deposit" className="btn btn-sm btn-success">
                    Deposit Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* STEP 3: Review */}
      {step === 3 && (
        <div className="card mb-3">
          <div className="card-body">
            <h5><i className="fa fa-receipt me-2"></i> Order Summary</h5>

            {/* Cart Items */}
            <ul className="list-group mb-3">
              {items.map((it) => {
                const price = Number(it.price_snapshot || it.product?.price || 0);
                return (
                  <li key={it.id} className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-2">
                      {it.product?.main_image && (
                        <img src={it.product.main_image} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} className="rounded" />
                      )}
                      <div>
                        <div className="fw-semibold">{it.product?.title}</div>
                        <div className="small text-muted">Qty: {it.quantity} × R {price.toFixed(2)}</div>
                      </div>
                    </div>
                    <span className="fw-bold">R {(price * it.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>

            {/* Cost Breakdown */}
            <table className="table table-sm">
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td className="text-end">R {subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Delivery ({delivery})</td>
                  <td className="text-end">R {ship.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>
                    Buyer Protection 
                    <i className="fa fa-info-circle text-muted ms-1" title="Escrow protection fee"></i>
                  </td>
                  <td className="text-end">R {protection.toFixed(2)}</td>
                </tr>
                <tr className="fw-bold border-top">
                  <td>Total</td>
                  <td className="text-end">R {total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Payment Method Summary */}
            <div className="alert alert-light">
              <strong>Payment:</strong> {
                payment === "wallet" ? `Vendorlution Wallet (Balance: R ${walletBalance.toFixed(2)})` :
                payment === "ozow" ? "Ozow Instant EFT" :
                "Mobicred"
              }
            </div>

            {/* Terms Checkbox */}
            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" id="terms" required />
              <label className="form-check-label" htmlFor="terms">
                I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and understand that 
                funds will be held in escrow until I confirm delivery.
              </label>
            </div>

            {/* Place Order Button */}
            <button 
              className="btn btn-success w-100 btn-lg" 
              onClick={placeOrder} 
              disabled={busy || (payment === "wallet" && walletBalance < total)}
            >
              {busy ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing Order...
                </>
              ) : (
                <>
                  <i className="fa fa-lock me-2"></i>
                  Place Order (R {total.toFixed(2)})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mb-4">
        {step > 1 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            <i className="fa fa-arrow-left me-2"></i>Back
          </button>
        )}
        {step < 3 && (
          <button className="btn btn-primary ms-auto" onClick={nextStep}>
            Continue<i className="fa fa-arrow-right ms-2"></i>
          </button>
        )}
      </div>
    </div>
  );
}