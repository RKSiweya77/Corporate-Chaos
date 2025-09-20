// components/Vendor/VendorOrders.js
import React from "react";

function VendorOrders() {
  const orders = [
    { id: 1, customer: "Alice", product: "Headphones", status: "Completed" },
    { id: 2, customer: "Bob", product: "Sneakers", status: "Pending" },
  ];

  return (
    <div className="container py-5">
      <h3 className="mb-4">Orders</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, index) => (
                  <tr key={o.id}>
                    <td>{index + 1}</td>
                    <td>{o.customer}</td>
                    <td>{o.product}</td>
                    <td>
                      <span
                        className={`badge ${
                          o.status === "Completed"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
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
