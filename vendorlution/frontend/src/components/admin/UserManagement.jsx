// src/components/admin/UserManagement.jsx
import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { data, loading, error, refetch } = useFetch('/api/admin/users/');

  React.useEffect(() => {
    if (data) {
      setUsers(Array.isArray(data) ? data : data.results || []);
    }
  }, [data]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const roleColors = {
      'buyer': 'primary',
      'vendor': 'success',
      'admin': 'danger'
    };
    return `badge bg-${roleColors[role] || 'secondary'}`;
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <EmptyState title="Error loading users" subtitle={error} />;

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 fw-bold mb-1">User Management</h1>
              <p className="text-muted">Manage platform users and permissions</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="vendor">Vendors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <div className="text-muted small">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <div className="card-body">
              {filteredUsers.length === 0 ? (
                <EmptyState 
                  title="No users found"
                  subtitle={searchTerm ? "Try adjusting your search criteria" : "No users in the system"}
                  icon="fa-users"
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{user.name || 'N/A'}</div>
                              <div className="text-muted small">{user.email}</div>
                            </div>
                          </td>
                          <td>
                            <span className={getRoleBadge(user.role)}>
                              {user.role?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${user.is_active ? 'success' : 'danger'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{formatDateTime(user.date_joined)}</td>
                          <td>{user.last_login ? formatDateTime(user.last_login) : 'Never'}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary">
                                <i className="fa fa-edit"></i>
                              </button>
                              <button className="btn btn-outline-danger">
                                <i className="fa fa-ban"></i>
                              </button>
                            </div>
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