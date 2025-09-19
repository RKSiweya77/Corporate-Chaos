// components/Customer/AddressList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("addresses");
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      const defaults = [
        {
          id: 1,
          name: "Home",
          street: "123 Nelson Mandela Dr",
          city: "Mthatha",
          province: "Eastern Cape",
          postalCode: "5100",
          isDefault: true,
        },
      ];
      setAddresses(defaults);
      localStorage.setItem("addresses", JSON.stringify(defaults));
    }
  }, []);

  const makeDefault = (id) => {
    const updated = addresses.map((a) =>
      a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }
    );
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Addresses</h3>
      <div className="row g-3">
        {addresses.map((addr) => (
          <div className="col-md-6" key={addr.id}>
            <div
              className={`card shadow-sm h-100 ${
                addr.isDefault ? "border border-success" : ""
              }`}
            >
              <div className="card-body">
                <h5 className="card-title">{addr.name}</h5>
                <p className="card-text">
                  {addr.street}
                  <br />
                  {addr.city}, {addr.province}
                  <br />
                  {addr.postalCode}
                </p>
                {!addr.isDefault ? (
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => makeDefault(addr.id)}
                  >
                    Make Default
                  </button>
                ) : (
                  <span className="badge bg-success">Default</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/customer/add-address" className="btn btn-dark">
          <i className="fa fa-plus me-2"></i> Add New Address
        </Link>
      </div>
    </div>
  );
};

export default AddressList;
