/**
 * CourseManagementPage Component
 * Admin page to manage all courses - view, search, filter, approve/reject
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CourseManagementPage.css';

const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending, rejected
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Available categories (same as CreateCoursePage)
  const categories = [
    'Programming',
    'Business',
    'Design',
    'Marketing',
    'Photography',
    'Music',
    'Language',
    'Health & Fitness',
    'Other'
  ];

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend returns { success, count, data } - we need the data array
      setCourses(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.put(`/admin/approve-course/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Khóa học đã được phê duyệt thành công');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  const handleReject = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối khóa học này không?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.put(`/admin/reject-course/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Khóa học bị từ chối');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối khóa học');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA khóa học này không? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Khóa học đã xóa thành công');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được khóa học');
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower) ||
      course.instructor?.fullName?.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all' && course.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && course.category !== categoryFilter) return false;

    return true;
  });

  if (loading) {
    return <Loader />;
  }

  // HÀM ĐỊNH DẠNG SỐ TIỀN ĐƯỢC THÊM TRỰC TIẾP VÀO ĐÂY
  const formatVnd = (number) => {
    if (typeof number !== 'number') return number;
    // Sử dụng locale 'vi-VN' để định dạng dấu chấm là dấu phân cách hàng nghìn.
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  return (
    <div className="course-management-page">
      <div className="breadcrumb-nav">
        <Link to="/admin/dashboard" className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
            Dashboard
        </Link>
      </div>

      <div className="page-header05">
        <h1>Quản lý khóa học</h1>
        <p>Quản lý tất cả các khóa học trong hệ thống</p>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      {/* Filters */}
      <div className="filters-section01">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="approved">Đã được duyệt</option>
            <option value="pending">Đang chờ</option>
            <option value="rejected">Bị từ chối</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Thể loại</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Tất cả thể loại</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-stats">
          Hiển thị {filteredCourses.length} của {courses.length} khóa học
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <Message type="info">Không tìm thấy khóa học nào</Message>
        ) : (
          filteredCourses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-image">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} />
                ) : (
                  <div className="image-placeholder">📚</div>
                )}
                <span className={`status-badge1 ${course.status}`}>
                  {course.status}
                </span>
              </div>

              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description02">
                  {course.description?.substring(0, 100)}
                  {course.description?.length > 100 ? '...' : ''}
                </p>

                <div className="course-meta">
                  <span className="category-badge">{course.category}</span>
                  <span className="price">
                    {course.price === 0 ? 'Miễn phí' : `${formatVnd(course.price)} ₫`}
                  </span>
                </div>

                <div className="instructor-info">
                  <span className="label">Giảng viên:</span>
                  <span className="instructor-name">
                    {course.provider?.fullName || 'N/A'}
                  </span>
                </div>

                <div className="course-stats">
                  <span>👥 {course.enrollmentCount || 0} học viên </span>
                  <span>⭐ {course.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>

                <div className="action-buttons">
                  <Link to={`/course/${course._id}`} className="btn-view1" target="_blank">
                    Xem
                  </Link>
                  
                  {course.status === 'pending' && (
                    <>
                      <button 
                        className="btn-approve2"
                        onClick={() => handleApprove(course._id)}
                      >
                        Đồng ý
                      </button>
                      <button 
                        className="btn-reject2"
                        onClick={() => handleReject(course._id)}
                      >
                        Từ chối
                      </button>
                    </>
                  )}

                  {course.status === 'rejected' && (
                    <button 
                      className="btn-approve2"
                      onClick={() => handleApprove(course._id)}
                    >
                      Đồng ý
                    </button>
                  )}

                  <button 
                    className="btn-delete2"
                    onClick={() => handleDelete(course._id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseManagementPage;
