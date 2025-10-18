// src/components/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { validatePassword } from '../../utils/validators';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotifications();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      notifyError('Passwords do not match');
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      notifyError('Please fix password requirements');
      return;
    }

    setLoading(true);
    try {
      // This would call your API
      // await api.post(`/auth/reset-password/${token}/`, { password: formData.password });
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        notifySuccess('Password reset successfully');
        navigate('/login');
      }, 1500);
    } catch (error) {
      setLoading(false);
      notifyError('Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">Set New Password</h2>
                <p className="text-muted">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="progress mb-2" style={{ height: '4px' }}>
                        <div 
                          className={`progress-bar ${
                            passwordStrength.strengthLevel === 'weak' ? 'bg-danger' :
                            passwordStrength.strengthLevel === 'medium' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${passwordStrength.strengthPercent}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        Password strength: {passwordStrength.strengthLevel}
                      </small>
                      {passwordStrength.errors.length > 0 && (
                        <div className="mt-1">
                          {passwordStrength.errors.map((error, index) => (
                            <div key={index} className="text-danger small">• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div className="text-danger small mt-1">Passwords do not match</div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading || formData.password !== formData.confirmPassword || !passwordStrength.isValid}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <i className="fa fa-arrow-left me-1"></i>
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}