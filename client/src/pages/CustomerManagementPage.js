import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CustomerManagementPage.css';
import { Link } from 'react-router-dom';

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [roleFilter, setRoleFilter] = useState('all'); 
  
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
      setCustomers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // const handleBanToggle = async (userId, currentStatus) => {
  //   const actionText = currentStatus === 'active' ? 'vô hiệu hóa' : 'kích hoạt lại';
  //   if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} người dùng này không?`)) {
  //     return;
  //   }
  //   try {
  //     setError(''); setSuccess('');
  //     const token = localStorage.getItem('token');
  //     await api.put(`/admin/users/${userId}/toggle-status`, {}, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setSuccess(`Đã ${actionText} người dùng thành công`);
  //     fetchCustomers();
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
  //   }
  // };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({ fullName: user.fullName || '', email: user.email });
    setError(''); setSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${editingUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cập nhật thông tin thành công');
      setEditingUser(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'admin': return 'Quản trị viên';
      case 'provider': return 'Nhà cung cấp';
      case 'customer': return 'Khách hàng';
      default: return role;
    }
  };

  const getStatusDisplay = (status) => {
    return status === 'inactive' ? 'Đang khóa' : 'Hoạt động';
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      customer.fullName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'inactive' && customer.status !== 'inactive') return false;
      if (statusFilter === 'active' && customer.status !== 'active') return false;
    }
    if (roleFilter !== 'all' && customer.role !== roleFilter) return false;
    return true;
  });

  if (loading) return <Loader message="Đang tải dữ liệu..." />;

  return (
    <div className="customer-management-page fade-in">
      <div className="header-container01">
        <div className="breadcrumb-nav">
          <Link to="/admin/dashboard" className="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Dashboard
          </Link>
        </div>

        <div className="page-header01">
          <div className="title-wrapper">
            <h1>Quản lý người dùng</h1>
            <span className="user-count-badge">{filteredCustomers.length} Users</span>
          </div>
          <p>Theo dõi, quản lý và cập nhật thông tin thành viên hệ thống</p>
        </div>
      </div>

      <div className="main-content-card">
        {error && <Message type="error" message={error} />}
        {success && <Message type="success" message={success} />}

        {/* Filters Bar */}
        <div className="filters-section">
          <div className="search-box01">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã xóa</option>
              </select>
            </div>

            <div className="filter-group">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="provider">Nhà cung cấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="table-container">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Empty" width="60" />
              <p>Không tìm thấy người dùng nào phù hợp</p>
            </div>
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr 
                    key={customer._id} 
                    className={`table-row ${customer.status === 'inactive' ? 'row-inactive' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td>
                      <div className="user-profile">
                        {customer.avatarUrl ? (
                          <img src={customer.avatarUrl} alt="" className="avatar" />
                        ) : (
                          <div className={`avatar-placeholder gradient-${index % 3}`}>
                            {customer.fullName?.charAt(0) || customer.email?.charAt(0)}
                          </div>
                        )}
                        <div className="user-details">
                          <span className="user-name">{customer.fullName || 'Chưa đặt tên'}</span>
                          <span className="user-email">{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${customer.role}`}>
                        {getRoleDisplay(customer.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-indicator ${customer.status || 'active'}`}>
                        <span className="dot"></span>
                        {getStatusDisplay(customer.status || 'active')}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(customer.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit-icon"
                          onClick={() => handleEditClick(customer)}
                          disabled={customer.role === 'admin'}
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        {/* <button 
                          className={`btn-icon btn-ban-icon ${customer.status === 'inactive' ? 'is-banned' : ''}`}
                          onClick={() => handleBanToggle(customer._id, customer.status)}
                          disabled={customer.role === 'admin'}
                          title={customer.status === 'inactive' ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {customer.status === 'inactive' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                          )}
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modern Modal */}
      {editingUser && (
        <div className="modal-backdrop fade-in" onClick={() => setEditingUser(null)}>
          <div className="modal-card slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cập nhật thông tin</h2>
              <button className="btn-close" onClick={() => setEditingUser(null)}>&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    required
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setEditingUser(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary">
                  Lưu thay đổi
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