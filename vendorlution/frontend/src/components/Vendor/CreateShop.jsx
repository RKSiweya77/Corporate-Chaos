// src/components/vendor/CreateShop.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CreateShop() {
  const nav = useNavigate();
  const { createVendor } = useAuth();

  const [form, setForm] = useState({
    shop_name: "",
    description: "",
    address: "",
  });
  const [files, setFiles] = useState({ logo: null, banner: null });
  const [previews, setPreviews] = useState({ logo: null, banner: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug: Log when component mounts
  useEffect(() => {
    console.log("CreateShop component mounted");
  }, []);

  const handleFileChange = (field, file) => {
    console.log(`File selected for ${field}:`, file?.name);
    setFiles(prev => ({ ...prev, [field]: file }));
    
    if (!file) {
      setPreviews(prev => ({ ...prev, [field]: null }));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(`Preview loaded for ${field}`);
      setPreviews(prev => ({ ...prev, [field]: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted", form);
    setError("");
    
    if (!form.shop_name.trim()) {
      setError("Shop name is required");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("shop_name", form.shop_name.trim());
      formData.append("description", form.description || "");
      formData.append("address", form.address || "");
      
      if (files.logo) formData.append("logo", files.logo);
      if (files.banner) formData.append("banner", files.banner);

      console.log("Calling createVendor...");
      const result = await createVendor(formData);
      console.log("CreateVendor result:", result);
      
      if (result.success) {
        console.log("Shop created successfully, redirecting...");
        nav("/vendor/dashboard", { replace: true });
      } else {
        setError(result.error || "Failed to create shop");
      }
    } catch (err) {
      console.error("Shop creation error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  console.log("CreateShop rendering...");

  return (
    <div className="container py-5" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7">
          
          {/* Debug Banner */}
          <div className="alert alert-warning mb-4">
            <strong>DEBUG:</strong> CreateShop component is rendering. If you can see this, the component is loaded.
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white py-3">
              <h3 className="mb-0">
                <i className="fas fa-store me-2"></i>
                Create Your Shop
              </h3>
            </div>
            
            <div className="card-body p-4">
              <div className="alert alert-info mb-4">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Welcome!</strong> Start selling on Vendorlution by creating your shop below.
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Shop Name */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Shop Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={form.shop_name}
                    onChange={(e) => {
                      console.log("Shop name changed:", e.target.value);
                      setForm(prev => ({ ...prev, shop_name: e.target.value }));
                    }}
                    placeholder="e.g. John's Electronics Store"
                    required
                    disabled={loading}
                    style={{ fontSize: '1.1rem' }}
                  />
                  <div className="form-text">
                    Choose a memorable name for your shop
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Shop Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell customers about your shop, what you sell, and what makes you unique..."
                    disabled={loading}
                  />
                  <div className="form-text">
                    Help customers understand what your shop offers
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Business Address</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street, Cape Town, Western Cape, 8001"
                    disabled={loading}
                  />
                  <div className="form-text">
                    Your business location (optional but recommended)
                  </div>
                </div>

                <hr className="my-4" />

                <h5 className="mb-3 fw-bold">
                  <i className="fas fa-image me-2"></i>
                  Shop Branding (Optional)
                </h5>

                {/* Logo Upload */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Shop Logo</label>
                  {previews.logo && (
                    <div className="mb-3 text-center">
                      <img
                        src={previews.logo}
                        alt="Logo preview"
                        className="rounded border shadow-sm"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleFileChange('logo', e.target.files?.[0])}
                    disabled={loading}
                  />
                  <div className="form-text">
                    <i className="fas fa-lightbulb me-1"></i>
                    Square image recommended (1:1 ratio, max 5MB)
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Shop Banner</label>
                  {previews.banner && (
                    <div className="mb-3">
                      <img
                        src={previews.banner}
                        alt="Banner preview"
                        className="rounded border shadow-sm w-100"
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleFileChange('banner', e.target.files?.[0])}
                    disabled={loading}
                  />
                  <div className="form-text">
                    <i className="fas fa-lightbulb me-1"></i>
                    Wide banner image (recommended 3:1 ratio, max 5MB)
                  </div>
                </div>

                <hr className="my-4" />

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => {
                      console.log("Cancel clicked");
                      nav(-1);
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-lg px-5"
                    disabled={loading || !form.shop_name.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Shop...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Create My Shop
                      </>
                    )}
                  </button>
                </div>

                {/* Help Text */}
                <div className="alert alert-light mt-4 mb-0">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-2"></i>
                    Your shop will be activated immediately. You can start adding products right away!
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}