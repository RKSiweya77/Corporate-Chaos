// src/components/admin/DisputeManagement.jsx
import React, { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { DISPUTE_STATUS_LABEL } from '../../utils/constants';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const { data, loading, error, refetch } = useFetch('/api/disputes/');

  useEffect(() => {
    if (data) {
      setDisputes(Array.isArray(data) ? data : data.results || []);
    }
  }, [data]);

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true;
    return dispute.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'open': 'warning',
      'under_review': 'info',
      'resolved': 'success',
      'closed': 'secondary'
    };
    return `badge bg-${statusColors[status] || 'secondary'}`;
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <EmptyState title="Error loading disputes" subtitle={error} />;

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 fw-bold mb-1">Dispute Management</h1>
              <p className="text-muted">Manage and resolve customer disputes</p>
            </div>
            <div className="btn-group">
              <button
                className={`btn btn-outline-secondary ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`btn btn-outline-warning ${filter === 'open' ? 'active' : ''}`}
                onClick={() => setFilter('open')}
              >
                Open
              </button>
              <button
                className={`btn btn-outline-info ${filter === 'under_review' ? 'active' : ''}`}
                onClick={() => setFilter('under_review')}
              >
                Under Review
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              {filteredDisputes.length === 0 ? (
                <EmptyState 
                  title="No disputes found"
                  subtitle={filter !== 'all' ? `No ${filter} disputes` : "No disputes have been created yet"}
                  icon="fa-gavel"
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Order</th>
                        <th>Parties</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisputes.map(dispute => (
                        <tr key={dispute.id}>
                          <td>#{dispute.id}</td>
                          <td>Order #{dispute.order?.id}</td>
                          <td>
                            <div className="small">
                              <div>Buyer: {dispute.buyer?.name || dispute.buyer?.email}</div>
                              <div>Vendor: {dispute.vendor?.name || dispute.vendor?.email}</div>
                            </div>
                          </td>
                          <td>{formatCurrency(dispute.amount)}</td>
                          <td>
                            <span className={getStatusBadge(dispute.status)}>
                              {DISPUTE_STATUS_LABEL[dispute.status] || dispute.status}
                            </span>
                          </td>
                          <td>{formatDateTime(dispute.created_at)}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="fa fa-eye me-1"></i>
                              View
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