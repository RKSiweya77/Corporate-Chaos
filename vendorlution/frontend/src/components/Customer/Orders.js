// components/Customer/Orders.js
import React from "react";
import { Link } from "react-router-dom";

function Orders() {
  // Mock orders (replace with API later)
  const orders = [
    { id: 1, product: "Phone", image: "/logo.png", price: 500, status: "Completed" },
    { id: 2, product: "Speaker", image: "/logo.png", price: 500, status: "Cancelled" },
    { id: 3, product: "Earbuds", image: "/logo.png", price: 500, status: "Processing" },
    { id: 4, product: "Trouser", image: "/logo.png", price: 500, status: "Awaiting Confirmation" },
  ];

  const renderStatus = (status) => {
    switch (status) {
      case "Completed":
        return <span className="badge bg-success"><i className="fa fa-check-circle me-1"></i>{status}</span>;
      case "Cancelled":
        return <span className="badge bg-danger"><i className="fa fa-times-circle me-1"></i>{status}</span>;
      case "Processing":
        return <span className="badge bg-warning text-dark"><i className="fa fa-spinner fa-spin me-1"></i>{status}</span>;
      case "Awaiting Confirmation":
        return <span className="badge bg-info text-dark"><i className="fa fa-clock me-1"></i>{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container py-5">
      <h3 className="mb-4">My Orders</h3>

      {orders.length > 0 ? (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <img
                  src={order.image}
                  alt={order.product}
                  className="card-img-top"
                  style={{ height: "160px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h6 className="fw-bold">{order.product}</h6>
                  <p className="text-muted small mb-2">Order ID: #{order.id}</p>
                  <p className="fw-semibold mb-2">R {order.price}</p>
                  <div className="mb-3">{renderStatus(order.status)}</div>
                  <div className="mt-auto d-flex justify-content-between">
                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="btn btn-sm btn-outline-dark"
                    >
                      View Details
                    </Link>
                    {order.status === "Awaiting Confirmation" && (
                      <button className="btn btn-sm btn-success">
                        Confirm Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="fa fa-box-open fa-2x mb-2"></i>
          <p>No orders found.</p>
        </div>
      )}
    </div>
  );
}

export default Orders;
