/**
 * CustomerManagementPage Component
 * Admin page to manage all customers - view, search, filter, ban/unban
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CustomerManagementPage.css';

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, banned
  const [roleFilter, setRoleFilter] = useState('all'); // all, customer, provider
  
  // Edit modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend returns { success, count, data } - we need the data array
      setCustomers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`User ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({ fullName: user.fullName || '', email: user.email });
    setError('');
    setSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${editingUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('User updated successfully');
      setEditingUser(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      customer.fullName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'inactive' && customer.status !== 'inactive') return false;
      if (statusFilter === 'active' && customer.status !== 'active') return false;
    }

    // Role filter
    if (roleFilter !== 'all' && customer.role !== roleFilter) return false;

    return true;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="customer-management-page">
      <div className="page-header">
        <h1>Customer Management</h1>
        <p>Manage all customers and providers</p>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        <div className="filter-stats">
          Showing {filteredCustomers.length} of {customers.length} users
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        {filteredCustomers.length === 0 ? (
          <Message type="info">No customers found</Message>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer._id} className={customer.status === 'inactive' ? 'inactive-row' : ''}>
                  <td>
                    <div className="user-info">
                      {customer.avatarUrl ? (
                        <img src={customer.avatarUrl} alt={customer.fullName} className="avatar-small" />
                      ) : (
                        <div className="avatar-placeholder-small">
                          {customer.fullName?.charAt(0) || customer.email?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span>{customer.fullName || 'N/A'}</span>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>
                    <span className={`role-badge ${customer.role}`}>
                      {customer.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${customer.status || 'active'}`}>
                      {customer.status || 'active'}
                    </span>
                  </td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditClick(customer)}
                        disabled={customer.role === 'admin'}
                      >
                        Edit
                      </button>
                      <button 
                        className={`btn-ban ${customer.status === 'inactive' ? 'unban' : ''}`}
                        onClick={() => handleBanToggle(customer._id, customer.status)}
                        disabled={customer.role === 'admin'}
                      >
                        {customer.status === 'inactive' ? 'Activate' : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">Save Changes</button>
                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;
