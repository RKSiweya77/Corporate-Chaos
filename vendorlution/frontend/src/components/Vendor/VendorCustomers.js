import React, { useState } from "react";
import VendorSidebar from "./VendorSidebar";

function VendorCustomers() {
  // Mock customers (replace with API call later)
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+27 65 123 4567",
      totalOrders: 3,
      totalSpent: 9400,
      lastOrder: "2025-09-12",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+27 72 987 6543",
      totalOrders: 2,
      totalSpent: 3600,
      lastOrder: "2025-09-14",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+27 73 444 1122",
      totalOrders: 5,
      totalSpent: 12500,
      lastOrder: "2025-09-15",
    },
  ]);

  // Remove customer handler
  const handleRemove = (id: number) => {
    if (window.confirm("Are you sure you want to remove this customer?")) {
      setCustomers(customers.filter((customer) => customer.id !== id));
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <VendorSidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">My Customers</h3>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Total Spent (R)</th>
                  <th>Last Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td>{index + 1}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.totalOrders}</td>
                      <td>{customer.totalSpent}</td>
                      <td>{customer.lastOrder}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemove(customer.id)}
                        >
                          <i className="fa fa-trash me-1"></i> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No customers found yet.
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

export default VendorCustomers;
