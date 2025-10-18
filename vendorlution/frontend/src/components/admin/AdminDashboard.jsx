// src/components/admin/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function AdminDashboard() {
  // Mock data - in real app, this would come from API
  const stats = {
    totalUsers: 1247,
    totalVendors: 89,
    totalOrders: 8452,
    totalRevenue: 1258472,
    pendingDisputes: 12,
    activeListings: 1567,
  };

  const recentActivities = [
    { id: 1, type: 'order', message: 'New order #8452 placed', time: '5 minutes ago' },
    { id: 2, type: 'user', message: 'New vendor registration', time: '15 minutes ago' },
    { id: 3, type: 'dispute', message: 'Dispute #23 opened', time: '1 hour ago' },
    { id: 4, type: 'payment', message: 'Withdrawal processed for Vendor #45', time: '2 hours ago' },
  ];

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="mb-4">
            <h1 className="h2 fw-bold mb-1">Admin Dashboard</h1>
            <p className="text-muted">Platform overview and quick actions</p>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-5">
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <div className="h4 mb-1">{formatNumber(stats.totalUsers)}</div>
                  <small>Total Users</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <div className="h4 mb-1">{formatNumber(stats.totalVendors)}</div>
                  <small>Vendors</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <div className="h4 mb-1">{formatNumber(stats.totalOrders)}</div>
                  <small>Orders</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <div className="h4 mb-1">{formatCurrency(stats.totalRevenue)}</div>
                  <small>Revenue</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <div className="h4 mb-1">{formatNumber(stats.pendingDisputes)}</div>
                  <small>Disputes</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-dark text-white">
                <div className="card-body text-center">
                  <div className="h4 mb-1">{formatNumber(stats.activeListings)}</div>
                  <small>Listings</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Quick Actions */}
            <div className="col-12 col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-6">
                      <Link to="/admin/users" className="btn btn-outline-primary w-100 mb-2">
                        <i className="fa fa-users me-2"></i>
                        Manage Users
                      </Link>
                    </div>
                    <div className="col-6">
                      <Link to="/admin/disputes" className="btn btn-outline-warning w-100 mb-2">
                        <i className="fa fa-gavel me-2"></i>
                        View Disputes
                      </Link>
                    </div>
                    <div className="col-6">
                      <Link to="/admin/settings" className="btn btn-outline-secondary w-100 mb-2">
                        <i className="fa fa-cog me-2"></i>
                        System Settings
                      </Link>
                    </div>
                    <div className="col-6">
                      <button className="btn btn-outline-info w-100 mb-2">
                        <i className="fa fa-chart-bar me-2"></i>
                        View Reports
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-12 col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Recent Activity</h5>
                </div>
                <div className="card-body">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="d-flex align-items-start mb-3">
                      <div className="flex-shrink-0">
                        <i className={`fa fa-${getActivityIcon(activity.type)} text-muted`}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="small">{activity.message}</div>
                        <div className="text-muted small">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(type) {
  const icons = {
    order: 'shopping-bag',
    user: 'user-plus',
    dispute: 'gavel',
    payment: 'credit-card'
  };
  return icons[type] || 'bell';
}