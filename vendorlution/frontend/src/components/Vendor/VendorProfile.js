import React, { useState } from "react";
import { Link } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import logo from "../../logo.png"; // placeholder vendor logo
import banner from "../../logo.png"; // using same for placeholder banner

function VendorProfile() {
  const [profile, setProfile] = useState({
    storeName: "TechWorld",
    ownerName: "John Doe",
    email: "john@techworld.com",
    phone: "+27 65 123 4567",
    address: "123 Market Street, Cape Town",
    category: "Electronics",
    description: "We sell affordable electronics and accessories.",
    logo: logo,
    banner: banner,
    status: "Active",
    joinDate: "2024-07-01",
    totalProducts: 12,
    completedOrders: 58,
    rating: 4.5,
  });

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle mock logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setProfile({ ...profile, logo: imgUrl });
    }
  };

  // Handle mock banner upload
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setProfile({ ...profile, banner: imgUrl });
    }
  };

  const handleSave = () => {
    alert("Profile saved (mock). In real app, this will update the backend.");
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
          <h3 className="mb-3">Vendor Profile</h3>

          {/* Banner Section */}
          <div className="card mb-4">
            <img
              src={profile.banner}
              alt="Vendor Banner"
              className="card-img-top"
              style={{ maxHeight: "200px", objectFit: "cover" }}
            />
            <div className="card-body text-center">
              <img
                src={profile.logo}
                alt="Vendor Logo"
                className="rounded-circle mb-3 border"
                width="100"
                height="100"
                style={{ objectFit: "cover" }}
              />
              <h4>{profile.storeName}</h4>
              <span
                className={`badge ${
                  profile.status === "Active" ? "bg-success" : "bg-secondary"
                }`}
              >
                {profile.status}
              </span>
              <p className="mt-2">{profile.description}</p>

              {/* ✅ Preview My Store button */}
              <Link
                to={`/vendor/store/${profile.storeName
                  .toLowerCase()
                  .replace(/\\s+/g, "-")}/1`}
                className="btn btn-sm btn-outline-dark mt-2"
              >
                Preview My Store
              </Link>
            </div>
          </div>

          {/* Editable Form */}
          <div className="card">
            <div className="card-body">
              <h5>Edit Profile</h5>
              <form>
                {/* Logo Upload */}
                <div className="mb-3">
                  <label className="form-label">Upload Logo</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </div>

                {/* Banner Upload */}
                <div className="mb-3">
                  <label className="form-label">Upload Banner</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleBannerChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="storeName"
                    value={profile.storeName}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Owner Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ownerName"
                    value={profile.ownerName}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="category"
                    value={profile.category}
                    onChange={handleChange}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          {/* Vendor Stats */}
          <div className="card mt-4">
            <div className="card-body">
              <h5>Performance Overview</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Join Date: {profile.joinDate}
                </li>
                <li className="list-group-item">
                  Total Products: {profile.totalProducts}
                </li>
                <li className="list-group-item">
                  Completed Orders: {profile.completedOrders}
                </li>
                <li className="list-group-item">
                  Rating: ⭐ {profile.rating}/5
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;
