// src/components/wallet/DepositCancel.jsx
import { Link } from "react-router-dom";

export default function DepositCancel() {
  return (
    <div className="container py-4 text-center">
      <h3>Payment Cancelled</h3>
      <p className="text-muted">No funds were debited. You can try again anytime.</p>
      <Link className="btn btn-outline-dark" to="/customer/wallet">Back to Wallet</Link>
    </div>
  );
}
