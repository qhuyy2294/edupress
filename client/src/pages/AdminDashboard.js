/**
 * AdminDashboard Component
 * Admin dashboard for managing users, providers, and courses
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, providersRes, coursesRes] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getPendingProviders(),
        adminService.getPendingCourses(),
      ]);

      setStats(statsRes.data);
      setPendingProviders(providersRes.data);
      setPendingCourses(coursesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (id) => {
    try {
      await adminService.approveProvider(id);
      setSuccessMessage('Provider approved successfully');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve provider');
    }
  };

  const handleRejectProvider = async (id) => {
    try {
      await adminService.rejectProvider(id);
      setSuccessMessage('Provider request rejected');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject provider');
    }
  };

  const handleApproveCourse = async (id) => {
    try {
      await adminService.approveCourse(id);
      setSuccessMessage('Course approved successfully');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve course');
    }
  };

  const handleRejectCourse = async (id) => {
    try {
      await adminService.rejectCourse(id);
      setSuccessMessage('Course rejected');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject course');
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/admin/customers" className="action-btn">
            <span>👥</span> Manage Customers
          </Link>
          <Link to="/admin/courses" className="action-btn">
            <span>📚</span> Manage Courses
          </Link>
        </div>

        {error && <Message type="error" message={error} onClose={() => setError('')} />}
        {successMessage && (
          <Message
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* Statistics Section */}
        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-users">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.users.total}</p>
                  <div className="stat-details">
                    <span>Customers: {stats.users.customers}</span>
                    <span>Providers: {stats.users.providers}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-courses">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <h3>Total Courses</h3>
                  <p className="stat-number">{stats.courses.total}</p>
                  <div className="stat-details">
                    <span>Approved: {stats.courses.approved}</span>
                    <span>Pending: {stats.courses.pending}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-enrollments">
                <div className="stat-icon">🎓</div>
                <div className="stat-info">
                  <h3>Enrollments</h3>
                  <p className="stat-number">{stats.enrollments}</p>
                  <div className="stat-details">
                    <span>Active learners</span>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-number">${stats.revenue.toFixed(2)}</p>
                  <div className="stat-details">
                    <span>Platform earnings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Alerts */}
            {(pendingProviders.length > 0 || pendingCourses.length > 0) && (
              <div className="pending-alerts">
                {pendingProviders.length > 0 && (
                  <div className="alert alert-provider">
                    <span className="alert-icon">👤</span>
                    <span className="alert-text">
                      {pendingProviders.length} provider request{pendingProviders.length > 1 ? 's' : ''} waiting for approval
                    </span>
                  </div>
                )}
                {pendingCourses.length > 0 && (
                  <div className="alert alert-course">
                    <span className="alert-icon">📝</span>
                    <span className="alert-text">
                      {pendingCourses.length} course{pendingCourses.length > 1 ? 's' : ''} waiting for review
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Pending Provider Requests */}
        <div className="dashboard-section">
          <h2>Pending Provider Requests ({pendingProviders.length})</h2>
          {pendingProviders.length === 0 ? (
            <p className="empty-message">No pending provider requests</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProviders.map((provider) => (
                    <tr key={provider._id}>
                      <td>{provider.fullName}</td>
                      <td>{provider.email}</td>
                      <td>{new Date(provider.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleApproveProvider(provider._id)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectProvider(provider._id)}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Courses */}
        <div className="dashboard-section">
          <h2>Pending Courses ({pendingCourses.length})</h2>
          {pendingCourses.length === 0 ? (
            <p className="empty-message">No pending courses</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Provider</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCourses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.title}</td>
                      <td>{course.category}</td>
                      <td>${course.price}</td>
                      <td>{course.provider?.fullName}</td>
                      <td>
                        <button
                          onClick={() => handleApproveCourse(course._id)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectCourse(course._id)}
                          className="btn-reject"
                        >
                          Reject
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
  );
};

export default AdminDashboard;
