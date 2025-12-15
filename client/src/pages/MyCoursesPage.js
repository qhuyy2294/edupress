/**
 * MyCoursesPage Component - Enhanced UI
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import CourseCard from '../components/CourseCard';
import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const { isProvider, isCustomer } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      if (isProvider()) {
        response = await courseService.getMyCourses();
        setCourses(response.data);
      } else if (isCustomer()) {
        const enrolledResponse = await courseService.getEnrolledCourses();
        
        // Map initial data
        let initialCourses = enrolledResponse.data.map(enrollment => ({
            ...enrollment.course,
            enrollmentDate: enrollment.enrollmentDate,
            completionPercentage: 0,
        }));

        // Fetch progress in parallel
        const coursesWithProgress = await Promise.all(
            initialCourses.map(async (course) => {
                try {
                    const progressResponse = await progressService.getCourseProgress(course._id);
                    return {
                        ...course,
                        completionPercentage: progressResponse.data.completionPercentage || 0,
                    };
                } catch (err) {
                    console.error(`Failed progress fetch: ${course._id}`, err);
                    return course;
                }
            })
        );
        setCourses(coursesWithProgress);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được khóa học');
    }
  };

  if (loading) return <Loader message="Đang tải dữ liệu..." />;

  // Render Status Badge for Provider
  const renderStatusBadge = (status) => {
    const statusMap = {
      approved: { label: 'Đã duyệt', class: 'approved' },
      pending: { label: 'Đang chờ', class: 'pending' },
      rejected: { label: 'Từ chối', class: 'rejected' },
      draft: { label: 'Nháp', class: 'draft' }
    };
    const info = statusMap[status] || statusMap.pending;
    
    return (
      <div className={`status-badge status-${info.class}`}>
        {info.label}
      </div>
    );
  };

  return (
    <div className="my-courses-page">
      <div className="container">
        {/* Header */}
        <div className="page-header-clean">
          <div className="header-content">
            <h1>{isProvider() ? 'Quản Lý Khóa Học' : 'Khóa Học Của Tôi'}</h1>
            <p>{isProvider() ? 'Theo dõi và quản lý nội dung giảng dạy của bạn' : 'Tiếp tục hành trình chinh phục tri thức'}</p>
          </div>
          {isProvider() && (
            <Link to="/course/create" className="btn-modern btn-create">
              + Tạo khóa học mới
            </Link>
          )}
        </div>

        {error && <Message type="error">{error}</Message>}

        {courses.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-img">
              {/* {isProvider() ? '📂' : '🎓'} */}
            </div>
            <h3>{isProvider() ? 'Bạn chưa có khóa học nào' : 'Bạn chưa đăng ký khóa học nào'}</h3>
            <p>{isProvider() ? 'Hãy bắt đầu chia sẻ kiến thức ngay hôm nay.' : 'Hàng trăm khóa học đang chờ bạn khám phá.'}</p>
            <Link to={isProvider() ? '/create-course' : '/'} className="btn-modern btn-primary-1">
              {isProvider() ? 'Tạo ngay' : 'Khám phá ngay'}
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Section (Provider Only) */}
            {isProvider() && (
              <div className="stats-row">
                <div className="stat-box">
                  <span className="stat-num">{courses.length}</span>
                  <span className="stat-lbl">Tổng khóa học</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num text-success">{courses.filter(c => c.status === 'approved').length}</span>
                  <span className="stat-lbl">Đã duyệt</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num text-warning">{courses.filter(c => c.status === 'pending').length}</span>
                  <span className="stat-lbl">Đang chờ xử lý</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num text-primary">
                    {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
                  </span>
                  <span className="stat-lbl">Học viên</span>
                </div>
              </div>
            )}

            {/* Courses Grid */}
            <div className="courses-grid-modern">
              {courses.map(course => (
                <div key={course._id} className="course-card-modern">
                  {/* Badge Section */}
                  <div className="card-badges">
                    {isProvider() && renderStatusBadge(course.status)}
                  </div>

                  {/* Main Course Content (from Component) */}
                  <div className="card-body-wrapper">
                    <CourseCard course={course} />
                  </div>

                  {/* Footer Info / Progress */}
                  <div className="card-footer-info">
                    {isCustomer() && (
                      <div className="progress-section">
                        <div className="progress-text">
                          <span>Hoàn thành</span>
                          <span>{Math.round(course.completionPercentage)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${course.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="card-actions">
                    {isProvider() ? (
                      <>
                        <Link to={`/course/${course._id}/lessons`} className="btn-modern btn-manage">
                          Quản lý khóa học
                        </Link>
                        <div className="action-row">
                          <Link to={`/course/${course._id}/edit`} className="btn-modern btn-outline">
                            Chỉnh Sửa
                          </Link>
                          <button onClick={() => handleDelete(course._id)} className="btn-modern btn-danger-ghost">
                            Xóa
                          </button>
                        </div>
                      </>
                    ) : (
                      <Link 
                        to={course.lessons && course.lessons.length > 0 ? `/courses/${course._id}/lessons/${course.lessons[0]._id}` : '#'}
                        className="btn-modern btn-primary btn-block"
                      >
                        {course.completionPercentage > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;