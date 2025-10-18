import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";
import { toMedia } from "../../utils/media";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.wishlist.list);
      const wishlistData = response.data?.results || response.data || [];
      setWishlist(wishlistData);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      addNotification("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(API_ENDPOINTS.wishlist.remove(itemId));
      await loadWishlist();
      addNotification("Item removed from wishlist", "success");
    } catch (error) {
      console.error("Failed to remove item:", error);
      addNotification("Failed to remove item from wishlist", "error");
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post(API_ENDPOINTS.cart.addItem, {
        product_id: product.id || product.product_id,
        quantity: 1,
      });
      addNotification("Product added to cart", "success");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      const message = error?.response?.data?.detail || "Failed to add to cart";
      addNotification(message, "error");
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
          <p className="text-muted mt-3">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-dark mb-0">
          <i className="fas fa-heart me-2 text-danger"></i>
          My Wishlist
        </h1>
        <div className="text-muted">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="fas fa-heart fa-3x text-muted mb-3"></i>
            <h4 className="text-muted mb-3">Your wishlist is empty</h4>
            <p className="text-muted mb-4">Save items you love for later</p>
            <Link to="/marketplace" className="btn btn-dark btn-lg">
              <i className="fas fa-store me-2"></i>
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Wishlist Grid */}
          <div className="row g-4">
            {wishlist.map((item) => {
              const product = item.product || {};
              const title = product.title || product.name || "Product";
              const price = product.price || 0;
              const image = product.main_image || product.image;
              const productId = product.id || item.product_id;
              const slug = product.slug;
              const inStock = (product.stock_quantity || 0) > 0;

              return (
                <div className="col-6 col-md-4 col-lg-3" key={item.id}>
                  <div className="card h-100 border-0 shadow-sm">
                    {/* Product Image */}
                    <div className="position-relative">
                      {image ? (
                        <img
                          src={toMedia(image)}
                          alt={title}
                          className="card-img-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ height: '200px' }}
                        >
                          <i className="fas fa-image fa-2x text-muted"></i>
                        </div>
                      )}
                      
                      {/* Out of Stock Badge */}
                      {!inStock && (
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-danger">Out of Stock</span>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove from wishlist"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>

                    <div className="card-body d-flex flex-column">
                      {/* Product Title */}
                      <Link 
                        to={`/product/${slug || productId}`}
                        className="text-decoration-none text-dark"
                      >
                        <h6 className="card-title fw-semibold text-truncate">
                          {title}
                        </h6>
                      </Link>

                      {/* Price */}
                      <div className="fw-bold text-primary mb-3">
                        {formatCurrency(price)}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto d-flex gap-2">
                        <Link 
                          to={`/product/${slug || productId}`}
                          className="btn btn-outline-dark btn-sm flex-fill"
                        >
                          <i className="fas fa-eye me-1"></i>
                          View
                        </Link>
                        <button
                          className="btn btn-dark btn-sm flex-fill"
                          onClick={() => addToCart(product)}
                          disabled={!inStock}
                          title={!inStock ? "Out of stock" : "Add to cart"}
                        >
                          <i className="fas fa-cart-plus me-1"></i>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Vendor Info */}
                    {product.vendor && (
                      <div className="card-footer bg-transparent border-top-0 pt-0">
                        <small className="text-muted">
                          By {product.vendor.shop_name || product.vendor.name}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wishlist Actions */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <h6 className="fw-semibold mb-3">Wishlist Actions</h6>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
                          // Implement bulk remove if backend supports it
                          addNotification("Bulk remove not yet implemented", "info");
                        }
                      }}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Clear All
                    </button>
                    <Link to="/marketplace" className="btn btn-dark">
                      <i className="fas fa-plus me-2"></i>
                      Add More Items
                    </Link>
                    <Link to="/cart" className="btn btn-outline-dark">
                      <i className="fas fa-shopping-cart me-2"></i>
                      View Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-semibold mb-3">
                    <i className="fas fa-chart-bar me-2"></i>
                    Wishlist Stats
                  </h6>
                  <div className="row text-center">
                    <div className="col-md-3 col-6 mb-3">
                      <div className="text-primary fw-bold fs-4">{wishlist.length}</div>
                      <small className="text-muted">Total Items</small>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="text-success fw-bold fs-4">
                        {wishlist.filter(item => (item.product?.stock_quantity || 0) > 0).length}
                      </div>
                      <small className="text-muted">In Stock</small>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="text-warning fw-bold fs-4">
                        {wishlist.filter(item => {
                          const price = item.product?.price || 0;
                          return price > 0 && price < 100;
                        }).length}
                      </div>
                      <small className="text-muted">Under R100</small>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="text-info fw-bold fs-4">
                        {wishlist.filter(item => item.product?.vendor).length}
                      </div>
                      <small className="text-muted">From Vendors</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}