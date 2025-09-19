import { useParams, Link } from "react-router-dom";
import logo from "../../logo.png";
import Sidebar from "./Sidebar";

function OrderDetail() {
  const { id } = useParams();

  // Mock order (replace with API call later)
  const order = {
    id,
    product: "Phone",
    image: logo,
    price: 500,
    status: "Completed",
    delivery: "Pargo Store-to-Store",
    tracking: "TRK123456789",
    payment: "Vendorlution Wallet",
    date: "2025-09-15",
  };

  const renderStatus = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="badge rounded-pill bg-success">
            <i className="fa fa-check-circle me-1"></i> {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="badge rounded-pill bg-danger">
            <i className="fa fa-times-circle me-1"></i> {status}
          </span>
        );
      case "Processing":
        return (
          <span className="badge rounded-pill bg-warning text-dark">
            <i className="fa fa-spinner fa-spin me-1"></i> {status}
          </span>
        );
      default:
        return (
          <span className="badge rounded-pill bg-secondary">{status}</span>
        );
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Order Details</h3>

          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body d-flex">
              <img
                src={order.image}
                alt={order.product}
                width="100"
                height="100"
                className="rounded me-3"
                style={{ objectFit: "cover" }}
              />
              <div>
                <h5 className="fw-bold">{order.product}</h5>
                <p className="mb-1">Order ID: #{order.id}</p>
                <p className="fw-semibold">R {order.price}</p>
                {renderStatus(order.status)}
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <h5 className="fw-bold mb-2">
                <i className="fa fa-truck me-2"></i> Delivery Information
              </h5>
              <p className="mb-1">Method: {order.delivery}</p>
              <p className="mb-1">Tracking No: {order.tracking}</p>
              <p className="text-muted small">
                Estimated delivery within 3–5 business days.
              </p>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <h5 className="fw-bold mb-2">
                <i className="fa fa-credit-card me-2"></i> Payment Information
              </h5>
              <p className="mb-1">Payment Method: {order.payment}</p>
              <p className="mb-1">Buyer Protection Applied</p>
              <p className="text-muted small">
                Payment was securely held and released after confirmation of
                delivery.
              </p>
            </div>
          </div>

          <div className="text-end">
            <Link to="/customer/orders" className="btn btn-outline-dark">
              <i className="fa fa-arrow-left me-1"></i> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
