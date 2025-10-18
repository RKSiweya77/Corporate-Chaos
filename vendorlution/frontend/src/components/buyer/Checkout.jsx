import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cart, setCart] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState("ozow");
  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [address, setAddress] = useState({
    full_name: "",
    line1: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
  });

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.cart.detail);
      setCart(response.data || {});
    } catch (error) {
      console.error("Failed to load checkout data:", error);
      addNotification("Failed to load checkout data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validate address
    if (!address.full_name || !address.line1 || !address.city || !address.province || !address.postal_code || !address.phone) {
      addNotification("Please fill in all required address fields", "error");
      return;
    }

    setPlacing(true);
    
    try {
      const payload = {
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        shipping_address: address,
      };

      const response = await api.post(API_ENDPOINTS.checkout, payload);
      const data = response.data || {};

      // Handle payment redirect
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }

      // Handle successful order creation
      if (data.order_id || data.id) {
        addNotification("Order placed successfully!", "success");
        navigate("/customer/orders");
        return;
      }

      // Fallback
      navigate("/customer/orders");
      
    } catch (error) {
      console.error("Checkout error:", error);
      const message = error?.response?.data?.detail || 
                     error?.response?.data?.error || 
                     "Checkout failed. Please try again.";
      addNotification(message, "error");
    } finally {
      setPlacing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(Number(amount || 0));
  };

  const summary = {
    total: Number(cart?.total ?? 0),
    shipping: Number(cart?.shipping_fee ?? 0),
    protection: Number(cart?.protection_fee ?? 0),
    subtotal: Number(cart?.subtotal ?? 
      (Array.isArray(cart?.items) ? 
        cart.items.reduce((sum, item) => 
          sum + Number(item.price || item.product?.price || 0) * Number(item.quantity || item.qty || 1), 0
        ) : 0
      )
    ),
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="fw-bold text-dark mb-4">
        <i className="fas fa-lock me-2 text-primary"></i>
        Checkout
      </h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="row g-4">
          {/* Checkout Steps */}
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className={`rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2`} 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="fw-semibold">Cart</div>
                  </div>
                  <div className="col-md-4">
                    <div className={`rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2`} 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-truck"></i>
                    </div>
                    <div className="fw-semibold">Shipping & Payment</div>
                  </div>
                  <div className="col-md-4">
                    <div className={`rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-2`} 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="text-muted">Confirmation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Forms */}
          <div className="col-lg-8">
            {/* Shipping Address */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Shipping Address
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address.full_name}
                      onChange={(e) => setAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={address.phone}
                      onChange={(e) => setAddress(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Street Address *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address.line1}
                      onChange={(e) => setAddress(prev => ({ ...prev, line1: e.target.value }))}
                      placeholder="Street name and number"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address.city}
                      onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Province *</label>
                    <select
                      className="form-select"
                      value={address.province}
                      onChange={(e) => setAddress(prev => ({ ...prev, province: e.target.value }))}
                      required
                    >
                      <option value="">Select Province</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                      <option value="Western Cape">Western Cape</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Postal Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address.postal_code}
                      onChange={(e) => setAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-truck me-2"></i>
                  Delivery Method
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {[
                    { value: "courier", label: "Standard Courier", description: "3-5 business days", price: "R 50.00" },
                    { value: "express", label: "Express Delivery", description: "1-2 business days", price: "R 100.00" },
                    { value: "pickup", label: "Store Pickup", description: "Free pickup from vendor", price: "Free" }
                  ].map((option) => (
                    <div className="col-md-4" key={option.value}>
                      <div 
                        className={`card border-2 cursor-pointer ${deliveryMethod === option.value ? 'border-primary' : 'border-light'}`}
                        onClick={() => setDeliveryMethod(option.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body text-center">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              checked={deliveryMethod === option.value}
                              onChange={() => setDeliveryMethod(option.value)}
                            />
                          </div>
                          <div className="fw-semibold mt-2">{option.label}</div>
                          <div className="small text-muted">{option.description}</div>
                          <div className="text-primary fw-bold">{option.price}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-credit-card me-2"></i>
                  Payment Method
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div 
                      className={`card border-2 cursor-pointer ${paymentMethod === "ozow" ? 'border-primary' : 'border-light'}`}
                      onClick={() => setPaymentMethod("ozow")}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            checked={paymentMethod === "ozow"}
                            onChange={() => setPaymentMethod("ozow")}
                          />
                          <label className="form-check-label fw-semibold ms-2">
                            Ozow Instant EFT
                          </label>
                        </div>
                        <div className="small text-muted mt-2">
                          Secure instant bank transfer. Redirects to your bank.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div 
                      className={`card border-2 cursor-pointer ${paymentMethod === "wallet" ? 'border-primary' : 'border-light'}`}
                      onClick={() => setPaymentMethod("wallet")}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            checked={paymentMethod === "wallet"}
                            onChange={() => setPaymentMethod("wallet")}
                          />
                          <label className="form-check-label fw-semibold ms-2">
                            Wallet Balance
                          </label>
                        </div>
                        <div className="small text-muted mt-2">
                          Pay using your Vendorlution wallet balance.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-receipt me-2"></i>
                  Order Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <strong>{formatCurrency(summary.subtotal)}</strong>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Shipping</span>
                  <strong>{formatCurrency(summary.shipping)}</strong>
                </div>
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Buyer Protection</span>
                  <strong>{formatCurrency(summary.protection)}</strong>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fw-bold fs-5 text-primary">
                    {formatCurrency(summary.total)}
                  </span>
                </div>

                <div className="alert alert-success small">
                  <i className="fas fa-shield-alt me-2"></i>
                  <strong>Buyer Protection:</strong> Your payment is held in escrow until you confirm delivery.
                </div>
              </div>
              <div className="card-footer bg-light">
                <button 
                  type="submit"
                  className="btn btn-dark w-100 btn-lg"
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock me-2"></i>
                      Place Order
                    </>
                  )}
                </button>
                
                <div className="text-center mt-3">
                  <button 
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => navigate("/cart")}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}