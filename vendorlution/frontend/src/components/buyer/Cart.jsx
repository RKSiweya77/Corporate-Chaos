// src/components/buyer/Cart.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";
import { useCart } from "../../context/CartContext";
import { toMedia } from "../../utils/media";

export default function Cart() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const cartCtx = typeof useCart === "function" ? useCart() : null;
  const setCtxItems = cartCtx?.setItems || cartCtx?.updateItems || null;
  const refreshCtx = cartCtx?.refresh || null;

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [] });

  const syncContext = useCallback(
    (items) => {
      try {
        setCtxItems?.(Array.isArray(items) ? items : []);
      } catch {}
      try {
        const evt = new CustomEvent("cart:changed", { detail: { items } });
        window.dispatchEvent(evt);
      } catch {}
    },
    [setCtxItems]
  );

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.cart.detail);
      const nextCart = response.data || { items: [] };
      setCart(nextCart);
      syncContext(nextCart.items || []);
    } catch (error) {
      console.error("Failed to load cart:", error);
      addNotification("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  }, [addNotification, syncContext]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const items = cart.items || [];

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || item.product?.price || 0) * Number(item.quantity || item.qty || 1),
      0
    );
    const shipping = Number(cart.shipping_fee || 0);
    const protection = Number(cart.protection_fee || 0);
    const total = Number(cart.total ?? subtotal + shipping + protection);
    return { subtotal, shipping, protection, total };
  }, [items, cart]);

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.patch(API_ENDPOINTS.cart.updateItem(itemId), { quantity: Math.max(1, quantity) });
      await loadCart();
      refreshCtx?.();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      addNotification("Failed to update quantity", "error");
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    try {
      await api.delete(API_ENDPOINTS.cart.updateItem(itemId));
      await loadCart();
      refreshCtx?.();
    } catch (error) {
      console.error("Failed to remove item:", error);
      addNotification("Failed to remove item", "error");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
      Number(amount || 0)
    );

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

  return (
    <div className="container py-4 cart-wrap">
      <style>{`
        .cart-wrap { color: var(--text-0); }
        .h-title { color: var(--text-0); }
        .muted { color: var(--text-1); }
        .panel {
          border: 1px solid var(--border-0);
          border-radius: 14px;
          background: var(--surface-1);
          box-shadow: 0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .panel-hd {
          display:flex; align-items:center; justify-content:space-between;
          padding:.85rem 1rem; border-bottom:1px solid var(--border-0);
          color: var(--text-0);
        }
        .panel-body { padding: 0; }
        .panel-body-inner { padding: 1rem; }
        .line { border-bottom: 1px solid var(--border-0); }
        .thumb {
          width: 80px; height: 80px; border-radius: 8px; overflow: hidden;
          background: var(--surface-0); border: 1px solid var(--border-0);
        }
        .qty-btn { min-width: 36px; }
        .btn-ghost {
          border:1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
          border-radius: 10px;
        }
        .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 12%, var(--surface-1)); }
        .summary-card { position: sticky; top: 20px; }
        .summary-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:.5rem; }
        .summary-total { font-size: 1.25rem; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold h-title mb-0">
          <i className="fa fa-shopping-cart me-2 text-primary" />
          Shopping Cart
        </h1>
        <div className="muted">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="panel text-center py-5">
          <div className="panel-body-inner">
            <i className="fa fa-shopping-cart fa-3x muted mb-3" />
            <h4 className="muted mb-2">Your cart is empty</h4>
            <p className="muted mb-3">Browse our marketplace to find amazing products</p>
            <Link to="/products" className="btn btn-ghost btn-lg">
              <i className="fa fa-store me-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="panel">
              <div className="panel-hd">
                <h5 className="mb-0 fw-bold">
                  <i className="fa fa-list me-2" />
                  Cart Items
                </h5>
                <span className="muted">{items.length}</span>
              </div>

              <div className="panel-body">
                {items.map((item, idx) => {
                  const product = item.product || {};
                  const title = product.title || product.name || "Product";
                  const price = Number(item.price || product.price || 0);
                  const quantity = Number(item.quantity || item.qty || 1);
                  const image = product.main_image || product.image;
                  const maxStock = product.stock_quantity || 99;

                  return (
                    <div key={item.id || `row-${idx}`} className={`p-3 ${idx < items.length - 1 ? "line" : ""}`}>
                      <div className="row align-items-center g-3">
                        <div className="col-3 col-md-2">
                          <div className="thumb d-flex align-items-center justify-content-center">
                            {image ? (
                              <img
                                src={toMedia(image)}
                                alt={title}
                                className="w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <i className="fa fa-image muted" />
                            )}
                          </div>
                        </div>

                        <div className="col-9 col-md-4">
                          <Link
                            to={`/product/${product.slug || product.id}`}
                            className="text-decoration-none"
                            style={{ color: "var(--text-0)" }}
                          >
                            <div className="fw-semibold text-truncate">{title}</div>
                          </Link>
                          <div className="fw-bold text-primary mt-1">{formatCurrency(price)}</div>
                        </div>

                        <div className="col-6 col-md-3">
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-outline-secondary btn-sm qty-btn"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <i className="fa fa-minus" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={maxStock}
                              value={quantity}
                              onChange={(e) => {
                                const newQty = Math.max(
                                  1,
                                  Math.min(maxStock, Number(e.target.value) || 1)
                                );
                                if (newQty !== quantity) updateQuantity(item.id, newQty);
                              }}
                              className="form-control form-control-sm mx-2 text-center"
                              style={{ width: 72 }}
                              aria-label="Quantity"
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm qty-btn"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              disabled={quantity >= maxStock}
                              aria-label="Increase quantity"
                            >
                              <i className="fa fa-plus" />
                            </button>
                          </div>
                        </div>

                        <div className="col-6 col-md-3 text-end">
                          <div className="fw-bold text-primary mb-2">
                            {formatCurrency(price * quantity)}
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(item.id)}
                            title="Remove item"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="panel summary-card">
              <div className="panel-hd">
                <h5 className="mb-0 fw-bold">
                  <i className="fa fa-receipt me-2" />
                  Order Summary
                </h5>
              </div>
              <div className="panel-body-inner">
                <div className="summary-row">
                  <span className="muted">Subtotal</span>
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </div>
                <div className="summary-row">
                  <span className="muted">Shipping</span>
                  <strong>{formatCurrency(totals.shipping)}</strong>
                </div>
                <div className="summary-row mb-2">
                  <span className="muted">Buyer Protection</span>
                  <strong>{formatCurrency(totals.protection)}</strong>
                </div>
                <hr className="my-2" />
                <div className="summary-row">
                  <span className="fw-bold summary-total">Total</span>
                  <span className="fw-bold summary-total text-primary">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
                <div className="small muted mt-2">
                  <i className="fa fa-shield-halved me-1 text-success" />
                  Protected by escrow
                </div>
              </div>
              <div className="p-3">
                <button className="btn btn-primary w-100 btn-lg" onClick={() => navigate("/checkout")}>
                  <i className="fa fa-lock me-2" />
                  Proceed to Checkout
                </button>
                <div className="text-center mt-3">
                  <Link to="/products" className="btn btn-ghost btn-sm">
                    <i className="fa fa-arrow-left me-2" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 96 }} />
    </div>
  );
}