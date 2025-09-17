import { Link } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import logo from "../../logo.svg"; // placeholder image

function VendorProducts() {
  // Mock products (replace later with API call)
  const products = [
    {
      id: 1,
      title: "Second-Hand Laptop",
      description: "Affordable laptop in good condition.",
      price: 4500,
      condition: "Used – Good",
      stock: 3,
      status: "Active",
      image: logo,
    },
    {
      id: 2,
      title: "Designer Jacket",
      description: "Stylish preloved winter jacket.",
      price: 1200,
      condition: "Preloved",
      stock: 5,
      status: "Active",
      image: logo,
    },
    {
      id: 3,
      title: "Old iPhone",
      description: "Still working fine, battery needs replacement.",
      price: 2500,
      condition: "Used – Acceptable",
      stock: 1,
      status: "Draft",
      image: logo,
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>My Products</h3>
            <Link to="/vendor/add-product" className="btn btn-primary">
              <i className="fa fa-plus me-2"></i> Add Product
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Price (R)</th>
                  <th>Condition</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={product.image}
                          alt={product.title}
                          className="img-thumbnail"
                          width="60"
                        />
                      </td>
                      <td>{product.title}</td>
                      <td>{product.description}</td>
                      <td>{product.price}</td>
                      <td>{product.condition}</td>
                      <td>{product.stock}</td>
                      <td>
                        {product.status === "Active" ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">
                            {product.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-primary">
                            <i className="fa fa-edit"></i> Edit
                          </button>
                          <button className="btn btn-sm btn-danger">
                            <i className="fa fa-trash"></i> Delete
                          </button>
                          <button className="btn btn-sm btn-info">
                            <i className="fa fa-eye"></i> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No products listed yet.
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

export default VendorProducts;
