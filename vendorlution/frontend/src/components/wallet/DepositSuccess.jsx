// src/components/wallet/DepositSuccess.jsx
import { Link } from "react-router-dom";

export default function DepositSuccess() {
  return (
    <div className="container py-4 text-center">
      <h3>Payment Completed</h3>
      <p className="text-muted">
        If your bank shows a success screen, Ozow has sent (or will send shortly) a confirmation to us.
        Your wallet updates automatically.
      </p>
      <Link className="btn btn-dark" to="/customer/wallet">Back to Wallet</Link>
    </div>
  );
}
