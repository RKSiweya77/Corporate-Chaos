import { useState } from "react";

function Checkout() {
  const [delivery, setDelivery] = useState("pargo");
  const [payment, setPayment] = useState("wallet");
  const [step, setStep] = useState(1); // 1=Delivery, 2=Payment, 3=Review

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

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

      {/* Step 1: Delivery */}
      {step === 1 && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>
              <i className="fa fa-truck me-2"></i> Delivery Options
            </h5>

            {/* Pargo */}
            <div className="form-check mt-2">
              <input
                type="radio"
                className="form-check-input"
                id="pargo"
                value="pargo"
                checked={delivery === "pargo"}
                onChange={(e) => setDelivery(e.target.value)}
              />
              <label className="form-check-label fw-bold" htmlFor="pargo">
                Pargo Store-to-Store <span className="text-muted">+ R 49</span>
              </label>
              {delivery === "pargo" && (
                <div className="mt-2 border rounded p-2 bg-light">
                  <label className="form-label">Select your closest Pargo Point</label>
                  <select className="form-select mb-2">
                    <option>Pick n Pay - Cape Town</option>
                    <option>Clicks - Johannesburg</option>
                    <option>Spar - Durban</option>
                  </select>
                  <label className="form-label">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text">+27</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Courier Guy */}
            <div className="form-check mt-3">
              <input
                type="radio"
                className="form-check-input"
                id="courier"
                value="courier"
                checked={delivery === "courier"}
                onChange={(e) => setDelivery(e.target.value)}
              />
              <label className="form-check-label fw-bold" htmlFor="courier">
                The Courier Guy Locker & Kiosk{" "}
                <span className="text-muted">+ R 59</span>
              </label>
              {delivery === "courier" && (
                <div className="mt-2 border rounded p-2 bg-light">
                  <label className="form-label">Select Province</label>
                  <select className="form-select mb-2">
                    <option>Gauteng</option>
                    <option>Western Cape</option>
                    <option>KwaZulu-Natal</option>
                  </select>
                  <a
                    href="https://thecourierguy.co.za/locations/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Find a Courier Guy location near you
                  </a>
                </div>
              )}
            </div>

            {/* PostNet */}
            <div className="form-check mt-3">
              <input
                type="radio"
                className="form-check-input"
                id="postnet"
                value="postnet"
                checked={delivery === "postnet"}
                onChange={(e) => setDelivery(e.target.value)}
              />
              <label className="form-check-label fw-bold" htmlFor="postnet">
                PostNet-to-PostNet <span className="text-muted">+ R 109</span>
              </label>
              {delivery === "postnet" && (
                <div className="mt-2 border rounded p-2 bg-light">
                  <label className="form-label">Select Province</label>
                  <select className="form-select mb-2">
                    <option>Gauteng</option>
                    <option>Western Cape</option>
                    <option>KwaZulu-Natal</option>
                  </select>
                  <a
                    href="https://www.postnet.co.za/stores"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Find a PostNet near you
                  </a>
                </div>
              )}
            </div>

            {/* Pickup */}
            <div className="form-check mt-3">
              <input
                type="radio"
                className="form-check-input"
                id="pickup"
                value="pickup"
                checked={delivery === "pickup"}
                onChange={(e) => setDelivery(e.target.value)}
              />
              <label className="form-check-label fw-bold" htmlFor="pickup">
                Pick up from Seller <span className="text-muted">+ R 0</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <>
          {/* Buyer Protection */}
          <div className="card mb-3 border-info">
            <div className="card-body">
              <h5 className="text-info">
                <i className="fa fa-shield-alt me-2"></i> Buyer Protection
              </h5>
              <p>
                6.5% of the full price + R 19.90 is applied automatically at checkout
                to protect your purchase.
              </p>
              <ul>
                <li>Scam prevention — money is held safely until delivery confirmed.</li>
                <li>Return & refund policy if item differs from description.</li>
                <li>Dedicated customer support team.</li>
                <li>Secure payments with trusted partners.</li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card mb-3">
            <div className="card-body">
              <h5>
                <i className="fa fa-credit-card me-2"></i> Payment Methods
              </h5>

              {/* Wallet */}
              <div className="form-check mt-2">
                <input
                  type="radio"
                  className="form-check-input"
                  id="wallet"
                  value="wallet"
                  checked={payment === "wallet"}
                  onChange={(e) => setPayment(e.target.value)}
                />
                <label className="form-check-label fw-bold" htmlFor="wallet">
                  Vendorlution Wallet
                </label>
                <p className="small text-muted mb-1">
                  Pay directly from your Vendorlution Wallet. Balance must cover
                  purchase amount including delivery.
                </p>
              </div>

              {/* Ozow */}
              <div className="form-check mt-3">
                <input
                  type="radio"
                  className="form-check-input"
                  id="ozow"
                  value="ozow"
                  checked={payment === "ozow"}
                  onChange={(e) => setPayment(e.target.value)}
                />
                <label className="form-check-label fw-bold" htmlFor="ozow">
                  Ozow (Instant EFT)
                </label>
                <p className="small text-muted mb-1">
                  Pay directly from your bank account using instant EFT. No extra
                  fees apply.
                </p>
              </div>

              {/* Mobicred */}
              <div className="form-check mt-3">
                <input
                  type="radio"
                  className="form-check-input"
                  id="mobicred"
                  value="mobicred"
                  checked={payment === "mobicred"}
                  onChange={(e) => setPayment(e.target.value)}
                />
                <label className="form-check-label fw-bold" htmlFor="mobicred">
                  Mobicred
                </label>
                <p className="small text-muted mb-1">
                  Shop now and repay monthly via Mobicred at competitive rates.
                </p>
                <a
                  href="https://mobicred.co.za/"
                  target="_blank"
                  rel="noreferrer"
                  className="small"
                >
                  Learn more / Apply here
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>
              <i className="fa fa-receipt me-2"></i> Summary
            </h5>
            <table className="table">
              <tbody>
                <tr>
                  <td>Item price</td>
                  <td>R 500</td>
                </tr>
                <tr>
                  <td>Delivery</td>
                  <td>
                    {delivery === "pargo" && "R 49"}
                    {delivery === "courier" && "R 59"}
                    {delivery === "postnet" && "R 109"}
                    {delivery === "pickup" && "R 0"}
                  </td>
                </tr>
                <tr>
                  <td>Buyer Protection</td>
                  <td>R 19.90</td>
                </tr>
                <tr className="fw-bold">
                  <td>Total</td>
                  <td>
                    R{" "}
                    {500 +
                      (delivery === "pargo"
                        ? 49
                        : delivery === "courier"
                        ? 59
                        : delivery === "postnet"
                        ? 109
                        : 0) +
                      19.9}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" id="terms" />
              <label className="form-check-label" htmlFor="terms">
                I agree to the terms and conditions
              </label>
            </div>

            <button className="btn btn-success w-100">Place Order</button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
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

export default Checkout;
