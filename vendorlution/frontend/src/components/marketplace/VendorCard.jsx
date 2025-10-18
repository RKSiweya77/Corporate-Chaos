import { Link } from "react-router-dom";
import { toMedia } from "../../utils/media";

export default function VendorCard({ vendor }) {
  const name = vendor?.shop_name || vendor?.name || "Vendor";
  const slug = vendor?.slug;
  const id = vendor?.id;
  const logo = toMedia(vendor?.logo);
  const banner = toMedia(vendor?.banner);
  const description = vendor?.description;
  const city = vendor?.city;
  const rating = vendor?.rating_avg ?? vendor?.rating;
  const productCount = vendor?.product_count;

  const vendorPath = slug && id
    ? `/vendor/store/${slug}/${id}`
    : id ? `/vendor/store/${id}` : "#";

  return (
    <div className="card h-100 shadow-sm border-0 vendor-card">
      {/* Banner Image */}
      {banner ? (
        <Link to={vendorPath} className="ratio ratio-21x9">
          <img 
            src={banner} 
            alt={`${name} banner`} 
            className="card-img-top object-fit-cover"
            style={{ borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
          />
        </Link>
      ) : (
        <div className="bg-light ratio ratio-21x9">
          <div className="d-flex align-items-center justify-content-center text-muted">
            <i className="fas fa-store fa-2x"></i>
          </div>
        </div>
      )}

      <div className="card-body">
        {/* Vendor Info */}
        <div className="d-flex align-items-start mb-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="rounded border"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="rounded bg-light d-flex align-items-center justify-content-center border"
                style={{ width: '50px', height: '50px' }}
              >
                <i className="fas fa-store text-muted"></i>
              </div>
            )}
          </div>

          {/* Vendor Details */}
          <div className="flex-grow-1 ms-3">
            <Link to={vendorPath} className="text-decoration-none text-dark">
              <h6 className="fw-bold mb-1 text-truncate">{name}</h6>
            </Link>
            
            {city && (
              <div className="small text-muted mb-1">
                <i className="fas fa-map-marker-alt me-1"></i>
                {city}
              </div>
            )}

            {/* Rating */}
            {rating && (
              <div className="small text-warning">
                ⭐ {Number(rating).toFixed(1)}
                <span className="text-muted ms-1">({vendor?.review_count || 0})</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="small text-muted mb-3 line-clamp-2">
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description
            }
          </p>
        )}

        {/* Stats */}
        <div className="d-flex justify-content-between align-items-center text-center">
          <div className="stat">
            <div className="h6 mb-0 text-primary">{productCount || 0}</div>
            <small className="text-muted">Products</small>
          </div>
          
          <div className="stat">
            <div className="h6 mb-0 text-primary">{vendor?.sales_count || 0}</div>
            <small className="text-muted">Sales</small>
          </div>
          
          <div className="stat">
            <div className="h6 mb-0 text-primary">
              {vendor?.is_verified ? 'Verified' : '--'}
            </div>
            <small className="text-muted">Status</small>
          </div>
        </div>

        {/* View Store Button */}
        <div className="d-grid mt-3">
          <Link to={vendorPath} className="btn btn-outline-dark btn-sm">
            View Store
          </Link>
        </div>
      </div>
    </div>
  );
}