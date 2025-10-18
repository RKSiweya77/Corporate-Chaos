import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";
import { toMedia } from "../../utils/media";

export default function Cart() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [] });

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.cart.detail);
      setCart(response.data || { items: [] });
    } catch (error) {
      console.error("Failed to load cart:", error);
      addNotification("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const totals = useMemo(() => {
    const items = cart.items || [];
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || item.product?.price || 0) * Number(item.quantity || item.qty || 1),
      0
    );
    const shipping = Number(cart.shipping_fee || 0);
    const protection = Number(cart.protection_fee || 0);
    const total = Number(cart.total ?? subtotal + shipping + protection);
    
    return { subtotal, shipping, protection, total };
  }, [cart]);

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.patch(API_ENDPOINTS.cart.updateItem(itemId), { 
        quantity: Math.max(1, quantity) 
      });
      await loadCart();
      addNotification("Cart updated", "success");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      addNotification("Failed to update quantity", "error");
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.cart.updateItem(itemId));
      await loadCart();
      addNotification("Item removed from cart", "success");
    } catch (error) {
      console.error("Failed to remove item:", error);
      addNotification("Failed to remove item", "error");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(Number(amount || 0));
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const items = cart.items || [];

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-dark mb-0">
          <i className="fas fa-shopping-cart me-2 text-primary"></i>
          Shopping Cart
        </h1>
        <div className="text-muted">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h4 className="text-muted mb-3">Your cart is empty</h4>
            <p className="text-muted mb-4">Browse our marketplace to find amazing products</p>
            <Link to="/marketplace" className="btn btn-dark btn-lg">
              <i className="fas fa-store me-2"></i>
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Cart Items
                </h5>
              </div>
              <div className="card-body p-0">
                {items.map((item) => {
                  const product = item.product || {};
                  const title = product.title || product.name || "Product";
                  const price = Number(item.price || product.price || 0);
                  const quantity = Number(item.quantity || item.qty || 1);
                  const image = product.main_image || product.image;
                  const maxStock = product.stock_quantity || 99;

                  return (
                    <div key={item.id} className="border-bottom p-4">
                      <div className="row align-items-center">
                        {/* Product Image */}
                        <div className="col-md-2 col-3">
                          {image ? (
                            <img
                              src={toMedia(image)}
                              alt={title}
                              className="img-fluid rounded"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                 style={{ width: '80px', height: '80px' }}>
                              <i className="fas fa-image text-muted"></i>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="col-md-4 col-9">
                          <Link 
                            to={`/product/${product.slug || product.id}`}
                            className="fw-semibold text-dark text-decoration-none"
                          >
                            {title}
                          </Link>
                          <div className="text-primary fw-bold mt-1">
                            {formatCurrency(price)}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-md-3 col-6">
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              disabled={quantity <= 1}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={maxStock}
                              value={quantity}
                              onChange={(e) => {
                                const newQuantity = Math.max(1, Math.min(maxStock, Number(e.target.value) || 1));
                                if (newQuantity !== quantity) {
                                  updateQuantity(item.id, newQuantity);
                                }
                              }}
                              className="form-control form-control-sm mx-2 text-center"
                              style={{ width: '70px' }}
                            />
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              disabled={quantity >= maxStock}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Remove */}
                        <div className="col-md-3 col-6 text-end">
                          <div className="fw-bold text-primary mb-2">
                            {formatCurrency(price * quantity)}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(item.id)}
                            title="Remove item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
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
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Shipping</span>
                  <strong>{formatCurrency(totals.shipping)}</strong>
                </div>
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Buyer Protection</span>
                  <strong>{formatCurrency(totals.protection)}</strong>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fw-bold fs-5 text-primary">
                    {formatCurrency(totals.total)}
                  </span>
                </div>

                <div className="small text-muted mb-3">
                  <i className="fas fa-shield-alt me-1 text-success"></i>
                  All purchases protected by escrow
                </div>
              </div>
              <div className="card-footer bg-light">
                <button 
                  className="btn btn-dark w-100 btn-lg"
                  onClick={() => navigate("/checkout")}
                >
                  <i className="fas fa-lock me-2"></i>
                  Proceed to Checkout
                </button>
                
                <div className="text-center mt-3">
                  <Link to="/marketplace" className="btn btn-outline-dark btn-sm">
                    <i className="fas fa-arrow-left me-2"></i>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}