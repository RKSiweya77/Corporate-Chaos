// components/Vendor/AddProduct.js
import React, { useState } from "react";

function AddProduct() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Product added (mock). Backend integration later.");
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h3 className="mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="E.g. Wireless Headphones"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Price (R)</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="E.g. 1200"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="E.g. Electronics"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief product description"
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                name="image"
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-dark w-100">
              <i className="fa fa-plus me-2"></i>Add Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
