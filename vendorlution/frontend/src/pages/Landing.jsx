// src/pages/Landing.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import ProductGrid from "../components/marketplace/ProductGrid";
import VendorCard from "../components/marketplace/VendorCard";

export default function Landing() {
  const navigate = useNavigate();

  // Vendors
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [errorVendors, setErrorVendors] = useState("");

  // Categories
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [errorCats, setErrorCats] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadFeatured() {
      try {
        setLoadingVendors(true);
        let res;
        try {
          res = await api.get(API_ENDPOINTS.vendors.featured);
        } catch {
          res = await api.get(API_ENDPOINTS.vendors.list);
        }
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setVendors(data.filter((v) => v.is_active !== false));
        setErrorVendors("");
      } catch (err) {
        if (!alive) return;
        setErrorVendors(err?.message || "Failed to load vendors.");
      } finally {
        if (!alive) return;
        setLoadingVendors(false);
      }
    }

    async function loadCategories() {
      try {
        setLoadingCats(true);
        const res = await api.get(API_ENDPOINTS.categories?.all || API_ENDPOINTS.categories);
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setCategories(data);
        setErrorCats("");
      } catch (err) {
        if (!alive) return;
        setErrorCats(err?.message || "Failed to load categories.");
      } finally {
        if (!alive) return;
        setLoadingCats(false);
      }
    }

    loadFeatured();
    loadCategories();
    return () => { alive = false; };
  }, []);

  return (
    <div className="landing-theme">
      <style>{`
        /* ================= THEME TOKENS (Dock style) ================= */
        .landing-theme {
          --bg: #0b0614;
          --bg-soft: #100a1f;
          --panel: #0b0614;
          --panel-border: #1f1932;
          --text: #e7e6ea;
          --text-muted: #bfb9cf;
          --accent: #0d6efd;
          --accent-2: #6f42c1;
          --glass: rgba(6,0,16,.85);
          --shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
          --chip-bg: rgba(255,255,255,.06);
          --btn-outline-border: #2b2444;
          --btn-outline-hover: #16102a;
        }
        /* Honor global theme (data-theme="light" or .light anywhere up the tree) */
        :where([data-theme="light"], html[data-theme="light"], body[data-theme="light"], html.light, body.light, .light) .landing-theme {
          --bg: #f5f7fb;
          --bg-soft: #ffffff;
          --panel: #ffffff;
          --panel-border: #e6e8f1;
          --text: #16161a;
          --text-muted: #6b6f7d;
          --accent: #0b5ed7;
          --accent-2: #6f42c1;
          --glass: rgba(255,255,255,.92);
          --shadow: 0 10px 24px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6);
          --chip-bg: rgba(0,0,0,.04);
          --btn-outline-border: #dfe3ef;
          --btn-outline-hover: #f3f5fb;
        }

        /* Page surface */
        .landing-theme { background: var(--bg); color: var(--text); }
        .container { padding-top: 1rem; }

        /* ================= HERO ================= */
        .hero {
          position: relative; overflow: hidden; border-radius: 16px;
          border: 1px solid var(--panel-border);
          background:
            radial-gradient(1200px 400px at 10% 10%, color-mix(in oklab, var(--accent-2) 35%, transparent), transparent 55%),
            radial-gradient(800px 300px at 90% 0%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 50%),
            linear-gradient(180deg, var(--bg-soft) 0%, var(--bg) 70%, var(--bg) 100%);
          box-shadow: var(--shadow);
        }
        .hero-inner { padding: clamp(1.25rem, 2.5vw, 2rem); }
        .hero h1 { color: var(--text); letter-spacing:.2px; }
        .hero p { color: var(--text-muted); }
        .hero-badge {
          display:inline-flex; align-items:center; gap:.5rem;
          padding:.5rem .75rem; border-radius:999px;
          border:1px solid var(--panel-border);
          background: var(--glass);
          color: var(--text);
          backdrop-filter: blur(6px);
        }
        .hero-card {
          height: 220px; border-radius: 12px; border: 1px solid var(--panel-border);
          background: linear-gradient(180deg, color-mix(in oklab, var(--accent-2) 8%, var(--bg-soft)), var(--bg));
          display:flex; align-items:center; justify-content:center;
          color: var(--text-muted);
        }

        /* ================= SECTIONS ================= */
        .section {
          border: 1px solid var(--panel-border); border-radius: 14px;
          background: var(--panel);
          box-shadow: var(--shadow);
        }
        .section-hd {
          display:flex; align-items:center; justify-content:space-between;
          padding:.85rem 1rem; border-bottom:1px solid var(--panel-border);
          color: var(--text);
        }
        .section-body { padding: 1rem; }

        /* Buttons that should adapt in both themes */
        .btn-outline-light {
          --bs-btn-color: var(--text);
          --bs-btn-border-color: var(--btn-outline-border);
          --bs-btn-hover-bg: var(--btn-outline-hover);
          --bs-btn-hover-color: var(--text);
          --bs-btn-hover-border-color: var(--btn-outline-border);
          --bs-btn-active-bg: var(--btn-outline-hover);
          --bs-btn-active-border-color: var(--btn-outline-border);
        }

        /* ================= CATEGORY GRID ================= */
        .cat-grid { display:grid; gap:.75rem; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 576px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 992px) { .cat-grid { grid-template-columns: repeat(6, 1fr); } }

        .cat-tile {
          display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-end;
          min-height:110px; padding:.85rem; border-radius:12px;
          border:1px solid var(--panel-border);
          background: linear-gradient(160deg, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%), var(--bg-soft);
          color: var(--text);
          transition: transform .15s ease, border-color .15s ease, background .15s ease;
          cursor:pointer; text-decoration:none;
        }
        .cat-tile:hover { transform: translateY(-2px); border-color: color-mix(in oklab, var(--accent) 40%, var(--panel-border)); }

        .cat-icon {
          width:36px; height:36px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          background: var(--chip-bg);
          border: 1px solid var(--panel-border);
          margin-bottom:.5rem; color: var(--text);
        }
        .cat-name { font-weight: 800; line-height: 1.1; }
        .cat-count { font-size:12px; color: var(--text-muted); }

        /* Ghost button used in hero (adapts) */
        .btn-light-ghost {
          color: var(--text);
          border: 1px solid var(--btn-outline-border);
          background: transparent;
        }
        .btn-light-ghost:hover { background: var(--btn-outline-hover); }
      `}</style>

      <div className="container">
        {/* HERO */}
        <div className="hero mb-4 position-relative">
          <div className="hero-inner">
            <div className="row align-items-center g-3">
              <div className="col-lg-7">
                <div className="hero-badge mb-3">
                  <i className="fa fa-shield-halved text-primary" />
                  Buyer Protection • Escrow Included
                </div>
                <h1 className="display-6 fw-bold mb-2">Shop safer with escrow protection</h1>
                <p className="mb-3">
                  Pay securely via wallet or Ozow (Instant EFT). Funds are held in escrow until you confirm delivery.
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  <Link to="/products" className="btn btn-primary btn-lg">
                    <i className="fa fa-store me-2" /> Browse Products
                  </Link>
                  <Link to="/vendors" className="btn btn-light-ghost btn-lg">
                    <i className="fa fa-store-front me-2" /> Explore Vendors
                  </Link>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="hero-card">
                  <div className="text-center">
                    <i className="fa fa-lock fa-2x mb-2 text-primary" />
                    <div className="small">Secure payments, dispute help, & tracked delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP CATEGORIES */}
        <div className="section mb-4">
          <div className="section-hd">
            <h5 className="mb-0 fw-bold">Top Categories</h5>
            <Link to="/categories" className="btn btn-outline-light btn-sm">
              View all <i className="fa fa-arrow-right ms-1" />
            </Link>
          </div>
          <div className="section-body">
            {loadingCats ? (
              <LoadingSpinner />
            ) : errorCats ? (
              <EmptyState title="Couldn't load categories" subtitle={errorCats} icon="fa-tags" />
            ) : categories.length === 0 ? (
              <EmptyState title="No categories yet" subtitle="New categories will appear here." icon="fa-tags" />
            ) : (
              <div className="cat-grid">
                {categories.slice(0, 12).map((cat) => (
                  <button
                    key={cat.id}
                    className="cat-tile text-start"
                    onClick={() => navigate(`/products?category=${cat.id}`)}
                  >
                    <div className="cat-icon">
                      <i className="fa fa-tag" />
                    </div>
                    <div className="cat-name">{cat.title || cat.name}</div>
                    {typeof cat.product_count === "number" && (
                      <div className="cat-count">
                        {cat.product_count} item{cat.product_count === 1 ? "" : "s"}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NEW ARRIVALS */}
        <div className="section mb-4">
          <div className="section-hd">
            <h5 className="mb-0 fw-bold">New Arrivals</h5>
            <Link to="/products?sort=-created_at" className="btn btn-outline-light btn-sm">
              View all <i className="fa fa-arrow-right ms-1" />
            </Link>
          </div>
          <div className="section-body">
            <ProductGrid
              endpoint={API_ENDPOINTS.products.list}
              params={{ ordering: "-created_at", page_size: 8 }}
              emptyMessage="No new products available yet."
            />
          </div>
        </div>

        {/* POPULAR */}
        <div className="section mb-4">
          <div className="section-hd">
            <h5 className="mb-0 fw-bold">Popular Right Now</h5>
            <Link to="/products" className="btn btn-outline-light btn-sm">
              View all <i className="fa fa-arrow-right ms-1" />
            </Link>
          </div>
          <div className="section-body">
            <ProductGrid
              endpoint={API_ENDPOINTS.products.list}
              params={{ ordering: "-rating_avg", page_size: 8 }}
              emptyMessage="No popular products to show."
            />
          </div>
        </div>

        {/* FEATURED VENDORS */}
        <div className="section">
          <div className="section-hd">
            <h5 className="mb-0 fw-bold">Featured Vendors</h5>
            <Link to="/vendors" className="btn btn-outline-light btn-sm">
              See more <i className="fa fa-arrow-right ms-1" />
            </Link>
          </div>
          <div className="section-body">
            {loadingVendors ? (
              <LoadingSpinner />
            ) : errorVendors ? (
              <EmptyState title="Couldn't load vendors" subtitle={errorVendors} icon="fa-store-slash" />
            ) : vendors.length === 0 ? (
              <EmptyState
                title="No vendors yet"
                subtitle="Be the first to create a shop!"
                icon="fa-store-slash"
                action={
                  <Link to="/vendor/create-shop" className="btn btn-primary mt-3">
                    <i className="fa fa-plus me-2" />
                    Create Your Shop
                  </Link>
                }
              />
            ) : (
              <div className="row g-3">
                {vendors.slice(0, 8).map((vendor) => (
                  <div className="col-6 col-md-4 col-lg-3" key={vendor.id}>
                    <VendorCard vendor={vendor} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* bottom spacing so content doesn't hit the dock */}
        <div style={{ height: 96 }} />
      </div>
    </div>
  );
}