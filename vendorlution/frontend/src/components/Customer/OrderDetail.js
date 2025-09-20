// components/Customer/OrderDetail.js
import React from "react";
import { useParams, Link } from "react-router-dom";

function OrderDetail() {
  const { id } = useParams();

  // Mock data (replace with API later)
  const order = {
    id,
    product: "Wireless Headphones",
    image: "/logo.png",
    vendor: "TechWorld Store",
    price: 1200,
    qty: 1,
    status: "Awaiting Confirmation", // Completed | Processing | Cancelled | Awaiting Confirmation
    date: "2025-09-20",
    shipping: "Pargo Store-to-Store",
    address: "123 Main Street, Cape Town",
    buyerProtection: true,
  };

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
      <Link to="/customer/orders" className="btn btn-sm btn-outline-dark mb-3">
        <i className="fa fa-arrow-left me-1"></i> Back to Orders
      </Link>

      <div className="card shadow-sm border-0">
        <div className="row g-0">
          {/* Product image */}
          <div className="col-md-4">
            <img
              src={order.image}
              alt={order.product}
              className="img-fluid h-100 w-100"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Order details */}
          <div className="col-md-8">
            <div className="card-body">
              <h4 className="fw-bold">{order.product}</h4>
              <p className="text-muted mb-1">Order ID: #{order.id}</p>
              <p className="text-muted mb-1">Vendor: {order.vendor}</p>
              <p className="fw-semibold">R {order.price} × {order.qty} = R {order.price * order.qty}</p>
              <div className="mb-3">{renderStatus(order.status)}</div>

              <hr />

              <h6 className="fw-bold">Shipping Info</h6>
              <p className="mb-1"><i className="fa fa-truck me-2 text-muted"></i>{order.shipping}</p>
              <p className="mb-3"><i className="fa fa-location-dot me-2 text-muted"></i>{order.address}</p>

              <h6 className="fw-bold">Order Date</h6>
              <p className="mb-3">{order.date}</p>

              {order.buyerProtection && (
                <div className="alert alert-info small">
                  <i className="fa fa-shield-halved me-2"></i>
                  This order is covered by Buyer Protection. Funds are held safely until you confirm receipt.
                </div>
              )}

              {/* Action buttons */}
              <div className="d-flex gap-2 mt-3">
                {order.status === "Awaiting Confirmation" && (
                  <button className="btn btn-success">
                    <i className="fa fa-check me-1"></i> Confirm Receipt
                  </button>
                )}
                <button className="btn btn-outline-danger">
                  <i className="fa fa-life-ring me-1"></i> Open Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
