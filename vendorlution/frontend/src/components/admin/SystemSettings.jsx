// src/components/admin/SystemSettings.jsx
import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    platformFee: 5,
    escrowHoldDays: 3,
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    enableOzow: true,
    enableEscrow: true,
    autoReleaseEscrow: false,
  });

  const { notifySuccess } = useNotifications();

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would call an API
    notifySuccess('Settings saved successfully');
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="mb-4">
            <h1 className="h2 fw-bold mb-1">System Settings</h1>
            <p className="text-muted">Manage platform-wide settings and configurations</p>
          </div>

          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Platform Settings</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="platformFee" className="form-label">
                        Platform Fee (%)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="platformFee"
                        value={settings.platformFee}
                        onChange={(e) => handleChange('platformFee', parseFloat(e.target.value))}
                        min="0"
                        max="20"
                        step="0.5"
                      />
                      <div className="form-text">
                        Percentage fee charged on each transaction
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="escrowHoldDays" className="form-label">
                        Escrow Hold Days
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="escrowHoldDays"
                        value={settings.escrowHoldDays}
                        onChange={(e) => handleChange('escrowHoldDays', parseInt(e.target.value))}
                        min="1"
                        max="30"
                      />
                      <div className="form-text">
                        Number of days funds are held in escrow
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="minWithdrawal" className="form-label">
                        Minimum Withdrawal (ZAR)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="minWithdrawal"
                        value={settings.minWithdrawal}
                        onChange={(e) => handleChange('minWithdrawal', parseFloat(e.target.value))}
                        min="10"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="maxWithdrawal" className="form-label">
                        Maximum Withdrawal (ZAR)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="maxWithdrawal"
                        value={settings.maxWithdrawal}
                        onChange={(e) => handleChange('maxWithdrawal', parseFloat(e.target.value))}
                        min="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Feature Flags</h5>
                </div>
                <div className="card-body">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enableOzow"
                      checked={settings.enableOzow}
                      onChange={(e) => handleChange('enableOzow', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="enableOzow">
                      Enable Ozow Payments
                    </label>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enableEscrow"
                      checked={settings.enableEscrow}
                      onChange={(e) => handleChange('enableEscrow', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="enableEscrow">
                      Enable Escrow Protection
                    </label>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoReleaseEscrow"
                      checked={settings.autoReleaseEscrow}
                      onChange={(e) => handleChange('autoReleaseEscrow', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="autoReleaseEscrow">
                      Auto-release Escrow After Hold Period
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="fa fa-save me-2"></i>
                  Save Settings
                </button>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">System Information</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Platform Version:</strong>
                    <div className="text-muted">1.0.0</div>
                  </div>
                  <div className="mb-3">
                    <strong>Last Backup:</strong>
                    <div className="text-muted">2 hours ago</div>
                  </div>
                  <div className="mb-3">
                    <strong>Active Users:</strong>
                    <div className="text-muted">1,247</div>
                  </div>
                  <div className="mb-3">
                    <strong>Total Orders:</strong>
                    <div className="text-muted">8,452</div>
                  </div>
                  <div>
                    <strong>System Status:</strong>
                    <div>
                      <span className="badge bg-success">All Systems Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}