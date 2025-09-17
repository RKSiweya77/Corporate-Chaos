// src/components/Vendor/AddProduct.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

function AddProduct({ onAddProduct }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    condition: "New",
    stock: "",
    category: "",
    image: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProduct = {
      id: Date.now(),
      ...form,
      image: form.image ? URL.createObjectURL(form.image) : null,
      status: "Active",
    };

    onAddProduct(newProduct); // update product list in App.js
    navigate("/vendor/products"); // redirect back to products page
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <VendorSidebar />
        </div>

        {/* Form */}
        <div className="col-md-9">
          <h3 className="mb-3">Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Price (R)</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                name="condition"
                value={form.condition}
                onChange={handleChange}
              >
                <option>New</option>
                <option>Like New</option>
                <option>Used – Good</option>
                <option>Used – Acceptable</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
           <label className="form-label">Category</label>
               <select
                className="form-select"
                name="category"
                value={form.category}
                onChange={handleChange}
                >
                <option value="">-- Select a Category --</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="books">Books</option>
                <option value="furniture">Furniture</option>
                <option value="appliances">Appliances</option>
                <option value="toys">Toys</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
            </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Product Image</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <i className="fa fa-plus me-2"></i> Add Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
