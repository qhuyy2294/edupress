import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './ProfilePage.css';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaTrashAlt, FaShieldAlt, FaCalendarAlt, FaUserTag } from 'react-icons/fa';
import { MdAdminPanelSettings, MdVerified } from 'react-icons/md';

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        fullName: formData.fullName,
        avatarUrl: formData.avatarUrl,
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setSuccess('Cập nhật hồ sơ thành công!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
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
    if (!window.confirm('CẢNH BÁO: Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản?')) {
      return;
    }

    try {
      setLoading(true);
      await authService.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được tài khoản');
      setLoading(false);
    }
  };

  const renderRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="badge badge-admin"><MdAdminPanelSettings /> Quản trị viên</span>;
      case 'provider': return <span className="badge badge-provider"><FaUserTag /> Nhà cung cấp</span>;
      default: return <span className="badge badge-student"><FaUser /> Học viên</span>;
    }
  };

  if (!user) return <Loader message="Đang tải hồ sơ..." />;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header-mobile">
          <h1>Hồ sơ cá nhân</h1>
        </div>

        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="user-card">
              <div className="user-avatar-wrapper">
                <div className="avatar-circle">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" />
                  ) : (
                    <span className="avatar-initial">{user.fullName?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                {/* <div className="avatar-edit-icon" title="Ảnh đại diện">
                  <FaCamera />
                </div> */}
              </div>
              
              <h2 className="user-name">{user.fullName}</h2>
              <p className="user-email-text">{user.email}</p>
              
              <div className="user-badges">
                {renderRoleBadge(user.role)}
                <span className={`badge status-${user.status}`}>
                  <MdVerified /> {user.status === 'active' ? 'Đã kích hoạt' : user.status}
                </span>
              </div>

              <div className="user-meta">
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="content-card-pro">
              <div className="card-header">
                <h3>Cập nhật thông tin</h3>
                <p>Quản lý thông tin cá nhân và bảo mật</p>
              </div>

              {error && <Message type="error">{error}</Message>}
              {success && <Message type="success">{success}</Message>}

              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-section">
                  <h4 className="section-title">Thông tin cơ bản</h4>
                  
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ tên của bạn"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email (Không thể thay đổi)</label>
                    <div className="input-wrapper disabled">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Avatar URL</label>
                    <div className="input-wrapper">
                      <input
                        type="url"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-divider"></div>

                <div className="form-section">
                  <h4 className="section-title">Đổi mật khẩu</h4>
                  <p className="section-desc">Để trống nếu bạn không muốn đổi mật khẩu</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mật khẩu mới</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Vui lòng nhập mật khẩu mới"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Xác nhận mật khẩu</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? <span className="spinner"></span> : <><span>Lưu thay đổi</span></>}
                  </button>
                </div>
              </form>
            </div>

            {user.role !== 'admin' && (
              <div className="danger-zone">
                <div className="danger-info">
                  <h3><FaTrashAlt /> Xóa tài khoản</h3>
                  <p>Hành động này sẽ xóa vĩnh viễn dữ liệu của bạn và không thể khôi phục.</p>
                </div>
                <button 
                  onClick={handleDeleteAccount} 
                  className="btn-delete"
                  disabled={loading}
                >
                  Xóa tài khoản
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;