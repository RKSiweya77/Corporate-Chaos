// src/components/vendor/VendorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

export default function VendorDashboard() {
  const { user, vendorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    wallet: { balance: 0, pending: 0 },
    productsCount: 0,
    orders: [],
    vendor: null
  });

  const stats = useMemo(() => {
    const orders = dashboardData.orders || [];
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order =>
      ["pending", "confirmed", "processing"].includes((order.status || "").toLowerCase())
    ).length;
    const completedOrders = orders.filter(order =>
      ["delivered", "completed"].includes((order.status || "").toLowerCase())
    );
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + Number(order.total || order.grand_total || 0),
      0
    );
    return { totalOrders, pendingOrders, completedOrders: completedOrders.length, totalRevenue };
  }, [dashboardData.orders]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentVendorId = vendorId || user?.vendor_id;
        if (!currentVendorId) {
          setError("No vendor profile found. Please create a shop first.");
          setLoading(false);
          return;
        }

        const results = await Promise.allSettled([
          api.get(API_ENDPOINTS.wallet.me).catch(() => ({ data: { balance: 0, pending: 0 } })),
          api.get(API_ENDPOINTS.vendorProducts.list).catch(() => ({ data: [] })),
          api.get(API_ENDPOINTS.orders.vendorOrders).catch(() => ({ data: [] })),
          api.get(API_ENDPOINTS.vendors.detail(currentVendorId)).catch(() => ({ data: null }))
        ]);

        const [walletRes, productsRes, ordersRes, vendorRes] = results.map(r =>
          r.status === "fulfilled" ? r.value : { data: null }
        );

        const productsData = productsRes.data?.results || productsRes.data || [];
        const ordersData = ordersRes.data?.results || ordersRes.data || [];

        setDashboardData({
          wallet: {
            balance: Number(walletRes?.data?.balance || 0),
            pending: Number(walletRes?.data?.pending || 0)
          },
          productsCount: Array.isArray(productsData) ? productsData.length : productsRes?.data?.count || 0,
          orders: ordersData,
          vendor: vendorRes?.data
        });
      } catch (err) {
        setError("Failed to load dashboard. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, vendorId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="vd-panel p-3">
          <div className="alert alert-danger m-0">
            <h4 className="alert-heading">Error Loading Dashboard</h4>
            <p>{error}</p>
            <hr />
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Refresh Page
              </button>
              <Link to="/vendor/create-shop" className="btn btn-ghost">
                Create Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 vd-wrap">
      <style>{`
        /* Dock theme tokens come from GlobalThemeStyles, we just consume them */
        .vd-wrap { color: var(--text-0); }

        /* Panels */
        .vd-panel {
          border: 1px solid var(--border-0);
          border-radius: 14px;
          background: var(--surface-1);
          box-shadow: 0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .vd-subtle {
          color: var(--text-1);
        }
        .vd-header {
          border-bottom: 1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
          padding: .85rem 1rem;
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
        }
        .vd-header-actions { display:flex; gap:.5rem; flex-wrap: wrap; }

        /* Ghost / Solid buttons that track theme */
        .btn-ghost {
          border: 1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
          border-radius: 10px;
        }
        .btn-ghost:hover { background: color-mix(in oklab, var(--primary-500) 10%, var(--surface-1)); }
        .btn-solid {
          background: var(--primary-500);
          color: #fff;
          border: 1px solid color-mix(in oklab, var(--primary-500) 70%, #000);
          border-radius: 10px;
        }
        .btn-solid:hover { filter: brightness(0.96); }

        /* Stat cards */
        .vd-stat {
          text-align: center;
          padding: 1.25rem;
        }
        .vd-stat .icon {
          width: 44px; height: 44px; border-radius: 12px;
          display:flex; align-items:center; justify-content:center;
          background: var(--surface-0);
          border: 1px solid var(--border-0);
          margin: 0 auto .75rem auto;
        }
        .vd-stat .value { font-weight: 800; font-size: 1.6rem; color: var(--text-0); }
        .vd-stat .label { color: var(--text-1); }

        /* Progress bars (theme aware) */
        .vd-progress {
          height: 8px;
          background: var(--surface-0);
          border: 1px solid var(--border-0);
          border-radius: 999px;
          overflow: hidden;
        }
        .vd-progress > span {
          display:block; height: 100%;
          background: var(--primary-500);
        }

        /* Lists inside panels */
        .vd-list .item {
          padding: .75rem 0;
          border-bottom: 1px solid var(--border-0);
        }
        .vd-list .item:last-child { border-bottom: none; }

        /* Section titles */
        .vd-title { color: var(--text-0); font-weight: 800; }

        /* Quick actions grid */
        .qa-btn {
          width: 100%;
          height: 100%;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
          text-align: center;
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
          display: block;
        }
        .qa-btn:hover { transform: translateY(-2px); border-color: color-mix(in oklab, var(--primary-500) 40%, var(--border-0)); }
        .qa-btn i { display:block; margin-bottom: .35rem; }

        /* Page header */
        .vd-page-title { color: var(--text-0); font-weight: 800; }
        .vd-lead { color: var(--text-1); }
      `}</style>

      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <h1 className="vd-page-title mb-2">
            Welcome back, {dashboardData.vendor?.shop_name || user?.first_name || "Vendor"}!
          </h1>
          <p className="vd-lead mb-0">Here's what's happening with your shop today.</p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="vd-header-actions">
            <Link to="/vendor/products" className="btn-ghost">
              <i className="fas fa-box me-2"></i>
              Manage Products
            </Link>
            <Link to="/vendor/orders" className="btn-solid">
              <i className="fas fa-list-check me-2"></i>
              View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="vd-panel h-100">
            <div className="vd-stat">
              <div className="icon"><i className="fas fa-box"></i></div>
              <div className="value">{dashboardData.productsCount}</div>
              <div className="label">Total Products</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="vd-panel h-100">
            <div className="vd-stat">
              <div className="icon"><i className="fas fa-shopping-bag"></i></div>
              <div className="value">{stats.totalOrders}</div>
              <div className="label">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="vd-panel h-100">
            <div className="vd-stat">
              <div className="icon"><i className="fas fa-clock"></i></div>
              <div className="value">{stats.pendingOrders}</div>
              <div className="label">Pending Orders</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="vd-panel h-100">
            <div className="vd-stat">
              <div className="icon"><i className="fas fa-chart-line"></i></div>
              <div className="value">R {stats.totalRevenue.toFixed(2)}</div>
              <div className="label">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Wallet Section */}
        <div className="col-lg-6">
          <div className="vd-panel h-100">
            <div className="vd-header">
              <h5 className="mb-0">
                <i className="fas fa-wallet me-2"></i>
                Wallet Summary
              </h5>
            </div>
            <div className="p-3">
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="vd-subtle">Available Balance</span>
                  <strong>R {dashboardData.wallet.balance.toFixed(2)}</strong>
                </div>
                <div className="vd-progress">
                  <span style={{ width: "100%" }} />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="vd-subtle">In Escrow</span>
                  <strong>R {dashboardData.wallet.pending.toFixed(2)}</strong>
                </div>
                <div className="vd-progress">
                  <span
                    style={{
                      width:
                        dashboardData.wallet.balance + dashboardData.wallet.pending > 0
                          ? `${
                              (dashboardData.wallet.pending /
                                (dashboardData.wallet.balance + dashboardData.wallet.pending)) *
                              100
                            }%`
                          : "0%"
                    }}
                  />
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex">
                <Link to="/wallet/deposit" className="btn-ghost flex-fill">
                  <i className="fas fa-arrow-down me-2"></i>
                  Deposit
                </Link>
                <Link to="/wallet/withdraw" className="btn-solid flex-fill">
                  <i className="fas fa-arrow-up me-2"></i>
                  Withdraw
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-lg-6">
          <div className="vd-panel h-100">
            <div className="vd-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-clock-rotate-left me-2"></i>
                Recent Orders
              </h5>
              <Link to="/vendor/orders" className="btn-ghost btn-sm">
                View All
              </Link>
            </div>
            <div className="p-3">
              {dashboardData.orders.length === 0 ? (
                <div className="text-center py-4 vd-subtle">
                  <i className="fas fa-inbox fa-2x mb-3"></i>
                  <p className="mb-1">No orders yet</p>
                  <small>Orders will appear here once customers purchase your products</small>
                </div>
              ) : (
                <div className="vd-list">
                  {dashboardData.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="item">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">Order #{order.id}</div>
                          <small className="vd-subtle text-capitalize">
                            {order.status} • {new Date(order.created_at || order.created).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold" style={{ color: "var(--primary-500)" }}>
                            R {Number(order.total || order.grand_total || 0).toFixed(2)}
                          </div>
                          <small className="vd-subtle">
                            {order.items_count || order.items?.length || 0} items
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4 g-3">
        <div className="col-12">
          <div className="vd-panel">
            <div className="vd-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <Link to="/vendor/products" className="qa-btn">
                    <i className="fas fa-plus-circle fa-lg"></i>
                    Add Product
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/vendor/analytics" className="qa-btn">
                    <i className="fas fa-chart-bar fa-lg"></i>
                    Analytics
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/vendor/profile" className="qa-btn">
                    <i className="fas fa-store fa-lg"></i>
                    Shop Settings
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/vendor/orders" className="qa-btn">
                    <i className="fas fa-list-check fa-lg"></i>
                    Manage Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for bottom dock */}
      <div style={{ height: 96 }} />
    </div>
  );
}