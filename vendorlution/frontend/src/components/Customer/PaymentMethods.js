import React, { useState } from "react";
import Sidebar from "./Sidebar";

function PaymentMethods() {
  // Mock state (replace with API later)
  const [savedCards, setSavedCards] = useState([
    { id: 1, brand: "Visa", last4: "4242", exp: "12/26", default: true },
  ]);
  const [savedBanks, setSavedBanks] = useState([
    { id: 1, bank: "Capitec", accLast4: "1234", type: "Cheque" },
  ]);

  // Common helpers
  const banks = [
    "Absa", "FNB", "Standard Bank", "Nedbank", "Capitec",
    "Discovery Bank", "TymeBank", "African Bank", "Investec"
  ];

  const [activeTab, setActiveTab] = useState("deposit"); // deposit | saved | withdraw

  // ---- Deposit: Instant EFT (Ozow-style) ----
  const [eftBank, setEftBank] = useState("Capitec");
  const startInstantEft = (e) => {
    e.preventDefault();
    alert(`Instant EFT (mock) via Ozow with ${eftBank}. Next step would open provider widget.`);
  };

  // ---- Deposit: Card ----
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    save: true,
  });
  const submitCard = (e) => {
    e.preventDefault();
    alert("Card deposit (mock). In production, this uses a payment gateway tokenization flow.");
    if (cardForm.save) {
      setSavedCards((prev) => [
        ...prev,
        { id: Date.now(), brand: "Card", last4: cardForm.number.slice(-4), exp: `${cardForm.expMonth}/${cardForm.expYear}`, default: false }
      ]);
    }
    setCardForm({ number: "", name: "", expMonth: "", expYear: "", cvc: "", save: true });
  };

  // ---- Deposit: Manual EFT (Bank transfer) ----
  const [manualAmount, setManualAmount] = useState("");
  const [manualRef, setManualRef] = useState("VND-" + Math.floor(Math.random()*900000 + 100000));
  const copyRef = () => {
    navigator.clipboard.writeText(manualRef);
    alert("Reference copied.");
  };

  // ---- Deposit: Voucher ----
  const [voucherProvider, setVoucherProvider] = useState("Flash / 1Voucher");
  const [voucherPin, setVoucherPin] = useState("");
  const redeemVoucher = (e) => {
    e.preventDefault();
    if (!voucherPin.trim()) return alert("Enter a voucher PIN.");
    alert(`Voucher (${voucherProvider}) redeemed (mock).`);
    setVoucherPin("");
  };

  // ---- Saved methods actions (mock) ----
  const setDefaultCard = (id) =>
    setSavedCards((prev) => prev.map(c => ({ ...c, default: c.id === id })));
  const removeCard = (id) =>
    setSavedCards((prev) => prev.filter(c => c.id !== id));
  const removeBank = (id) =>
    setSavedBanks((prev) => prev.filter(b => b.id !== id));

  // ---- Withdraw setup (bank account) ----
  const [withdrawForm, setWithdrawForm] = useState({
    bank: "Capitec",
    accName: "",
    accNumber: "",
    branchCode: "",
    type: "Cheque",
  });
  const saveWithdraw = (e) => {
    e.preventDefault();
    alert("Withdrawal details saved (mock). Later we’ll verify account (AVS) and store securely.");
    setSavedBanks((prev) => [
      ...prev,
      { id: Date.now(), bank: withdrawForm.bank, accLast4: withdrawForm.accNumber.slice(-4), type: withdrawForm.type }
    ]);
    setWithdrawForm({ bank: "Capitec", accName: "", accNumber: "", branchCode: "", type: "Cheque" });
    setActiveTab("saved");
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Payment Methods</h3>

          {/* Tabs */}
          <ul className="nav nav-pills mb-3">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "deposit" ? "active" : ""}`} onClick={() => setActiveTab("deposit")}>
                Deposit
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
                Saved Methods
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "withdraw" ? "active" : ""}`} onClick={() => setActiveTab("withdraw")}>
                Withdraw Setup
              </button>
            </li>
          </ul>

          {/* Content */}
          {activeTab === "deposit" && (
            <div className="row">
              {/* Instant EFT (Ozow) */}
              <div className="col-lg-6 col-12 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Instant EFT (Ozow-style)</h5>
                    <p className="text-muted small">
                      Pay securely via your bank — funds reflect immediately in your Vendorlution Wallet.
                    </p>
                    <form onSubmit={startInstantEft}>
                      <div className="mb-3">
                        <label className="form-label">Select your bank</label>
                        <select className="form-select" value={eftBank} onChange={(e) => setEftBank(e.target.value)}>
                          {banks.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Continue to Instant EFT
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Card */}
              <div className="col-lg-6 col-12 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Card</h5>
                    <p className="text-muted small">
                      Visa/Mastercard accepted. We’ll tokenize cards when we wire the gateway.
                    </p>
                    <form onSubmit={submitCard}>
                      <div className="mb-3">
                        <label className="form-label">Card Number</label>
                        <input className="form-control" value={cardForm.number} onChange={(e)=>setCardForm({...cardForm, number: e.target.value})} placeholder="0000 0000 0000 0000" required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Name on Card</label>
                        <input className="form-control" value={cardForm.name} onChange={(e)=>setCardForm({...cardForm, name: e.target.value})} required />
                      </div>
                      <div className="row">
                        <div className="col-4 mb-3">
                          <label className="form-label">Exp. Month</label>
                          <input className="form-control" value={cardForm.expMonth} onChange={(e)=>setCardForm({...cardForm, expMonth: e.target.value})} placeholder="MM" required />
                        </div>
                        <div className="col-4 mb-3">
                          <label className="form-label">Exp. Year</label>
                          <input className="form-control" value={cardForm.expYear} onChange={(e)=>setCardForm({...cardForm, expYear: e.target.value})} placeholder="YY" required />
                        </div>
                        <div className="col-4 mb-3">
                          <label className="form-label">CVC</label>
                          <input className="form-control" value={cardForm.cvc} onChange={(e)=>setCardForm({...cardForm, cvc: e.target.value})} placeholder="123" required />
                        </div>
                      </div>
                      <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" id="saveCard" checked={cardForm.save} onChange={(e)=>setCardForm({...cardForm, save: e.target.checked})}/>
                        <label className="form-check-label" htmlFor="saveCard">Save card for faster deposits</label>
                      </div>
                      <button type="submit" className="btn btn-success">Deposit with Card</button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Manual EFT */}
              <div className="col-lg-6 col-12 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Bank Transfer (EFT)</h5>
                    <p className="text-muted small">
                      Transfer from your bank app. Use the unique reference so we can auto-match your deposit.
                    </p>
                    <div className="mb-3">
                      <label className="form-label">Amount (R)</label>
                      <input className="form-control" value={manualAmount} onChange={(e)=>setManualAmount(e.target.value)} placeholder="e.g. 500" />
                    </div>
                    <ul className="list-group mb-3">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Account Name</span><strong>Vendorlution Wallet</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Bank</span><strong>Standard Bank</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Account Number</span><strong>000123456</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Branch Code</span><strong>051001</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Reference</span>
                        <div>
                          <strong>{manualRef}</strong>
                          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={copyRef}>Copy</button>
                        </div>
                      </li>
                    </ul>
                    <div className="alert alert-info small mb-0">
                      EFTs reflect when received. Use the reference exactly to avoid delays.
                    </div>
                  </div>
                </div>
              </div>

              {/* Voucher */}
              <div className="col-lg-6 col-12 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Voucher Top-Up</h5>
                    <p className="text-muted small">
                      Redeem retail vouchers to fund your Vendorlution Wallet (e.g., Flash/1Voucher, blu).
                    </p>
                    <form onSubmit={redeemVoucher}>
                      <div className="mb-3">
                        <label className="form-label">Provider</label>
                        <select className="form-select" value={voucherProvider} onChange={(e)=>setVoucherProvider(e.target.value)}>
                          <option>Flash / 1Voucher</option>
                          <option>blu Voucher</option>
                          <option>OTT / Other</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Voucher PIN</label>
                        <input className="form-control" value={voucherPin} onChange={(e)=>setVoucherPin(e.target.value)} placeholder="Enter PIN" />
                      </div>
                      <button type="submit" className="btn btn-primary">Redeem Voucher</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="row">
              {/* Saved Cards */}
              <div className="col-lg-6 col-12 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Saved Cards</h5>
                    {savedCards.length ? (
                      <div className="list-group">
                        {savedCards.map((c) => (
                          <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{c.brand}</strong> •••• {c.last4} <span className="text-muted">({c.exp})</span>
                              {c.default && <span className="badge bg-success ms-2">Default</span>}
                            </div>
                            <div>
                              {!c.default && (
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>setDefaultCard(c.id)}>
                                  Set Default
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-danger" onClick={()=>removeCard(c.id)}>
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No saved cards yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Saved Bank Accounts (for withdraw) */}
              <div className="col-lg-6 col-12 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Saved Bank Accounts</h5>
                    {savedBanks.length ? (
                      <div className="list-group">
                        {savedBanks.map((b) => (
                          <div key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{b.bank}</strong> •••• {b.accLast4}
                              <span className="text-muted ms-2">({b.type})</span>
                            </div>
                            <button className="btn btn-sm btn-outline-danger" onClick={()=>removeBank(b.id)}>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No saved bank accounts yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Withdrawal Details</h5>
                <p className="text-muted small">Add a bank account to receive withdrawals from your Vendorlution Wallet.</p>
                <form onSubmit={saveWithdraw}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Bank</label>
                      <select className="form-select" value={withdrawForm.bank} onChange={(e)=>setWithdrawForm({...withdrawForm, bank: e.target.value})}>
                        {banks.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Holder</label>
                      <input className="form-control" value={withdrawForm.accName} onChange={(e)=>setWithdrawForm({...withdrawForm, accName: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Number</label>
                      <input className="form-control" value={withdrawForm.accNumber} onChange={(e)=>setWithdrawForm({...withdrawForm, accNumber: e.target.value})} required />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Branch Code</label>
                      <input className="form-control" value={withdrawForm.branchCode} onChange={(e)=>setWithdrawForm({...withdrawForm, branchCode: e.target.value})} />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Account Type</label>
                      <select className="form-select" value={withdrawForm.type} onChange={(e)=>setWithdrawForm({...withdrawForm, type: e.target.value})}>
                        <option>Cheque</option>
                        <option>Savings</option>
                        <option>Transmission</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Withdrawal Details</button>
                </form>
              </div>
            </div>
          )}

          <p className="text-muted small mt-2">
            <i className="fa fa-info-circle me-1"></i>
            Deposits go to your Vendorlution Wallet. Purchases move funds to a seller’s Vendorlution wallet and are released after you confirm delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethods;
