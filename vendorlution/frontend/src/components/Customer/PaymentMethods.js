// components/Customer/PaymentMethods.js
import React, { useState } from "react";

function PaymentMethods() {
  // Mock state (replace with API later)
  const [savedCards, setSavedCards] = useState([
    { id: 1, brand: "Visa", last4: "4242", exp: "12/26", default: true },
  ]);
  const [savedBanks, setSavedBanks] = useState([
    { id: 1, bank: "Capitec", accLast4: "1234", type: "Cheque" },
  ]);

  const banks = [
    "Absa",
    "FNB",
    "Standard Bank",
    "Nedbank",
    "Capitec",
    "Discovery Bank",
    "TymeBank",
    "African Bank",
    "Investec",
  ];

  const [activeTab, setActiveTab] = useState("deposit");

  // ---- Deposit: Instant EFT ----
  const [eftBank, setEftBank] = useState("Capitec");
  const startInstantEft = (e) => {
    e.preventDefault();
    alert(`Instant EFT (mock) via ${eftBank}`);
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
    alert("Card deposit (mock)");
    if (cardForm.save) {
      setSavedCards((prev) => [
        ...prev,
        {
          id: Date.now(),
          brand: "Card",
          last4: cardForm.number.slice(-4),
          exp: `${cardForm.expMonth}/${cardForm.expYear}`,
          default: false,
        },
      ]);
    }
    setCardForm({
      number: "",
      name: "",
      expMonth: "",
      expYear: "",
      cvc: "",
      save: true,
    });
  };

  // ---- Deposit: Manual EFT ----
  const [manualAmount, setManualAmount] = useState("");
  const [manualRef] = useState(
    "VND-" + Math.floor(Math.random() * 900000 + 100000)
  );
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

  // ---- Saved methods actions ----
  const setDefaultCard = (id) =>
    setSavedCards((prev) =>
      prev.map((c) => ({ ...c, default: c.id === id }))
    );
  const removeCard = (id) =>
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
  const removeBank = (id) =>
    setSavedBanks((prev) => prev.filter((b) => b.id !== id));

  // ---- Withdraw ----
  const [withdrawForm, setWithdrawForm] = useState({
    bank: "Capitec",
    accName: "",
    accNumber: "",
    branchCode: "",
    type: "Cheque",
  });
  const saveWithdraw = (e) => {
    e.preventDefault();
    alert("Withdrawal details saved (mock).");
    setSavedBanks((prev) => [
      ...prev,
      {
        id: Date.now(),
        bank: withdrawForm.bank,
        accLast4: withdrawForm.accNumber.slice(-4),
        type: withdrawForm.type,
      },
    ]);
    setWithdrawForm({
      bank: "Capitec",
      accName: "",
      accNumber: "",
      branchCode: "",
      type: "Cheque",
    });
    setActiveTab("saved");
  };

  return (
    <div className="container py-5">
      <h3 className="mb-4">Payment Methods</h3>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 justify-content-center">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            Deposit
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            Saved Methods
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "withdraw" ? "active" : ""}`}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw Setup
          </button>
        </li>
      </ul>

      {/* Deposit */}
      {activeTab === "deposit" && (
        <div className="row g-4">
          {/* Instant EFT */}
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Instant EFT</h5>
                <form onSubmit={startInstantEft}>
                  <div className="mb-3">
                    <label className="form-label">Bank</label>
                    <select
                      className="form-select"
                      value={eftBank}
                      onChange={(e) => setEftBank(e.target.value)}
                    >
                      {banks.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-dark w-100">
                    Continue
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Card</h5>
                <form onSubmit={submitCard}>
                  <input
                    className="form-control mb-2"
                    placeholder="Card Number"
                    value={cardForm.number}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, number: e.target.value })
                    }
                    required
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Name on Card"
                    value={cardForm.name}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, name: e.target.value })
                    }
                    required
                  />
                  <div className="row mb-2">
                    <div className="col-4">
                      <input
                        className="form-control"
                        placeholder="MM"
                        value={cardForm.expMonth}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, expMonth: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-4">
                      <input
                        className="form-control"
                        placeholder="YY"
                        value={cardForm.expYear}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, expYear: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-4">
                      <input
                        className="form-control"
                        placeholder="CVC"
                        value={cardForm.cvc}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, cvc: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={cardForm.save}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, save: e.target.checked })
                      }
                    />
                    <label className="form-check-label">Save this card</label>
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    Deposit
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Manual EFT */}
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Bank Transfer (Manual EFT)</h5>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Amount (R)"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                  />
                </div>
                <ul className="list-group small">
                  <li className="list-group-item d-flex justify-content-between">
                    Account Name <strong>Vendorlution Wallet</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    Bank <strong>Standard Bank</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    Account Number <strong>000123456</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    Branch Code <strong>051001</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    Reference{" "}
                    <strong>
                      {manualRef}{" "}
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={copyRef}
                      >
                        Copy
                      </button>
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Voucher */}
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Voucher</h5>
                <form onSubmit={redeemVoucher}>
                  <select
                    className="form-select mb-2"
                    value={voucherProvider}
                    onChange={(e) => setVoucherProvider(e.target.value)}
                  >
                    <option>Flash / 1Voucher</option>
                    <option>blu Voucher</option>
                    <option>OTT / Other</option>
                  </select>
                  <input
                    className="form-control mb-2"
                    placeholder="Voucher PIN"
                    value={voucherPin}
                    onChange={(e) => setVoucherPin(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary w-100">
                    Redeem
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved */}
      {activeTab === "saved" && (
        <div className="row g-4">
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5>Saved Cards</h5>
                {savedCards.length ? (
                  savedCards.map((c) => (
                    <div
                      key={c.id}
                      className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                      <span>
                        {c.brand} •••• {c.last4} ({c.exp})
                        {c.default && (
                          <span className="badge bg-success ms-2">Default</span>
                        )}
                      </span>
                      <div>
                        {!c.default && (
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setDefaultCard(c.id)}
                          >
                            Default
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeCard(c.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No saved cards.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5>Saved Bank Accounts</h5>
                {savedBanks.length ? (
                  savedBanks.map((b) => (
                    <div
                      key={b.id}
                      className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                      <span>
                        {b.bank} •••• {b.accLast4} ({b.type})
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeBank(b.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No bank accounts saved.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw */}
      {activeTab === "withdraw" && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5>Withdrawal Details</h5>
            <form onSubmit={saveWithdraw}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="form-label">Bank</label>
                  <select
                    className="form-select"
                    value={withdrawForm.bank}
                    onChange={(e) =>
                      setWithdrawForm({ ...withdrawForm, bank: e.target.value })
                    }
                  >
                    {banks.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label">Account Holder</label>
                  <input
                    className="form-control"
                    value={withdrawForm.accName}
                    onChange={(e) =>
                      setWithdrawForm({
                        ...withdrawForm,
                        accName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label">Account Number</label>
                  <input
                    className="form-control"
                    value={withdrawForm.accNumber}
                    onChange={(e) =>
                      setWithdrawForm({
                        ...withdrawForm,
                        accNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Branch Code</label>
                  <input
                    className="form-control"
                    value={withdrawForm.branchCode}
                    onChange={(e) =>
                      setWithdrawForm({
                        ...withdrawForm,
                        branchCode: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Account Type</label>
                  <select
                    className="form-select"
                    value={withdrawForm.type}
                    onChange={(e) =>
                      setWithdrawForm({
                        ...withdrawForm,
                        type: e.target.value,
                      })
                    }
                  >
                    <option>Cheque</option>
                    <option>Savings</option>
                    <option>Transmission</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-dark mt-2">
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentMethods;
