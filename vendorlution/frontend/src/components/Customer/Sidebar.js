import { Link } from 'react-router-dom';

function Sidebar(){
  return (
    <div className="list-group">
      <Link to="/customer/dashboard" className="list-group-item list-group-item-action active bg-dark" aria-current="true">
        <i className="fa fa-home me-2"></i> Dashboard
      </Link>

      <Link to="/customer/orders" className="list-group-item list-group-item-action">
        <i className="fa fa-receipt me-2"></i> Orders
      </Link>
      <Link to="/customer/wishlist" className="list-group-item list-group-item-action">
        <i className="fa fa-heart me-2"></i> Wishlist
      </Link>
      <Link to="/customer/inbox" className="list-group-item list-group-item-action">
        <i className="fa fa-envelope me-2"></i> Messages
      </Link>
      <Link to="/customer/wallet" className="list-group-item list-group-item-action">
        <i className="fa fa-money me-2"></i> Wallet
      </Link>
      <Link to="/customer/coupons" className="list-group-item list-group-item-action">
        <i className="fa fa-tags me-2"></i> Coupons
      </Link>
      <Link to="/customer/reviews" className="list-group-item list-group-item-action">
        <i className="fa fa-star me-2"></i> My Reviews
      </Link>
      <Link to="/customer/notifications" className="list-group-item list-group-item-action">
        <i className="fa fa-bell me-2"></i> Notifications
      </Link>
      <Link to="/customer/support" className="list-group-item list-group-item-action">
        <i className="fa fa-life-ring me-2"></i> Help
      </Link>

      <Link to="/customer/profile" className="list-group-item list-group-item-action">
        <i className="fa fa-user me-2"></i> Profile
      </Link>
      <Link to="/customer/change-password" className="list-group-item list-group-item-action">
        <i className="fa fa-key me-2"></i> Change Password
      </Link>
      <Link to="/customer/addresses" className="list-group-item list-group-item-action">
        <i className="fa fa-map-marker me-2"></i> Addresses
      </Link>
      <Link to="/customer/payment-methods" className="list-group-item list-group-item-action">
        <i className="fa fa-credit-card me-2"></i> Payment Methods
      </Link>
      <Link to="/customer/resolution-center" className="list-group-item list-group-item-action">
        <i className="fa fa-shield me-2"></i> Resolution Center
      </Link>

      <Link to="/customer/logout" className="list-group-item list-group-item-action text-danger">
        <i className="fa fa-sign-out me-2"></i> Logout
      </Link>
    </div>
  );
}

export default Sidebar;
