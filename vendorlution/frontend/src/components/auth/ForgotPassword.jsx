// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { isValidEmail } from '../../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { notifySuccess, notifyError } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      notifyError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // This would call your API
      // await api.post('/auth/forgot-password/', { email });
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        notifySuccess('Password reset instructions sent to your email');
      }, 1500);
    } catch (error) {
      setLoading(false);
      notifyError('Failed to send reset instructions. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body text-center p-4">
                <div className="text-success mb-3">
                  <i className="fa fa-check-circle fa-3x"></i>
                </div>
                <h3 className="card-title mb-3">Check Your Email</h3>
                <p className="text-muted mb-4">
                  We've sent password reset instructions to <strong>{email}</strong>. 
                  Please check your email and follow the link to reset your password.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">Reset Password</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
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