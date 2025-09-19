import { Link } from 'react-router-dom';

function VendorSidebar(){
  return (
    <div className="list-group">
      <Link to="/vendor/dashboard" className="list-group-item list-group-item-action active bg-dark" aria-current="true">
        <i className="fa fa-home me-2"></i> Dashboard
      </Link>

      <Link to="/vendor/products" className="list-group-item list-group-item-action">
        <i className="fa fa-cubes me-2"></i> Products
      </Link>
      <Link to="/vendor/add-product" className="list-group-item list-group-item-action">
        <i className="fa fa-plus me-2"></i> Add Product
      </Link>
      <Link to="/vendor/orders" className="list-group-item list-group-item-action">
        <i className="fa fa-receipt me-2"></i> Orders
      </Link>
      <Link to="/vendor/customers" className="list-group-item list-group-item-action">
        <i className="fa fa-users me-2"></i> Customers
      </Link>

      <Link to="/vendor/inbox" className="list-group-item list-group-item-action">
        <i className="fa fa-envelope me-2"></i> Messages
      </Link>
      <Link to="/vendor/wallet" className="list-group-item list-group-item-action">
        <i className="fa fa-wallet me-2"></i> Wallet
      </Link>
      <Link to="/vendor/payouts" className="list-group-item list-group-item-action">
        <i className="fa fa-credit-card me-2"></i> Payouts
      </Link>

      <Link to="/vendor/reports" className="list-group-item list-group-item-action">
        <i className="fa fa-bar-chart me-2"></i> Reports
      </Link>
      <Link to="/vendor/reviews" className="list-group-item list-group-item-action">
        <i className="fa fa-star me-2"></i> Reviews
      </Link>
      <Link to="/vendor/discounts" className="list-group-item list-group-item-action">
        <i className="fa fa-tags me-2"></i> Discounts
      </Link>
      <Link to="/vendor/help" className="list-group-item list-group-item-action">
        <i className="fa fa-life-ring me-2"></i> Help
      </Link>

      <Link to="/vendor/profile" className="list-group-item list-group-item-action">
        <i className="fa fa-user me-2"></i> Profile
      </Link>
      <Link to="/vendor/change-password" className="list-group-item list-group-item-action">
        <i className="fa fa-key me-2"></i> Change Password
      </Link>

      <Link to="/vendor/logout" className="list-group-item list-group-item-action text-danger">
        <i className="fa fa-sign-out me-2"></i> Logout
      </Link>
    </div>
  );
}

export default VendorSidebar;
