// components/Customer/AddAddress.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const AddAddress = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get existing addresses from localStorage or use empty array if none
    const existingAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
    
    // Generate a unique ID
    const newId = existingAddresses.length > 0 
      ? Math.max(...existingAddresses.map(addr => addr.id)) + 1 
      : 1;
    
    // Create new address object
    const newAddress = {
      ...formData,
      id: newId
    };

    // If this address is set as default, remove default from others
    let updatedAddresses;
    if (newAddress.isDefault) {
      updatedAddresses = existingAddresses.map(addr => ({ ...addr, isDefault: false }));
      updatedAddresses.push(newAddress);
    } else {
      updatedAddresses = [...existingAddresses, newAddress];
    }

    // Save to localStorage
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    
    // Redirect back to addresses list
    navigate('/customer/addresses');
  };

  return (
    
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-3 mb-4">
          <Sidebar />
        </aside>
        {/* Main content */}
        <section className="col-md-9 mx-auto">
          <h3 className="mb-4">Add New Address</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Address Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Home, Work, etc."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="street" className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="province" className="form-label">Province</label>
                  <select
                    className="form-select"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="North West">North West</option>
                    <option value="Western Cape">Western Cape</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="postalCode" className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isDefault">
                    Set as default address
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button type="submit" className="btn btn-primary me-2">
                Save Address
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/customer/addresses')}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AddAddress;