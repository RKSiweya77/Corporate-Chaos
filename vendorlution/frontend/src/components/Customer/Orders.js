//Packages
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

//Assets
import logo from "../../logo.png";
import Sidebar from "./Sidebar";

function Orders() {
  // Mock orders (replace later with API call)
  // Keep internal statuses simple; we map them to buyer-friendly labels.
  const orders = [
    { id: 1, product: "Phone",   image: logo, price: 500, status: "Completed" },
    { id: 2, product: "Speaker", image: logo, price: 500, status: "Cancelled" },
    { id: 3, product: "Earbuds", image: logo, price: 500, status: "Processing" },
    { id: 4, product: "Trouser", image: logo, price: 500, status: "Awaiting Confirmation" },
  ];

  // Buyer-centric label + badge styling
  const renderBuyerStatus = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="badge rounded-pill bg-success">
            <i className="fa fa-check-circle me-1" /> Completed — Funds Released
          </span>
        );
      case "Awaiting Confirmation":
        return (
          <span className="badge rounded-pill bg-warning text-dark">
            <i className="fa fa-hourglass-half me-1" /> Delivered — Awaiting Your Confirmation
          </span>
        );
      case "Processing":
        return (
          <span className="badge rounded-pill bg-info text-dark">
            <i className="fa fa-spinner fa-spin me-1" /> Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="badge rounded-pill bg-danger">
            <i className="fa fa-times-circle me-1" /> Cancelled
          </span>
        );
      default:
        return <span className="badge rounded-pill bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Orders Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-4">My Orders</h3>

          {orders.length > 0 ? (
            <div className="row g-3">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  className="col-12 col-md-6"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body d-flex">
                      <img
                        src={order.image}
                        alt={order.product}
                        width="70"
                        height="70"
                        className="rounded me-3"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{order.product}</h6>
                        <p className="mb-1 text-muted small">Order ID: #{order.id}</p>
                        <p className="mb-2 fw-semibold">R {order.price}</p>
                        {renderBuyerStatus(order.status)}
                      </div>
                    </div>
                    <div className="card-footer bg-light d-flex justify-content-end">
                      <Link
                        to={`/customer/orders/${order.id}`}
                        className="btn btn-sm btn-outline-dark"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted">
              <i className="fa fa-box-open fa-2x mb-2" />
              <p>No orders found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
