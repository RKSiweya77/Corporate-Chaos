import { useEffect, useState } from "react";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useNotifications } from "../../context/NotificationsContext";
import { toMedia } from "../../utils/media";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotifications();

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock_quantity: "",
    category: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load products
        const productsRes = await api.get(API_ENDPOINTS.vendorProducts.list);
        const productsData = productsRes.data?.results || productsRes.data || [];
        setProducts(productsData);

        // Load categories
        const categoriesRes = await api.get("/categories/");
        const categoriesData = categoriesRes.data?.results || categoriesRes.data || [];
        setCategories(categoriesData);
        
      } catch (error) {
        console.error("Failed to load data:", error);
        addNotification("Failed to load products and categories", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [addNotification]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.price) {
      addNotification("Title and price are required", "error");
      return;
    }

    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("price", form.price);
      formData.append("stock_quantity", form.stock_quantity || "0");
      if (form.category) formData.append("category", form.category);
      if (form.description) formData.append("description", form.description);
      if (image) formData.append("main_image", image);

      await api.post(API_ENDPOINTS.vendorProducts.create, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Reset form and reload products
      setForm({ title: "", price: "", stock_quantity: "", category: "", description: "" });
      setImage(null);
      setImagePreview(null);
      
      // Reload products list
      const productsRes = await api.get(API_ENDPOINTS.vendorProducts.list);
      const productsData = productsRes.data?.results || productsRes.data || [];
      setProducts(productsData);
      
      addNotification("Product created successfully!", "success");
    } catch (error) {
      const message = error?.response?.data?.detail || 
                     error?.response?.data?.title?.[0] ||
                     "Failed to create product";
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.vendorProducts.delete(productId));
      
      // Update products list
      setProducts(prev => prev.filter(p => p.id !== productId));
      addNotification("Product deleted successfully", "success");
    } catch (error) {
      addNotification("Failed to delete product", "error");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="fas fa-boxes me-2 text-primary"></i>
          Product Management
        </h3>
        <div className="text-muted">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="row g-4">
        {/* Add Product Form */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Add New Product
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Product Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price (R) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={form.price}
                      onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={form.stock_quantity}
                      onChange={(e) => setForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name || category.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Product Image</label>
                  {imagePreview && (
                    <div className="mb-3 text-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded border"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-dark w-100"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      Create Product
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                My Products
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No products yet</h5>
                  <p className="text-muted">Create your first product to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '80px' }}>Image</th>
                        <th>Product</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Stock</th>
                        <th style={{ width: '80px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.main_image || product.image ? (
                              <img
                                src={toMedia(product.main_image || product.image)}
                                alt={product.title}
                                className="rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                   style={{ width: '50px', height: '50px' }}>
                                <i className="fas fa-image text-muted"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-semibold">{product.title || product.name}</div>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                              {product.description?.substring(0, 50)}...
                            </small>
                          </td>
                          <td className="text-end fw-bold text-primary">
                            R {Number(product.price).toFixed(2)}
                          </td>
                          <td className="text-end">
                            <span className={`badge ${product.stock_quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {product.stock_quantity || 0} in stock
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(product.id)}
                              title="Delete product"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}