// src/components/marketplace/VendorCard.jsx
import { Link } from "react-router-dom";
import { toMedia } from "../../utils/media";

export default function VendorCard({ vendor }) {
  const name = vendor?.shop_name || vendor?.name || "Vendor";
  const id = vendor?.id;
  const logo = toMedia(vendor?.logo);
  const banner = toMedia(vendor?.banner);
  const rating = vendor?.rating_avg ?? vendor?.rating ?? 0;
  const productCount = vendor?.product_count || vendor?.products_count || 0;
  const isVerified = vendor?.is_verified || vendor?.verified;
  const sales = vendor?.sales_count || 0;

  const vendorPath = `/vendors/${id}`;

  return (
    <Link to={vendorPath} className="text-decoration-none">
      <style>{`
        .vcard {
          background:#0b0614; border:1px solid #1f1932; border-radius:14px; overflow:hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
          transition: transform .16s ease, border-color .16s ease;
          color:#e7e6ea;
        }
        .vcard:hover { transform: translateY(-3px); border-color:#2b2444; }
        .vcard-banner { height:110px; background:#0f0a1d; }
        .vcard-logo {
          width:76px; height:76px; border-radius:999px; object-fit:cover;
          border:3px solid #0b0614; box-shadow:0 6px 18px rgba(0,0,0,.35);
          background:#100a1f;
        }
        .vcard-name { color:#fff; font-weight:800; }
        .vcard-chip {
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.25rem .5rem; border-radius:999px; font-size:12px;
          border:1px solid #2b2444; background:#100a1f; color:#e7e6ea;
        }
        .vcard-verified {
          color:#31d67a;
        }
        .vcard-stat { color:#bfb9cf; font-size:12px; }
        .vcard-btn {
          border:1px solid #2b2444; background:#100a1f; color:#e7e6ea;
          padding:.45rem .7rem; border-radius:10px; width:100%;
          transition:all .15s ease; font-weight:700;
        }
        .vcard-btn:hover { background:#16102a; border-color:#3b315e; }
      `}</style>

      <div className="vcard h-100">
        {/* Banner */}
        <div className="position-relative vcard-banner">
          {banner ? (
            <img src={banner} alt={`${name} banner`} className="w-100 h-100 object-fit-cover" />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
              <i className="fas fa-store fa-lg opacity-50"></i>
            </div>
          )}
          {isVerified && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="vcard-chip vcard-verified">
                <i className="fas fa-check-circle" /> Verified
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3">
          <div className="text-center" style={{ marginTop: "-52px", marginBottom: "8px" }}>
            {logo ? (
              <img src={logo} alt={name} className="vcard-logo" />
            ) : (
              <div className="vcard-logo d-inline-flex align-items-center justify-content-center">
                <i className="fas fa-store text-muted"></i>
              </div>
            )}
          </div>

          <h6 className="vcard-name text-center mb-1 text-truncate">{name}</h6>

          <div className="d-flex justify-content-center gap-2 mb-2">
            {rating > 0 ? (
              <span className="vcard-chip">
                <i className="fas fa-star text-warning" />
                {Number(rating).toFixed(1)}
              </span>
            ) : (
              <span className="vcard-chip">New seller</span>
            )}
            <span className="vcard-chip">
              <i className="fas fa-box" />
              {productCount}
            </span>
          </div>

          <div className="text-center vcard-stat mb-3">
            {sales} sale{sales === 1 ? "" : "s"}
          </div>

          <button className="vcard-btn">
            Visit Store
          </button>
        </div>
      </div>
    </Link>
  );
}