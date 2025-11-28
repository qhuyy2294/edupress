import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBookOpen, FaUserGraduate, FaCoins } from 'react-icons/fa';
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
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (id) => {
    try {
      await adminService.approveProvider(id);
      setSuccessMessage('Pnhà cung cấp đã được chấp thuận thành công');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể chấp thuận nhà cung cấp');
    }
  };

  const handleRejectProvider = async (id) => {
    try {
      await adminService.rejectProvider(id);
      setSuccessMessage('Yêu cầu của nhà cung cấp bị từ chối');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối nhà cung cấp');
    }
  };

  const handleApproveCourse = async (id) => {
    try {
      await adminService.approveCourse(id);
      setSuccessMessage('Khóa học đã được chấp thuận thành công');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể chấp thuận khóa học');
    }
  };

  const handleRejectCourse = async (id) => {
    try {
      await adminService.rejectCourse(id);
      setSuccessMessage('Khóa học bị từ chối');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối khóa học');
    }
  };

  if (loading) {
    return <Loader message="Đang tải bảng điều khiển..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/admin/customers" className="action-btn">
            <span><FaUsers size={20} /></span> Quản lý người dùng
          </Link>
          <Link to="/admin/courses" className="action-btn">
            <span><FaBookOpen size={20} /></span> Quản lý khóa học
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
                <div className="stat-icon"><FaUsers size={24} /></div>
                <div className="stat-info">
                  <h3>Tổng số người dùng</h3>
                  <p className="stat-number">{stats.users.total}</p>
                  <div className="stat-details">
                    <span>Khách hàng: {stats.users.customers}</span>
                    <span>Nhà cung cấp: {stats.users.providers}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-courses">
                <div className="stat-icon"><FaBookOpen size={24} /></div>
                <div className="stat-info">
                  <h3>Tổng số khóa học</h3>
                  <p className="stat-number">{stats.courses.total}</p>
                  <div className="stat-details">
                    <span>Đã duyệt: {stats.courses.approved}</span>
                    <span>Đang chờ: {stats.courses.pending}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-enrollments">
                <div className="stat-icon"><FaUserGraduate size={24} /></div>
                <div className="stat-info">
                  <h3>Tuyển sinh</h3>
                  <p className="stat-number">{stats.enrollments}</p>
                  <div className="stat-details">
                    <span>Active learners</span>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-revenue">
                <div className="stat-icon"><FaCoins size={24} /></div>
                <div className="stat-info">
                  <h3>Tổng doanh thu</h3>
                  <p className="stat-number">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
                    </p>
                  <div className="stat-details">
                    <span>Thu nhập trên nền tảng</span>
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
                      {pendingProviders.length} yêu cầu của nhà cung cấp{pendingProviders.length > 1 ? 's' : ''} đang chờ phê duyệt
                    </span>
                  </div>
                )}
                {pendingCourses.length > 0 && (
                  <div className="alert alert-course">
                    <span className="alert-icon">📝</span>
                    <span className="alert-text">
                      {pendingCourses.length} khóa học{pendingCourses.length > 1 ? '' : ''} đang chờ được đánh giá
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Pending Provider Requests */}
        <div className="dashboard-section">
          <h2>Yêu cầu của nhà cung cấp đang chờ xử lý ({pendingProviders.length})</h2>
          {pendingProviders.length === 0 ? (
            <p className="empty-message">Không có yêu cầu nhà cung cấp đang chờ xử lý</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Ngày tham gia</th>
                    <th>Trạng thái</th>
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
                          Đồng ý
                        </button>
                        <button
                          onClick={() => handleRejectProvider(provider._id)}
                          className="btn-reject"
                        >
                          Từ chối
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
          <h2>Các khóa học đang chờ xử lý ({pendingCourses.length})</h2>
          {pendingCourses.length === 0 ? (
            <p className="empty-message">Không có khóa học nào</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Thể loại</th>
                    <th>Giá</th>
                    <th>Nhà cung cấp</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCourses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.title}</td>
                      <td>{course.category}</td>
                      <td>{course.price}VND</td>
                      <td>{course.provider?.fullName}</td>
                      <td>
                        <button
                          onClick={() => handleApproveCourse(course._id)}
                          className="btn-approve"
                        >
                          Đồng ý
                        </button>
                        <button
                          onClick={() => handleRejectCourse(course._id)}
                          className="btn-reject"
                        >
                          Từ chối
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
