import { Link } from "react-router-dom";
import { toMedia } from "../../utils/media";

export default function VendorCard({ vendor }) {
  const name = vendor?.shop_name || vendor?.name || "Vendor";
  const id = vendor?.id;
  const logo = toMedia(vendor?.logo);
  const rating = vendor?.rating_avg ?? vendor?.rating ?? 0;
  const productCount = vendor?.product_count || vendor?.products_count || 0;
  const isVerified = vendor?.is_verified || vendor?.verified;
  const sales = vendor?.sales_count || 0;

  const vendorPath = `/vendors/${id}`;

  return (
    <Link to={vendorPath} className="text-decoration-none">
      <style>{`
        /* ===== Vendor Card – Minimal (no banner), theme-aware ===== */
        .vcard {
          background:#0b0614; color:#e7e6ea;
          border:1px solid #1f1932; border-radius:12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
          transition: transform .16s ease, border-color .16s ease, background .16s ease;
          overflow:hidden;
        }
        .vcard:hover { transform: translateY(-4px); border-color:#2b2444; }

        .vlogo-wrap { display:flex; align-items:center; justify-content:center; padding: 16px 16px 8px; }
        .vlogo {
          width:76px; height:76px; border-radius:999px; object-fit:cover;
          border:3px solid #0b0614; background:#100a1f;
          box-shadow:0 6px 18px rgba(0,0,0,.35); transition: border-color .16s ease, background .16s ease;
        }
        .vname { color:#fff; font-weight:800; text-align:center; margin: 6px 12px 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition: color .16s ease; }

        .chips { display:flex; justify-content:center; gap:.4rem; margin: 6px 0 8px; flex-wrap: wrap; }
        .chip {
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.25rem .5rem; border-radius:999px; font-size:12px;
          border:1px solid #2b2444; background:#100a1f; color:#e7e6ea;
          transition: background .15s ease, border-color .15s ease, color .15s ease;
        }
        .verified { color:#31d67a; }

        .vaction { padding: 10px 12px 14px; }
        .visit {
          width:100%; border:1px solid #2b2444; background:#100a1f; color:#e7e6ea;
          padding:.5rem .7rem; border-radius:10px; font-weight:800; text-align:center;
          transition: background .15s ease, border-color .15s ease, color .15s ease;
        }
        .visit:hover { background:#16102a; border-color:#3b315e; }

        /* ===== Light theme overrides – catch any ancestor ===== */
        :where([data-theme="light"]) .vcard {
          background:#ffffff; color:#222; border-color:#e7e7ef; box-shadow:0 8px 18px rgba(0,0,0,.06);
        }
        :where([data-theme="light"]) .vname { color:#111; }
        :where([data-theme="light"]) .vlogo { border-color:#ffffff; background:#ffffff; }
        :where([data-theme="light"]) .chip { background:#ffffff; border-color:#e5e5f0; color:#333; }
        :where([data-theme="light"]) .visit { background:#ffffff; color:#222; border-color:#e5e5f0; }
        :where([data-theme="light"]) .visit:hover { background:#f7f7fb; border-color:#dfe0ea; }
      `}</style>

      <div className="vcard h-100">
        {/* Logo only (no banner) */}
        <div className="vlogo-wrap">
          {logo ? (
            <img src={logo} alt={name} className="vlogo" />
          ) : (
            <div className="vlogo d-inline-flex align-items-center justify-content-center">
              <i className="fas fa-store text-muted"></i>
            </div>
          )}
        </div>

        <div className="vname" title={name}>{name}</div>

        <div className="chips">
          {isVerified && (
            <span className="chip" title="Verified vendor">
              <i className="fas fa-check-circle verified" />
              Verified
            </span>
          )}
          {rating > 0 ? (
            <span className="chip" title="Rating">
              <i className="fas fa-star text-warning" />
              {Number(rating).toFixed(1)}
            </span>
          ) : (
            <span className="chip" title="New Seller">New</span>
          )}
          <span className="chip" title="Products">
            <i className="fas fa-box" />
            {productCount}
          </span>
          <span className="chip" title="Sales">
            <i className="fas fa-bag-shopping" />
            {sales}
          </span>
        </div>

        <div className="vaction">
          <div className="visit">Visit Store</div>
        </div>
      </div>
    </Link>
  );
}