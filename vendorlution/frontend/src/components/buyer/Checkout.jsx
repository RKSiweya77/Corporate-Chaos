// src/components/buyer/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";

const STEPS = ["delivery", "payment", "review"];

export default function Checkout() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cart, setCart] = useState(null);

  const [step, setStep] = useState("delivery");

  const [deliveryMethod, setDeliveryMethod] = useState("pargo");
  const [paymentMethod, setPaymentMethod] = useState("ozow");

  const [address, setAddress] = useState({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
    country_code: "+27",
  });

  const [pargo, setPargo] = useState({
    point_id: "",
    point_label: "",
    phone: "",
  });

  const [paxi, setPaxi] = useState({
    point_code: "",
    phone: "",
  });

  const [courierGuy, setCourierGuy] = useState({
    province: "",
    locker_label: "",
    phone: "",
  });

  const [postnet, setPostnet] = useState({
    province: "",
    store_label: "",
    phone: "",
  });

  const [aramex, setAramex] = useState({
    to_door: true,
  });

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.cart.detail);
      setCart(response.data || {});
    } catch (error) {
      addNotification("Failed to load checkout data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const totals = useMemo(() => {
    const items = cart?.items || [];
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || item.product?.price || 0) *
          Number(item.quantity || item.qty || 1),
      0
    );
    const shipping = Number(cart?.shipping_fee || 0);
    const protection = Number(cart?.protection_fee || 0);
    const total =
      typeof cart?.total === "number"
        ? Number(cart.total)
        : subtotal + shipping + protection;
    return { subtotal, shipping, protection, total };
  }, [cart]);

  const fmt = (amt) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
      Number(amt || 0)
    );

  const goNext = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  };

  const validateDelivery = () => {
    if (deliveryMethod === "pargo") {
      if (!pargo.point_id || !pargo.phone) {
        addNotification("Select a Pargo point and enter your phone.", "error");
        return false;
      }
      return true;
    }
    if (deliveryMethod === "paxi") {
      if (!paxi.point_code || !paxi.phone) {
        addNotification("Enter your PAXI point code and phone.", "error");
        return false;
      }
      return true;
    }
    if (deliveryMethod === "courier_guy") {
      if (!courierGuy.province || !courierGuy.locker_label || !courierGuy.phone) {
        addNotification("Choose province, locker and enter phone.", "error");
        return false;
      }
      return true;
    }
    if (deliveryMethod === "postnet") {
      if (!postnet.province || !postnet.store_label || !postnet.phone) {
        addNotification("Choose province, PostNet store and phone.", "error");
        return false;
      }
      return true;
    }
    if (deliveryMethod === "aramex") {
      const f = ["full_name", "line1", "city", "province", "postal_code", "phone"];
      for (const k of f) {
        if (!address[k]) {
          addNotification("Please complete your delivery address.", "error");
          return false;
        }
      }
      return true;
    }
    if (deliveryMethod === "pickup") {
      if (!address.full_name || !address.phone) {
        addNotification("Enter your name and phone for pickup.", "error");
        return false;
      }
      return true;
    }
    return true;
  };

  const handlePrimary = async () => {
    if (step === "delivery") {
      if (!validateDelivery()) return;
      setStep("payment");
      return;
    }
    if (step === "payment") {
      setStep("review");
      return;
    }
    if (step === "review") {
      await placeOrder();
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const payload = {
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        shipping_address:
          deliveryMethod === "aramex" ? address : undefined,
        pickup_details:
          deliveryMethod === "pickup"
            ? { contact_name: address.full_name, phone: address.phone }
            : undefined,
        pargo:
          deliveryMethod === "pargo"
            ? { point_id: pargo.point_id, point_label: pargo.point_label, phone: pargo.phone }
            : undefined,
        paxi:
          deliveryMethod === "paxi"
            ? { point_code: paxi.point_code, phone: paxi.phone }
            : undefined,
        courier_guy:
          deliveryMethod === "courier_guy"
            ? { province: courierGuy.province, locker_label: courierGuy.locker_label, phone: courierGuy.phone }
            : undefined,
        postnet:
          deliveryMethod === "postnet"
            ? { province: postnet.province, store_label: postnet.store_label, phone: postnet.phone }
            : undefined,
      };

      const res = await api.post(API_ENDPOINTS.checkout, payload);
      const data = res.data || {};
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
      if (data.order_id || data.id) {
        addNotification("Order placed successfully!", "success");
        navigate("/orders");
        return;
      }
      navigate("/orders");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Checkout failed. Please try again.";
      addNotification(msg, "error");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-3">Loading checkout…</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container py-3">
      <style>{`
        .dock-wrap { color: var(--text-0); }
        .stepper {
          display:flex; gap:.5rem; align-items:center; margin-bottom:12px;
        }
        .stp {
          display:flex; align-items:center; gap:.5rem; padding:.4rem .6rem;
          border:1px solid var(--border-0); background: var(--surface-1); border-radius:999px;
          font-weight:700; color: var(--text-1);
        }
        .stp.active { color: var(--text-0); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
        .panel {
          border:1px solid var(--border-0); border-radius:14px; background: var(--surface-1);
          box-shadow: 0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .opt {
          border:1px solid var(--border-0); border-radius:12px; background: var(--surface-0);
        }
        .opt.active { outline:2px solid color-mix(in oklab, var(--primary-500) 45%, transparent); }
        .muted { color: var(--text-1); }
        .sticky-bar {
          position: sticky; bottom: 0; z-index: 5; border-top: 1px solid var(--border-0);
          background: linear-gradient(180deg, var(--surface-1), var(--surface-0));
          padding:.75rem; border-radius: 0 0 14px 14px;
        }
        .btn-ghost { border:1px solid var(--border-0); background: var(--surface-0); color: var(--text-0); }
        .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 12%, var(--surface-0)); }
        .link-out { text-decoration:none; }
        .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:.75rem; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        .listish { list-style:none; margin:0; padding:0; }
        .listish li { display:flex; justify-content:space-between; padding:.3rem 0; border-bottom:1px dashed var(--border-0); }
        .listish li:last-child { border-bottom:none; }
      `}</style>

      <div className="dock-wrap">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h4 className="fw-bold mb-0">
            <i className="fa fa-lock me-2" />
            Checkout
          </h4>
          <div className="stepper">
            {STEPS.map((s) => (
              <div key={s} className={`stp ${step === s ? "active" : ""}`}>
                {s === "delivery" && <i className="fa fa-truck" />}
                {s === "payment" && <i className="fa fa-credit-card" />}
                {s === "review" && <i className="fa fa-clipboard-check" />}
                <span className="text-capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-3">
          {step === "delivery" && (
            <DeliveryStep
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              address={address}
              setAddress={setAddress}
              pargo={pargo}
              setPargo={setPargo}
              paxi={paxi}
              setPaxi={setPaxi}
              courierGuy={courierGuy}
              setCourierGuy={setCourierGuy}
              postnet={postnet}
              setPostnet={setPostnet}
              aramex={aramex}
              setAramex={setAramex}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          )}

          {step === "review" && (
            <ReviewStep
              items={items}
              totals={totals}
              deliveryMethod={deliveryMethod}
              paymentMethod={paymentMethod}
              address={address}
              pargo={pargo}
              paxi={paxi}
              courierGuy={courierGuy}
              postnet={postnet}
            />
          )}

          <div className="sticky-bar d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-ghost" type="button" onClick={goBack} disabled={step === "delivery" || placing}>
                <i className="fa fa-arrow-left me-2" />
                Back
              </button>
              <span className="muted">
                {step !== "review" ? (
                  <>
                    Subtotal <strong className="ms-1">{fmt(totals.subtotal)}</strong>
                  </>
                ) : (
                  <>
                    Total <strong className="ms-1">{fmt(totals.total)}</strong>
                  </>
                )}
              </span>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={handlePrimary}
              disabled={placing}
            >
              {step === "delivery" && (
                <>
                  Continue to Payment <i className="fa fa-arrow-right ms-2" />
                </>
              )}
              {step === "payment" && (
                <>
                  Review Order <i className="fa fa-clipboard-check ms-2" />
                </>
              )}
              {step === "review" && (
                <>
                  {placing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Placing…
                    </>
                  ) : (
                    <>
                      Place Order <i className="fa fa-lock ms-2" />
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 96 }} />
    </div>
  );
}

function DeliveryStep(props) {
  const {
    deliveryMethod,
    setDeliveryMethod,
    address,
    setAddress,
    pargo,
    setPargo,
    paxi,
    setPaxi,
    courierGuy,
    setCourierGuy,
    postnet,
    setPostnet,
  } = props;

  const openNearMe = (q) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="d-flex flex-column gap-3">
      <MethodCard
        title="Pargo Store-to-Store"
        price="+ R 49"
        logo={<span className="badge bg-dark">pargo</span>}
        active={deliveryMethod === "pargo"}
        onClick={() => setDeliveryMethod("pargo")}
      >
        <div className="grid-2">
          <div>
            <label className="form-label">Pargo Point ID</label>
            <input
              className="form-control"
              placeholder="e.g. PRG-123456"
              value={pargo.point_id}
              onChange={(e) =>
                setPargo((s) => ({ ...s, point_id: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">Your phone</label>
            <input
              className="form-control"
              placeholder="07x xxx xxxx"
              value={pargo.phone}
              onChange={(e) => setPargo((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Point label (optional)</label>
            <input
              className="form-control"
              placeholder="Mall / Store name"
              value={pargo.point_label}
              onChange={(e) =>
                setPargo((s) => ({ ...s, point_label: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-2 d-flex gap-2 flex-wrap">
          <a
            className="link-out btn btn-ghost btn-sm"
            href="https://pargo.co.za/find-a-pargo-point/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find a Pargo point
          </a>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => openNearMe("pargo pickup point near me")}
          >
            Use “near me”
          </button>
        </div>
      </MethodCard>

      <MethodCard
        title="PAXI PEP Store"
        price="+ R 49"
        logo={<span className="badge bg-dark">PAXI</span>}
        active={deliveryMethod === "paxi"}
        onClick={() => setDeliveryMethod("paxi")}
      >
        <div className="grid-2">
          <div>
            <label className="form-label">PAXI Point Code</label>
            <input
              className="form-control"
              placeholder="e.g. P1234"
              value={paxi.point_code}
              onChange={(e) =>
                setPaxi((s) => ({ ...s, point_code: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">Your phone</label>
            <input
              className="form-control"
              placeholder="07x xxx xxxx"
              value={paxi.phone}
              onChange={(e) => setPaxi((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-2 d-flex gap-2 flex-wrap">
          <a
            className="link-out btn btn-ghost btn-sm"
            href="https://www.paxipoint.co.za/point-finder/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find PAXI point
          </a>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => openNearMe("PAXI point near me")}
          >
            Use “near me”
          </button>
        </div>
      </MethodCard>

      <MethodCard
        title="The Courier Guy Locker & Kiosk"
        price="+ R 59"
        logo={<span className="badge bg-dark">Courier Guy</span>}
        active={deliveryMethod === "courier_guy"}
        onClick={() => setDeliveryMethod("courier_guy")}
      >
        <div className="grid-2">
          <div>
            <label className="form-label">Province</label>
            <select
              className="form-select"
              value={courierGuy.province}
              onChange={(e) =>
                setCourierGuy((s) => ({ ...s, province: e.target.value }))
              }
            >
              <option value="">Select Province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Locker / Kiosk</label>
            <input
              className="form-control"
              placeholder="Enter selected location name"
              value={courierGuy.locker_label}
              onChange={(e) =>
                setCourierGuy((s) => ({ ...s, locker_label: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">Your phone</label>
            <input
              className="form-control"
              placeholder="07x xxx xxxx"
              value={courierGuy.phone}
              onChange={(e) =>
                setCourierGuy((s) => ({ ...s, phone: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-2 d-flex gap-2 flex-wrap">
          <a
            className="link-out btn btn-ghost btn-sm"
            href="https://thecourierguy.co.za/locations/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find locker/kiosk
          </a>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => openNearMe("Courier Guy locker near me")}
          >
            Use “near me”
          </button>
        </div>
      </MethodCard>

      <MethodCard
        title="PostNet-to-PostNet"
        price="+ R 109"
        logo={<span className="badge bg-danger">POSTNET</span>}
        active={deliveryMethod === "postnet"}
        onClick={() => setDeliveryMethod("postnet")}
      >
        <div className="grid-2">
          <div>
            <label className="form-label">Province</label>
            <select
              className="form-select"
              value={postnet.province}
              onChange={(e) =>
                setPostnet((s) => ({ ...s, province: e.target.value }))
              }
            >
              <option value="">Select Province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Selected Store</label>
            <input
              className="form-control"
              placeholder="Enter PostNet store name"
              value={postnet.store_label}
              onChange={(e) =>
                setPostnet((s) => ({ ...s, store_label: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">Your phone</label>
            <input
              className="form-control"
              placeholder="07x xxx xxxx"
              value={postnet.phone}
              onChange={(e) => setPostnet((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-2 d-flex gap-2 flex-wrap">
          <a
            className="link-out btn btn-ghost btn-sm"
            href="https://www.postnet.co.za/stores/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find PostNet store
          </a>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => openNearMe("PostNet near me")}
          >
            Use “near me”
          </button>
        </div>
      </MethodCard>

      <MethodCard
        title="Aramex Store-to-Door"
        price="+ R 99.99"
        logo={<span className="badge bg-secondary">ARAMEX</span>}
        active={deliveryMethod === "aramex"}
        onClick={() => setDeliveryMethod("aramex")}
      >
        <div className="grid-2">
          <Text label="Full name" value={address.full_name} onChange={(v) => setAddress((s) => ({ ...s, full_name: v }))} />
          <Text label="Phone" value={address.phone} onChange={(v) => setAddress((s) => ({ ...s, phone: v }))} />
          <Text label="Street address" value={address.line1} onChange={(v) => setAddress((s) => ({ ...s, line1: v }))} className="col-12" />
          <Text label="Address line 2" value={address.line2} onChange={(v) => setAddress((s) => ({ ...s, line2: v }))} className="col-12" />
          <Text label="City" value={address.city} onChange={(v) => setAddress((s) => ({ ...s, city: v }))} />
          <Select
            label="Province"
            value={address.province}
            onChange={(v) => setAddress((s) => ({ ...s, province: v }))}
            options={PROVINCES}
          />
          <Text label="Postal code" value={address.postal_code} onChange={(v) => setAddress((s) => ({ ...s, postal_code: v }))} />
        </div>
      </MethodCard>

      <MethodCard
        title="Pick up from Seller"
        price="+ R 0"
        logo={<i className="fa fa-handshake" />}
        active={deliveryMethod === "pickup"}
        onClick={() => setDeliveryMethod("pickup")}
      >
        <div className="grid-2">
          <Text label="Your full name" value={address.full_name} onChange={(v) => setAddress((s) => ({ ...s, full_name: v }))} />
          <Text label="Phone" value={address.phone} onChange={(v) => setAddress((s) => ({ ...s, phone: v }))} />
        </div>
        <div className="small muted mt-2">
          After payment we’ll share pickup details with the seller and you.
        </div>
      </MethodCard>
    </div>
  );
}

function PaymentStep({ paymentMethod, setPaymentMethod }) {
  const Opt = ({ id, icon, title, desc }) => (
    <div
      className={`opt p-3 ${paymentMethod === id ? "active" : ""}`}
      role="button"
      onClick={() => setPaymentMethod(id)}
    >
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-bold">
            {icon} <span className="ms-2">{title}</span>
          </div>
          <div className="muted small">{desc}</div>
        </div>
        <input
          type="radio"
          className="form-check-input mt-1"
          checked={paymentMethod === id}
          onChange={() => setPaymentMethod(id)}
        />
      </div>
    </div>
  );
  return (
    <div className="d-flex flex-column gap-2">
      <Opt
        id="ozow"
        icon={<span className="badge bg-dark">ozow</span>}
        title="Pay with Ozow (Instant EFT)"
        desc="Secure bank redirect."
      />
      <Opt
        id="wallet"
        icon={<i className="fa fa-wallet" />}
        title="Wallet balance"
        desc="Pay using your Vendorlution wallet."
      />
      <Opt
        id="card"
        icon={<i className="fa fa-credit-card" />}
        title="Credit / Debit Card"
        desc="Visa & Mastercard via our PSP."
      />
      <Opt
        id="eft"
        icon={<i className="fa fa-building-columns" />}
        title="Manual EFT"
        desc="Place order, then pay via bank transfer with reference."
      />
    </div>
  );
}

function ReviewStep({
  items,
  totals,
  deliveryMethod,
  paymentMethod,
  address,
  pargo,
  paxi,
  courierGuy,
  postnet,
}) {
  return (
    <div className="d-flex flex-column gap-3">
      <div className="opt p-3">
        <div className="fw-bold mb-2">Items</div>
        <ul className="listish">
          {items.map((it) => (
            <li key={it.id}>
              <span>
                {it.product?.title || it.product?.name || "Product"} ×{" "}
                {it.quantity || it.qty || 1}
              </span>
              <span>
                {new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }).format(
                  Number(it.price || it.product?.price || 0) *
                    Number(it.quantity || it.qty || 1)
                )}
              </span>
            </li>
          ))}
          <li>
            <span className="fw-bold">Subtotal</span>
            <span className="fw-bold">
              {new Intl.NumberFormat("en-ZA", {
                style: "currency",
                currency: "ZAR",
              }).format(totals.subtotal)}
            </span>
          </li>
        </ul>
      </div>

      <div className="opt p-3">
        <div className="fw-bold mb-2">Delivery</div>
        <div className="small">
          <div className="text-capitalize">Method: {deliveryMethod.replace("_", " ")}</div>
          {deliveryMethod === "aramex" && (
            <div className="mt-1">
              {address.full_name} • {address.phone}
              <br />
              {address.line1} {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.province} {address.postal_code}
            </div>
          )}
          {deliveryMethod === "pargo" && (
            <div className="mt-1">
              Point: {pargo.point_label || pargo.point_id} • {pargo.phone}
            </div>
          )}
          {deliveryMethod === "paxi" && (
            <div className="mt-1">PAXI Code: {paxi.point_code} • {paxi.phone}</div>
          )}
          {deliveryMethod === "courier_guy" && (
            <div className="mt-1">
              {courierGuy.province} • {courierGuy.locker_label} • {courierGuy.phone}
            </div>
          )}
          {deliveryMethod === "postnet" && (
            <div className="mt-1">
              {postnet.province} • {postnet.store_label} • {postnet.phone}
            </div>
          )}
          {deliveryMethod === "pickup" && (
            <div className="mt-1">
              Pickup contact: {address.full_name} • {address.phone}
            </div>
          )}
        </div>
      </div>

      <div className="opt p-3">
        <div className="fw-bold mb-2">Payment</div>
        <div className="text-capitalize small">
          Method: {paymentMethod.replace("_", " ")}
        </div>
      </div>
    </div>
  );
}

function MethodCard({ title, price, logo, active, onClick, children }) {
  return (
    <div className={`opt p-3 ${active ? "active" : ""}`} role="button" onClick={onClick}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="fw-bold">
          <i className="fa fa-box me-2" />
          {title}
          <span className="ms-2 muted">{price}</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div>{logo}</div>
          <input type="radio" className="form-check-input" checked={active} readOnly />
        </div>
      </div>
      {active && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Text({ label, value, onChange, className }) {
  return (
    <div className={className || ""}>
      <label className="form-label">{label}</label>
      <input className="form-control" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];