// src/components/escrow/OrderProtection.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import { ZAR } from "../../utils/formatters";

export default function OrderProtection() {
  const { isAuthenticated } = useAuth();
  const [walletData, setWalletData] = useState({ pending: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadWallet() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(API_ENDPOINTS.wallet.me);
        if (!isMounted) return;
        
        const data = res.data || {};
        setWalletData({
          pending: parseFloat(data.pending || "0"),
          balance: parseFloat(data.balance || "0")
        });
      } catch (err) {
        if (!isMounted) return;
        setError("Failed to load wallet data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWallet();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <i className="fa fa-info-circle me-2" />
          Please sign in to view order protection information.
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Main Content */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0 fw-bold text-primary">
                <i className="fa fa-shield-alt me-2" />
                How Order Protection Works
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-warning">
                  <i className="fa fa-exclamation-triangle me-2" />
                  {error}
                </div>
              )}

              {/* Process Steps */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: 40, height: 40, minWidth: 40 }}>
                      <span className="fw-bold">1</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Secure Payment</h6>
                      <p className="small text-muted mb-0">
                        Buyer pays via wallet or Ozow. Funds are immediately secured in escrow - not sent to the vendor yet.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: 40, height: 40, minWidth: 40 }}>
                      <span className="fw-bold">2</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Vendor Ships</h6>
                      <p className="small text-muted mb-0">
                        Vendor prepares and ships the order with tracking. Both parties can monitor delivery progress.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: 40, height: 40, minWidth: 40 }}>
                      <span className="fw-bold">3</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Delivery Confirmation</h6>
                      <p className="small text-muted mb-0">
                        Buyer confirms receipt of items. Funds are then released to the vendor automatically.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: 40, height: 40, minWidth: 40 }}>
                      <span className="fw-bold">4</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Dispute Resolution</h6>
                      <p className="small text-muted mb-0">
                        If issues arise, either party can open a dispute. Our team mediates and makes a fair decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Protection Status */}
              <div className="alert alert-info border-0">
                <div className="d-flex align-items-center">
                  <i className="fa fa-shield-alt fa-2x me-3 text-info" />
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">Current Protection Status</h6>
                    <div className="d-flex flex-wrap gap-4">
                      <div>
                        <div className="small text-muted">In Escrow</div>
                        <div className="fw-bold text-warning">{ZAR(walletData.pending)}</div>
                      </div>
                      <div>
                        <div className="small text-muted">Available Balance</div>
                        <div className="fw-bold text-success">{ZAR(walletData.balance)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="small text-muted mb-0">
                Vendorlution's escrow system protects both buyers and vendors. Buyers get their money back if items 
                aren't delivered or aren't as described. Vendors get paid once they fulfill their obligations. 
                It's a win-win for marketplace safety.
              </p>
            </div>
          </div>
        </div>

        {/* Tips & Resources Sidebar */}
        <div className="col-12 col-lg-4">
          {/* Best Practices */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-lightbulb text-warning me-2" />
                Best Practices
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small mb-0">
                <li className="mb-2">
                  <i className="fa fa-check-circle text-success me-2" />
                  Keep all communication in the chat system
                </li>
                <li className="mb-2">
                  <i className="fa fa-check-circle text-success me-2" />
                  Upload photos as evidence for disputes
                </li>
                <li className="mb-2">
                  <i className="fa fa-check-circle text-success me-2" />
                  Track shipments and save tracking numbers
                </li>
                <li className="mb-2">
                  <i className="fa fa-check-circle text-success me-2" />
                  Confirm delivery promptly when items arrive
                </li>
                <li className="mb-0">
                  <i className="fa fa-check-circle text-success me-2" />
                  Contact support for urgent issues
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-rocket text-primary me-2" />
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/wallet/deposit" className="btn btn-outline-primary btn-sm">
                  <i className="fa fa-plus me-2" />
                  Add Funds to Wallet
                </Link>
                <Link to="/orders" className="btn btn-outline-dark btn-sm">
                  <i className="fa fa-shopping-bag me-2" />
                  View My Orders
                </Link>
                <Link to="/disputes" className="btn btn-outline-warning btn-sm">
                  <i className="fa fa-flag me-2" />
                  Open a Dispute
                </Link>
                <Link to="/chat" className="btn btn-outline-info btn-sm">
                  <i className="fa fa-comments me-2" />
                  Contact Support
                </Link>
                <Link to="/wallet/transactions" className="btn btn-outline-success btn-sm">
                  <i className="fa fa-history me-2" />
                  View Transaction History
                </Link>
              </div>
            </div>
            <div className="card-footer bg-light">
              <div className="small text-muted text-center">
                Need immediate help? <br />
                <a href="mailto:support@vendorlution.com" className="text-decoration-none">
                  support@vendorlution.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}