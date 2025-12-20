/**
 * RevenueReportPage Component
 * Provider analytics and revenue dashboard
 */

import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
import orderService from '../services/orderService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './RevenueReportPage.css';

// HÀM ĐỊNH DẠNG SỐ TIỀN ĐƯỢC THÊM TRỰC TIẾP VÀO ĐÂY
const formatVnd = (number) => {
  if (typeof number !== 'number') return number;
  // Sử dụng locale 'vi-VN' để định dạng dấu chấm là dấu phân cách hàng nghìn.
  return new Intl.NumberFormat('vi-VN').format(number);
};
// KẾT THÚC HÀM ĐỊNH DẠNG

const RevenueReportPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalStats, setTotalStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch courses
      const response = await courseService.getMyCourses();
      const coursesData = response.data;
      setCourses(coursesData);

      // Fetch revenue stats from orders
      const revenueData = await orderService.getRevenueStats();
      setRevenueStats(revenueData);

      // Calculate total stats (LOGIC CŨ: DOANH THU TIỀM NĂNG: enrollment * price)
      const stats = coursesData.reduce(
        (acc, course) => {
          acc.totalEnrollments += course.enrollmentCount || 0;
          // Revenue calculation here uses raw numbers
          acc.totalRevenue += (course.enrollmentCount || 0) * (course.price || 0);
          acc.averageRating += course.averageRating || 0;
          return acc;
        },
        { totalEnrollments: 0, totalRevenue: 0, averageRating: 0 }
      );

      stats.totalCourses = coursesData.length;
      stats.averageRating = coursesData.length > 0 
        ? stats.averageRating / coursesData.length 
        : 0;

      setTotalStats(stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="revenue-report-page">
      <div className="page-header08">
        <h1>Doanh thu & Phân tích</h1>
        <p>Theo dõi hiệu suất khóa học và thu nhập của bạn</p>
      </div>

      {error && <Message type="error">{error}</Message>}

      {/* Revenue Stats from Orders - HIỂN THỊ LOGIC DOANH THU TIỀM NĂNG (từ totalStats) */}
      {revenueStats && (
        <div className="revenue-breakdown">
          <h2>Thống kê từ đơn hàng đã duyệt và Tiềm năng</h2>
          <div className="summary-grid">
            
            {/* Đã ĐỔI LOGIC: Sử dụng totalStats.totalRevenue (Doanh thu tiềm năng) */}
            <div className="summary-card card-revenue">
              <div className="card-icon">💵</div>
              <div className="card-content">
                <h3>Doanh thu tiềm năng</h3>
                <p className="stat-value">{formatVnd(totalStats.totalRevenue)} ₫</p>
                <span className="stat-detail">Dựa trên {totalStats.totalEnrollments} lượt đăng ký</span>
              </div>
            </div>

            <div className="summary-card card-provider">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>{user?.role === 'admin' ? 'Provider nhận (90%)' : 'Bạn nhận (90%)'}</h3>
                {/* LOGIC NGUYÊN BẢN: revenueStats.providerRevenue (90% tổng tiền đơn hàng đã duyệt) */}
                <p className="stat-value">{formatVnd(revenueStats.providerRevenue)} ₫</p>
                <span className="stat-detail">90% Tổng doanh thu đã duyệt</span>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="summary-card card-admin">
                <div className="card-icon">🏢</div>
                <div className="card-content">
                  <h3>Hoa hồng Admin (10%)</h3>
                  <p className="stat-value">{formatVnd(revenueStats.adminCommission)} ₫</p>
                  <span className="stat-detail">10% Tổng doanh thu đã duyệt</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card card-courses">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3>Tổng số khóa học</h3>
            <p className="stat-value">{totalStats.totalCourses}</p>
          </div>
        </div>

        <div className="summary-card card-students">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Tổng số học viên</h3>
            <p className="stat-value">{totalStats.totalEnrollments}</p>
          </div>
        </div>

        <div className="summary-card card-rating">
          <div className="card-icon">⭐</div>
          <div className="card-content">
            <h3>Đánh giá trung bình</h3>
            <p className="stat-value">{totalStats.averageRating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="performance-section">
        <h2>Hiệu suất khóa học</h2>
        
        {courses.length === 0 ? (
          <Message type="info">Không tìm thấy khóa học nào. Hãy tạo khóa học đầu tiên của bạn để bắt đầu kiếm tiền!</Message>
        ) : (
          <div className="table-container">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Trạng thái</th>
                  <th>Giá</th>
                  <th>Học viên</th>
                  <th>Doanh thu</th>
                  <th>Đánh giá</th>
                  <th>Nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => {
                  const revenue = (course.enrollmentCount || 0) * (course.price || 0);
                  return (
                    <tr key={course._id}>
                      <td>
                        <div className="course-info">
                          <strong>{course.title}</strong>
                          <span className="course-category">{course.category}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${course.status}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="price-cell">
                        {course.price === 0 ? (
                          <span className="free-badge">Free</span>
                        ) : (
                          `${formatVnd(course.price)} ₫`
                        )}
                      </td>
                      <td className="number-cell">{course.enrollmentCount || 0}</td>
                      <td className="revenue-cell">{formatVnd(revenue)} ₫</td>
                      <td className="rating-cell">
                        {course.averageRating ? (
                          <>
                            ⭐ {course.averageRating.toFixed(1)}
                          </>
                        ) : (
                          <span className="no-rating">N/A</span>
                        )}
                      </td>
                      <td className="number-cell">{course.reviewCount || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Performers */}
      {courses.length > 0 && (
        <div className="top-performers-section">
          <h2>Top Performers</h2>
          <div className="top-performers-grid">
            {/* Most Students */}
            <div className="top-card">
              <h3>🏆 Nhiều học viên nhất</h3>
              {courses
                .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
                .slice(0, 3)
                .map((course, index) => (
                  <div key={course._id} className="top-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="course-name">{course.title}</span>
                    <span className="course-value">{course.enrollmentCount || 0} học viên</span>
                  </div>
                ))}
            </div>

            {/* Highest Revenue - Dựa trên Doanh thu tiềm năng của từng khóa */}
            <div className="top-card">
              <h3>💵 Doanh thu cao nhất</h3>
              {courses
                .sort((a, b) => {
                  const revenueA = (a.enrollmentCount || 0) * (a.price || 0);
                  const revenueB = (b.enrollmentCount || 0) * (b.price || 0);
                  return revenueB - revenueA;
                })
                .slice(0, 3)
                .map((course, index) => {
                  const revenue = (course.enrollmentCount || 0) * (course.price || 0);
                  return (
                    <div key={course._id} className="top-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="course-name">{course.title}</span>
                      <span className="course-value">{formatVnd(revenue)} ₫</span>
                    </div>
                  );
                })}
            </div>

            {/* Best Rated */}
            <div className="top-card">
              <h3>⭐ Đánh giá cao nhất</h3>
              {courses
                .filter(c => c.averageRating > 0)
                .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                .slice(0, 3)
                .map((course, index) => (
                  <div key={course._id} className="top-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="course-name">{course.title}</span>
                    <span className="course-value">⭐ {course.averageRating.toFixed(1)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueReportPage;