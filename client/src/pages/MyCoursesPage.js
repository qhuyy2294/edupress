import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaChalkboardTeacher, FaPlus, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle, FaFileAlt, FaSearch, FaLayerGroup, FaUserGraduate, FaEdit, FaTrash, FaCog, FaPlay, FaExclamationCircle } from 'react-icons/fa';
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

  const renderStatusBadge = (status) => {
    const statusMap = {
      approved: { label: 'Đã duyệt', class: 'approved', icon: <FaCheckCircle /> },
      pending: { label: 'Đang chờ', class: 'pending', icon: <FaClock /> },
      rejected: { label: 'Từ chối', class: 'rejected', icon: <FaTimesCircle /> },
      draft: { label: 'Nháp', class: 'draft', icon: <FaFileAlt /> }
    };
    const info = statusMap[status] || statusMap.pending;
    
    return (
      <div className={`status-badge status-${info.class}`}>
        <span className="badge-icon">{info.icon}</span>
        <span>{info.label}</span>
      </div>
    );
  };

  if (loading) return <Loader message="Đang tải dữ liệu..." />;

  return (
    <div className="my-courses-page">
      <div className="container">
        <div className="page-header06">
          <div>
            <h1>
              {isProvider() ?  <span>Kho tàng khóa học</span> : <span>Khóa học của tôi</span> }
            </h1>
            <p className="page-subtitle">
              {isProvider()
                ? 'Quản lý, theo dõi hiệu suất và cập nhật nội dung giảng dạy.'
                : 'Tiếp tục hành trình chinh phục tri thức của bạn.'}
            </p>
          </div>
          {isProvider() && (
            <div className="provider-actions">
              <Link to="/course/create" className="btn btn-primary">
                <FaPlus /> Tạo khóa học mới
              </Link>
            </div>
          )}
        </div>

        {error && <Message type="error">{error}</Message>}

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {isProvider() ? <FaChalkboardTeacher /> : <FaSearch />}
            </div>
            <h2>
              {isProvider() ? 'Chưa có khóa học nào' : 'Bạn chưa đăng ký khóa học nào'}
            </h2>
            <p>
              {isProvider()
                ? 'Hãy bắt đầu tạo khóa học đầu tiên để chia sẻ kiến thức.'
                : 'Khám phá hàng trăm khóa học hấp dẫn và bắt đầu học ngay hôm nay.'}
            </p>
            <Link
              to={isProvider() ? '/create-course' : '/'}
              className="btn btn-primary"
            >
              {isProvider() ? <><FaPlus /> Tạo khóa học ngay</> : <><FaSearch /> Tìm khóa học</>}
            </Link>
          </div>
        ) : (
          <>
            <div className="courses-stats">
              <div className="stat-card01">
                <div className="stat-number01">{courses.length}</div>
                <div className="stat-label">
                  {isProvider() ? 'Tổng khóa học' : 'Đã đăng ký'}
                </div>
                <div className="stat-icon-bg"><FaBook /></div>
              </div>
              {isProvider() && (
                <>
                  <div className="stat-card01">
                    <div className="stat-number01">
                      {courses.filter(c => c.status === 'approved').length}
                    </div>
                    <div className="stat-label">Đã duyệt</div>
                    <div className="stat-icon-bg success"><FaCheckCircle /></div>
                  </div>
                  <div className="stat-card01">
                    <div className="stat-number01">
                      {courses.filter(c => c.status === 'pending').length}
                    </div>
                    <div className="stat-label">Đang chờ</div>
                    <div className="stat-icon-bg warning"><FaClock /></div>
                  </div>
                  <div className="stat-card01">
                    <div className="stat-number01">
                      {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
                    </div>
                    <div className="stat-label">Học viên</div>
                    <div className="stat-icon-bg info"><FaUserGraduate /></div>
                  </div>
                </>
              )}
            </div>

            <div className="courses-grid">
                {courses.map(course => (
                  <div key={course._id} className="course-item">
                    {isCustomer() && course.completionPercentage !== undefined && (
                      <div className="progress-badge">
                        <FaChartLine style={{ marginRight: '4px' }}/> {course.completionPercentage}%
                      </div>
                    )}
                
                    {isProvider() && renderStatusBadge(course.status)}

                    <CourseCard course={course} />
                    
                    {isProvider() && (
                      <div className="course-actions">
                        <Link
                          to={`/course/${course._id}/lessons`}
                          className="btn btn-primary btn-sm"
                        >
                          <FaCog /> Quản lý khóa học
                        </Link>
                        <div className="edit-delete-group">
                            <Link
                              to={`/course/${course._id}/edit`}
                              className="btn btn-secondary btn-sm"
                            >
                              <FaEdit /> Sửa
                            </Link>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="btn btn-danger btn-sm"
                            >
                              <FaTrash /> Xóa
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
                          <FaPlay /> Tiếp tục học
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