// src/pages/VendorStore.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import API_ENDPOINTS from "../api/endpoints"; // <-- make import consistent
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductCard from "../components/marketplace/ProductCard";
import { toMedia } from "../utils/media";

export default function VendorStore() {
  const { id: idFromUrl } = useParams();
  const id = String(idFromUrl || ""); // normalize to string for comparisons
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  // Helper: robust vendor id extraction from a product object
  const belongsToVendor = useMemo(() => {
    return (p) => {
      // cover various shapes: {vendor: 10}, {vendor_id: 10}, {vendor: {id: 10}}, {seller: {id: 10}}, etc.
      const candidates = [
        p?.vendor,
        p?.vendor_id,
        p?.seller_id,
        p?.seller,
        p?.store_id,
        p?.store,
        p?.vendor?.id,
        p?.seller?.id,
        p?.store?.id,
      ].filter((v) => v !== undefined && v !== null);
      return candidates.map(String).includes(id);
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadVendorStore() {
      setLoading(true);

      try {
        // 1) Load vendor details
        const vendorRes = await api.get(API_ENDPOINTS.vendors.detail(id));
        if (cancelled) return;
        setVendor(vendorRes.data);

        // 2) Load vendor products
        let productsData = [];

        // 2a) Prefer a vendor-scoped endpoint if your API exposes it
        // Provide an optional endpoint in endpoints.js like vendors.products = (id) => `/api/vendors/${id}/products/`
        if (API_ENDPOINTS?.vendors?.products) {
          try {
            const vendorProductsRes = await api.get(
              API_ENDPOINTS.vendors.products(id),
              { params: { page_size: 48 } }
            );
            const raw =
              Array.isArray(vendorProductsRes.data)
                ? vendorProductsRes.data
                : vendorProductsRes.data?.results || [];
            productsData = raw;
          } catch {
            // fall through to query-params approach
          }
        }

        // 2b) If that failed or doesn't exist, try common param names
        if (!productsData.length) {
          // Try multiple queries until one returns results
          const paramAttempts = [
            { vendor: id },
            { vendor_id: id },
            { seller: id },
            { seller_id: id },
            { store: id },
            { store_id: id },
          ];

          for (const params of paramAttempts) {
            try {
              const res = await api.get(API_ENDPOINTS.products.list, {
                params: { ...params, page_size: 48 },
              });
              const raw =
                Array.isArray(res.data) ? res.data : res.data?.results || [];
              if (raw.length) {
                productsData = raw;
                break;
              } else {
                // still store for possible final filtering
                if (!productsData.length) productsData = raw;
              }
            } catch {
              // continue to next attempt
            }
          }
        }

        // 2c) Final safety net: client-side filter
        // If backend ignored our filter, ensure only this vendor's items remain.
        if (productsData?.length) {
          productsData = productsData.filter(belongsToVendor);
        }

        if (cancelled) return;
        setProducts(productsData || []);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load vendor store:", error);
          addNotification("Failed to load vendor store", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) loadVendorStore();

    return () => {
      cancelled = true;
    };
  }, [id, addNotification, belongsToVendor]);

  const handleStartChat = () => {
    if (!isAuthenticated) {
      nav("/login", { state: { from: { pathname: `/vendors/${id}` } } });
      return;
    }
    nav(`/chat/vendor/${id}`);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner fullPage message="Loading store..." />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container py-5">
        <EmptyState
          title="Store Not Found"
          subtitle="This vendor store doesn't exist or has been removed."
          icon="fa-store-slash"
        />
      </div>
    );
  }

  const banner = toMedia(vendor.banner);
  const logo = toMedia(vendor.logo);
  const name = vendor.shop_name || vendor.name || vendor.username || "Store";
  const description = vendor.description || "";
  const rating = vendor.rating_avg || 0;
  const reviewCount = vendor.review_count || 0;
  const isVerified = vendor.is_verified || vendor.verified;

  return (
    <div className="vendor-store-page">
      {/* Banner Section */}
      <div className="position-relative" style={{ height: "300px" }}>
        {banner ? (
          <>
            <img
              src={banner}
              alt={`${name} banner`}
              className="w-100 h-100 object-fit-cover"
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
              }}
            ></div>
          </>
        ) : (
          <div
            className="w-100 h-100"
            style={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          ></div>
        )}

        {/* Vendor Info Overlay */}
        <div className="position-absolute bottom-0 start-0 w-100 p-4">
          <div className="container">
            <div className="row align-items-end">
              <div className="col-auto">
                {logo ? (
                  <img
                    src={logo}
                    alt={name}
                    className="rounded-circle border border-4 border-white shadow"
                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-white border border-4 border-white shadow d-flex align-items-center justify-content-center"
                    style={{ width: "120px", height: "120px" }}
                  >
                    <i className="fas fa-store fa-3x text-primary"></i>
                  </div>
                )}
              </div>
              <div className="col text-white">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h1 className="h2 fw-bold mb-0">{name}</h1>
                  {isVerified && (
                    <span className="badge bg-success">
                      <i className="fas fa-check-circle me-1"></i>
                      Verified
                    </span>
                  )}
                </div>

                {rating > 0 && (
                  <div className="mb-2">
                    <i className="fas fa-star text-warning me-1"></i>
                    <span className="fw-semibold">{rating.toFixed(1)}</span>
                    <span className="ms-2 opacity-75">({reviewCount} reviews)</span>
                  </div>
                )}

                {vendor.address && (
                  <div className="opacity-75">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {vendor.address}
                  </div>
                )}
              </div>
              <div className="col-auto">
                <button className="btn btn-light btn-lg" onClick={handleStartChat}>
                  <i className="fas fa-comments me-2"></i>
                  Chat with Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div className="container py-4">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <i className="fas fa-grid-2 me-2"></i>
              Products ({products.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <i className="fas fa-info-circle me-2"></i>
              About
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              <i className="fas fa-star me-2"></i>
              Reviews ({reviewCount})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === "products" && (
          <div>
            {products.length === 0 ? (
              <EmptyState
                title="No Products Yet"
                subtitle="This vendor hasn't added any products yet, or filtering failed."
                icon="fa-box-open"
              />
            ) : (
              <div className="row g-3">
                {products.map((product) => (
                  <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="row">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">About {name}</h4>
                  {description ? (
                    <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                      {description}
                    </p>
                  ) : (
                    <p className="text-muted">No description available.</p>
                  )}

                  <hr className="my-4" />

                  <h5 className="fw-semibold mb-3">Store Information</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <i className="fas fa-calendar-alt text-primary mt-1"></i>
                        <div>
                          <div className="small text-muted">Member Since</div>
                          <div className="fw-semibold">
                            {vendor.created_at
                              ? new Date(vendor.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <i className="fas fa-box text-primary mt-1"></i>
                        <div>
                          <div className="small text-muted">Total Products</div>
                          <div className="fw-semibold">{products.length}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <i className="fas fa-star text-warning mt-1"></i>
                        <div>
                          <div className="small text-muted">Store Rating</div>
                          <div className="fw-semibold">{rating.toFixed(1)} / 5.0</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <i className="fas fa-shopping-bag text-success mt-1"></i>
                        <div>
                          <div className="small text-muted">Total Sales</div>
                          <div className="fw-semibold">{vendor.sales_count || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-semibold mb-3">Contact Vendor</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-dark" onClick={handleStartChat}>
                      <i className="fas fa-comments me-2"></i>
                      Start Chat
                    </button>
                    <button className="btn btn-outline-dark">
                      <i className="fas fa-envelope me-2"></i>
                      Send Email
                    </button>
                  </div>

                  <hr className="my-3" />

                  <h6 className="fw-semibold mb-2">Store Policies</h6>
                  <ul className="list-unstyled small text-muted">
                    <li className="mb-2">
                      <i className="fas fa-shield-alt text-success me-2"></i>
                      Buyer Protection Included
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-truck text-primary me-2"></i>
                      Fast Shipping Available
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-undo text-info me-2"></i>
                      30-Day Return Policy
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4">Customer Reviews</h4>
              <EmptyState
                title="No Reviews Yet"
                subtitle="This vendor hasn't received any reviews yet."
                icon="fa-star"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}