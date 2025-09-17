// components/Customer/AddressList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);

  // Load addresses from localStorage on component mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem('addresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    } else {
      // Set default addresses if none exist in localStorage
      const defaultAddresses = [
        {
          id: 1,
          name: "Home",
          street: "123 Nelson Mandela Dr",
          city: "Mthatha",
          province: "Eastern Cape",
          postalCode: "5100",
          isDefault: true,
        },
        {
          id: 2,
          name: "Work",
          street: "45 Commissioner St",
          city: "Johannesburg",
          province: "Gauteng",
          postalCode: "2001",
          isDefault: false,
        },
        {
          id: 3,
          name: "Parents' House",
          street: "78 Long St",
          city: "Cape Town",
          province: "Western Cape",
          postalCode: "8000",
          isDefault: false,
        },
      ];
      setAddresses(defaultAddresses);
      localStorage.setItem('addresses', JSON.stringify(defaultAddresses));
    }
  }, []);

  const makeDefault = (id) => {
    const updatedAddresses = addresses.map(addr =>
      addr.id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
    );
    setAddresses(updatedAddresses);
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-3 mb-4">
          <Sidebar />
        </aside>

        {/* Main content */}
        <section className="col-md-9">
          <h3 className="mb-4">My Addresses</h3>
          <div className="row">
            {addresses.map((addr) => (
              <div className="col-md-6 mb-3" key={addr.id}>
                <div
                  className={`card shadow-sm p-3 position-relative ${
                    addr.isDefault ? "border border-success" : ""
                  }`}
                >
                  {addr.isDefault && (
                    <span
                      className="position-absolute top-0 end-0 m-2 text-success"
                      style={{ fontSize: "1.5rem" }}
                    >
                      <i className="fa fa-check-circle"></i>
                    </span>
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{addr.name}</h5>
                    <p className="card-text">
                      {addr.street} <br />
                      {addr.city}, {addr.province} <br />
                      {addr.postalCode}
                    </p>
                    {!addr.isDefault ? (
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => makeDefault(addr.id)}
                      >
                        <i className="fa fa-map-marker-alt me-2"></i>
                        Make Default
                      </button>
                    ) : (
                      <span className="badge bg-success">
                        <i className="fa fa-check me-1"></i> Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Address Button */}
          <div className="mt-4">
            <Link to="/customer/add-address" className="btn btn-primary">
              <i className="fa fa-plus me-2"></i> Add New Address
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddressList;