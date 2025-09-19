//Packages
import { motion } from "framer-motion";

//Assets
import logo from "../../logo.png";
import VendorSidebar from "./VendorSidebar";

function VendorOrders() {
  // Mock vendor orders (replace later with API call)
  const orders = [
    { id: 1, product: "Phone", image: logo, price: 500, status: "Paid" },
    { id: 2, product: "Speaker", image: logo, price: 500, status: "Cancelled" },
    { id: 3, product: "Earbuds", image: logo, price: 500, status: "Awaiting Buyer Confirmation" },
    { id: 4, product: "Trouser", image: logo, price: 500, status: "Processing" },
  ];

  const renderVendorStatus = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="badge rounded-pill bg-success">
            <i className="fa fa-check-circle me-1" /> Paid — Funds Released
          </span>
        );
      case "Awaiting Buyer Confirmation":
        return (
          <span className="badge rounded-pill bg-warning text-dark">
            <i className="fa fa-hourglass-half me-1" /> Awaiting Buyer Confirmation
          </span>
        );
      case "Processing":
        return (
          <span className="badge rounded-pill bg-info text-dark">
            <i className="fa fa-cogs me-1" /> Processing
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
          <VendorSidebar />
        </div>

        {/* Vendor Orders Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-4">Customer Orders</h3>

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
                        {renderVendorStatus(order.status)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted">
              <i className="fa fa-box-open fa-2x mb-2" />
              <p>No customer orders found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorOrders;
