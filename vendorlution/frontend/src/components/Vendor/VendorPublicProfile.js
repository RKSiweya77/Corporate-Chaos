import { useParams, Link } from "react-router-dom";
import logo from "../../logo.png";

function VendorPublicProfile() {
  const { vendor_id } = useParams();

  // Mock vendor data (replace with API later)
  const vendor = {
    id: vendor_id,
    name: "TechWorld Store",
    owner: "John Doe",
    email: "john@techworld.com",
    phone: "+27 65 123 4567",
    address: "123 Market Street, Cape Town",
    category: "Electronics",
    description: "We sell affordable electronics and accessories.",
    logo: logo,
    banner: logo,
    rating: 4.5,
    totalProducts: 25,
    completedOrders: 120,
    joinDate: "2024-07-01",
  };

  return (
    <div className="container mt-3">
      {/* Banner */}
      <div className="card border-0 shadow-sm mb-4">
        <img
          src={vendor.banner}
          alt="Vendor Banner"
          className="card-img-top"
          style={{ maxHeight: "200px", objectFit: "cover" }}
        />
        <div className="card-body text-center">
          <img
            src={vendor.logo}
            alt="Vendor Logo"
            className="rounded-circle border mb-2"
            width="100"
            height="100"
            style={{ objectFit: "cover" }}
          />
          <h4>{vendor.name}</h4>
          <p className="text-muted">{vendor.category}</p>
          <p>{vendor.description}</p>
          <p>⭐ {vendor.rating} / 5</p>

          {/* Back to Store + Chat */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Link
              to={`/vendor/store/${vendor.name
                .toLowerCase()
                .replace(/\s+/g, "-")}/${vendor.id}`}
              className="btn btn-sm btn-dark"
            >
              <i className="fa fa-store me-1"></i> Back to Store
            </Link>
            <Link
              to={`/customer/inbox?vendor=${vendor.id}`}
              className="btn btn-sm btn-outline-dark"
            >
              <i className="fa fa-comments me-1"></i> Chat with Seller
            </Link>
          </div>
        </div>
      </div>

      {/* Vendor Info */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Vendor Information</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Owner: {vendor.owner}</li>
            <li className="list-group-item">Email: {vendor.email}</li>
            <li className="list-group-item">Phone: {vendor.phone}</li>
            <li className="list-group-item">Address: {vendor.address}</li>
            <li className="list-group-item">
              Completed Orders: {vendor.completedOrders}
            </li>
            <li className="list-group-item">
              Total Products: {vendor.totalProducts}
            </li>
            <li className="list-group-item">Joined: {vendor.joinDate}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VendorPublicProfile;
