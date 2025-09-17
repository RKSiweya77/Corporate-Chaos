import { useState } from "react";
import Sidebar from "./Sidebar";

function Profile() {
  // Profile state (later load from backend)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profileImage: null,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    setProfile({ ...profile, profileImage: e.target.files[0] });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile updated:", profile);
    alert("Profile updated successfully!");
    // Later: send data to Django API with fetch/axios
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-3">
          <Sidebar />
        </aside>

        {/* Profile Form */}
        <section className="col-md-9">
          <h3 className="mb-3">Update Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter first name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter last name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Profile Image</label>
              <input
                type="file"
                name="profileImage"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Profile;
