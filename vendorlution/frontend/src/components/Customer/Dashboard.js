import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Welcome back 👋</h3>

          <div className="row g-3">
            {/* Wallet */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body text-center">
                  <i className="fa fa-wallet fa-2x mb-2 text-primary"></i>
                  <h6 className="text-muted">Wallet Balance</h6>
                  <h4 className="fw-bold">R 2,350</h4>
                  <Link to="/customer/wallet" className="btn btn-sm btn-outline-primary mt-2">
                    Manage Wallet
                  </Link>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body text-center">
                  <i className="fa fa-box fa-2x mb-2 text-success"></i>
                  <h6 className="text-muted">Orders</h6>
                  <h4 className="fw-bold">3 Active</h4>
                  <Link to="/customer/orders" className="btn btn-sm btn-outline-success mt-2">
                    View Orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Wishlist */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body text-center">
                  <i className="fa fa-heart fa-2x mb-2 text-danger"></i>
                  <h6 className="text-muted">Wishlist</h6>
                  <h4 className="fw-bold">5 Items</h4>
                  <Link to="/customer/wishlist" className="btn btn-sm btn-outline-danger mt-2">
                    View Wishlist
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Row */}
          <div className="row g-3 mt-2">
            {/* Messages */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold">
                    <i className="fa fa-comments me-2 text-info"></i> Messages
                  </h6>
                  <p className="small text-muted mb-1">
                    You have <strong>2 unread</strong> messages from vendors.
                  </p>
                  <Link to="/customer/inbox" className="btn btn-sm btn-outline-info">
                    Go to Inbox
                  </Link>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold">
                    <i className="fa fa-bell me-2 text-warning"></i> Notifications
                  </h6>
                  <ul className="list-unstyled small">
                    <li>🎉 New discount on Electronics</li>
                    <li>🚚 Your order #1234 is out for delivery</li>
                  </ul>
                  <Link to="/customer/notifications" className="btn btn-sm btn-outline-warning">
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card shadow-sm border-0 mt-3">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Quick Links</h6>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/customer/profile" className="btn btn-sm btn-outline-dark">
                  <i className="fa fa-user me-1"></i> Profile
                </Link>
                <Link to="/customer/addresses" className="btn btn-sm btn-outline-dark">
                  <i className="fa fa-map-marker me-1"></i> Addresses
                </Link>
                <Link to="/customer/support" className="btn btn-sm btn-outline-dark">
                  <i className="fa fa-headset me-1"></i> Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
