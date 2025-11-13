/**
 * ProfilePage Component
 * User profile management - view and update personal information
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        fullName: formData.fullName,
        avatarUrl: formData.avatarUrl,
      };

      // Only include password if user wants to change it
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await authService.deleteAccount();
      alert('Your account has been deactivated. You will be logged out.');
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  if (!user) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>👤 My Profile</h1>
          <p>Manage your personal information and account settings</p>
        </div>

        <div className="profile-content">
          {/* Profile Info Card */}
          <div className="profile-info-card">
            <div className="avatar-section">
              <div className="avatar-preview">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-info">
                <h2>{user.fullName}</h2>
                <p className="user-email">{user.email}</p>
                <span className={`user-role role-${user.role}`}>
                  {user.role === 'customer' && '🎓 Customer'}
                  {user.role === 'provider' && '👨‍🏫 Provider'}
                  {user.role === 'admin' && '👨‍💼 Admin'}
                </span>
                <span className={`user-status status-${user.status}`}>
                  {user.status === 'active' && '✅ Active'}
                  {user.status === 'pending_provider' && '⏳ Pending Provider Approval'}
                  {user.status === 'inactive' && '❌ Inactive'}
                </span>
              </div>
            </div>

            <div className="account-stats">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="profile-form-card">
            <h3>Edit Profile</h3>
            
            {error && <Message type="error">{error}</Message>}
            {success && <Message type="success">{success}</Message>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  title="Email cannot be changed"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="avatarUrl">Avatar URL</label>
                <input
                  type="url"
                  id="avatarUrl"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="form-divider">
                <span>Change Password (Optional)</span>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  minLength="6"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          {user.role !== 'admin' && (
            <div className="danger-zone-card">
              <h3>⚠️ Danger Zone</h3>
              <p>
                Once you delete your account, there is no going back. Your account will be
                deactivated and you will lose access to all your enrolled courses.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-danger"
                disabled={loading}
              >
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
