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
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Mật khẩu mới không khớp');
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
        setSuccess('Hồ sơ đã được cập nhật thành công!');
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(result.message || 'Không cập nhật được hồ sơ');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản của mình không? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      setLoading(true);
      await authService.deleteAccount();
      alert('Tài khoản của bạn đã bị vô hiệu hóa. Bạn sẽ bị đăng xuất.');
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được tài khoản');
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
          <h1>👤 Hồ sơ của tôi</h1>
          <p>Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
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
                  {user.role === 'customer' && '🎓 Học viên'}
                  {user.role === 'provider' && '👨‍🏫 Nhà cung cấp'}
                  {user.role === 'admin' && '👨‍💼 Quản lý'}
                </span>
                <span className={`user-status status-${user.status}`}>
                  {user.status === 'active' && '✅ Kích hoạt'}
                  {user.status === 'pending_provider' && '⏳ Đang chờ phê duyệt của nhà cung cấp'}
                  {user.status === 'inactive' && '❌ Không hoạt động'}
                </span>
              </div>
            </div>

            <div className="account-stats">
              <div className="stat-item">
                <span className="stat-label01">Thành viên từ</span>
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
            <h3>Chỉnh sửa hồ sơ</h3>
            
            {error && <Message type="error">{error}</Message>}
            {success && <Message type="success">{success}</Message>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Tên đầy đủ *</label>
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
                <small>Email không thể thay đổi</small>
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
                <span>Đổi mật khẩu(Không bắt buộc)</span>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Để trống để giữ mật khẩu hiện tại"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu mới của bạn"
                  minLength="6"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Cập nhật hồ sơ'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          {user.role !== 'admin' && (
            <div className="danger-zone-card">
              <h3>⚠️ Danger Zone</h3>
              <p>
                Một khi bạn đã xóa tài khoản, bạn sẽ không thể quay lại. Tài khoản của bạn sẽ bị vô hiệu hóa và bạn sẽ mất quyền truy cập vào tất cả các khóa học đã đăng ký.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-danger"
                disabled={loading}
              >
                XÓA TÀI KHOẢN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
