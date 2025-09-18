import React from "react";
import VendorSidebar from "./VendorSidebar";

function VendorOrders() {
  // Mock orders (replace later with API call)
  const orders = [
    {
      id: 1,
      customer: "John Doe",
      product: "Second-Hand Laptop",
      quantity: 1,
      total: 4500,
      status: "Pending",
      date: "2025-09-10",
    },
    {
      id: 2,
      customer: "Jane Smith",
      product: "Designer Jacket",
      quantity: 2,
      total: 2400,
      status: "Shipped",
      date: "2025-09-12",
    },
    {
      id: 3,
      customer: "Mike Johnson",
      product: "Old iPhone",
      quantity: 1,
      total: 2500,
      status: "Delivered",
      date: "2025-09-15",
    },
  ];

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <VendorSidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">My Orders</h3>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total (R)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{index + 1}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.quantity}</td>
                      <td>{order.total}</td>
                      <td>
                        {order.status === "Pending" && (
                          <span className="badge bg-warning text-dark">
                            Pending
                          </span>
                        )}
                        {order.status === "Shipped" && (
                          <span className="badge bg-info text-dark">
                            Shipped
                          </span>
                        )}
                        {order.status === "Delivered" && (
                          <span className="badge bg-success">
                            Delivered
                          </span>
                        )}
                      </td>
                      <td>{order.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorOrders;
