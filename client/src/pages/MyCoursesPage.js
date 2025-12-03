/**
 * MyCoursesPage Component
 * Shows enrolled courses for customers or created courses for providers
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
import progressService from '../services/progressService'
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
        
        let initialCourses = enrolledResponse.data.map(enrollment => ({
            ...enrollment.course,
            enrollmentDate: enrollment.enrollmentDate,
            completionPercentage: 0,
        }));
        const coursesWithProgress = await Promise.all(
            initialCourses.map(async (course) => {
                try {
                    const progressResponse = await progressService.getCourseProgress(course._id);
                    return {
                        ...course,
                        completionPercentage: progressResponse.data.completionPercentage,
                    };
                } catch (err) {
                    console.error(`Failed to fetch progress for course ${course._id}:`, err);
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này không?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được khóa học');
    }
  };

  if (loading) {
    return <Loader message="Đang tải khóa học của bạn..." />;
  }

  return (
    <div className="my-courses-page">
      <div className="container">
        <div className="page-header06">
          <div>
            <h1>
              {isProvider() ? '📚 Các khóa học của tôi' : 'Các khóa học đã đăng ký'}
            </h1>
            <p className="page-subtitle">
              {isProvider()
                ? 'Quản lý các khóa học của bạn và theo dõi hiệu suất của chúng'
                : 'Tiếp tục học từ nơi bạn dừng lại'}
            </p>
          </div>
          {isProvider() && (
            <div className="provider-actions">
              {/*
              <Link to="/provider/revenue" className="btn btn-secondary">
                📊 Xem doanh thu
              </Link>
              */}
              <Link to="/course/create" className="btn btn-primary">
                + Tạo khóa học mới
              </Link>
            </div>
          )}
        </div>

        {error && <Message type="error">{error}</Message>}

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {isProvider() ? '📝' : '🎯'}
            </div>
            <h2>
              {isProvider() ? 'Chưa có khóa học nào' : 'Không có khóa học nào được đăng ký'}
            </h2>
            <p>
              {isProvider()
                ? 'Bắt đầu tạo khóa học đầu tiên của bạn để chia sẻ kiến ​​thức'
                : 'Khám phá danh mục khóa học của chúng tôi và bắt đầu học ngay hôm nay'}
            </p>
            <Link
              to={isProvider() ? '/create-course' : '/'}
              className="btn btn-primary"
            >
              {isProvider() ? 'Tạo khóa học' : 'Duyệt các khóa học'}
            </Link>
          </div>
        ) : (
          <>
            <div className="courses-stats">
              <div className="stat-card">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">
                  {isProvider() ? 'Tổng số khóa học' : 'Khóa học đã đăng ký'}
                </div>
              </div>
              {isProvider() && (
                <>
                  <div className="stat-card">
                    <div className="stat-number">
                      {courses.filter(c => c.status === 'approved').length}
                    </div>
                    <div className="stat-label">Đã duyệt</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {courses.filter(c => c.status === 'pending').length}
                    </div>
                    <div className="stat-label">Đang chờ</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
                    </div>
                    <div className="stat-label">Tổng số học viên</div>
                  </div>
                </>
              )}
            </div>

            <div className="courses-grid">
                {courses.map(course => (
                  <div key={course._id} className="course-item">
                    {/* Sử dụng completionPercentage */}
                    {isCustomer() && course.completionPercentage !== undefined && (
                      <div className="progress-badge">
                        {course.completionPercentage}% Hoàn thành
                      </div>
                    )}
                    {isProvider() && (
                      <div className={`status-badge status-${course.status}`}>
                        {course.status}
                      </div>
                    )}
                    <CourseCard course={course} />
                    {isProvider() && (
                      <div className="course-actions">
                        {/* Nút Quản lý khóa học (Full width) */}
                        <Link
                          to={`/course/${course._id}/lessons`}
                          className="btn btn-primary btn-sm"
                        >
                          Quản lý khóa học
                        </Link>
                        {/* Nhóm Chỉnh sửa và Xóa (Căn phải) */}
                        <div className="edit-delete-group">
                            <Link
                              to={`/course/${course._id}/edit`}
                              className="btn btn-secondary btn-sm"
                            >
                              Chỉnh sửa
                            </Link>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Xóa
                            </button>
                        </div>
                      </div>
                    )}
                    {!isProvider() && course.lessons && course.lessons.length > 0 && (
                      <div className="course-actions">
                        <Link
                          to={`/courses/${course._id}/lessons/${course.lessons[0]._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Tiếp tục học →
                        </Link>
                      </div>
                    )}
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