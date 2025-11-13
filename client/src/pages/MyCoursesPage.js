/**
 * MyCoursesPage Component
 * Shows enrolled courses for customers or created courses for providers
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (isProvider()) {
        // Provider: Get courses they created
        response = await courseService.getMyCourses();
      } else if (isCustomer()) {
        // Customer: Get enrolled courses
        response = await courseService.getEnrolledCourses();
      }

      if (response.success) {
        // If customer, extract course from enrollment
        if (isCustomer()) {
          setCourses(response.data.map(enrollment => ({
            ...enrollment.course,
            progress: enrollment.progress,
            enrollmentDate: enrollment.enrollmentDate,
          })));
        } else {
          setCourses(response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return <Loader message="Loading your courses..." />;
  }

  return (
    <div className="my-courses-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>
              {isProvider() ? '📚 My Courses' : '🎓 My Enrolled Courses'}
            </h1>
            <p className="page-subtitle">
              {isProvider()
                ? 'Manage your courses and track their performance'
                : 'Continue learning from where you left off'}
            </p>
          </div>
          {isProvider() && (
            <div className="provider-actions">
              <Link to="/provider/revenue" className="btn btn-secondary">
                📊 View Revenue
              </Link>
              <Link to="/course/create" className="btn btn-primary">
                + Create New Course
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
              {isProvider() ? 'No courses yet' : 'No enrolled courses'}
            </h2>
            <p>
              {isProvider()
                ? 'Start creating your first course to share your knowledge'
                : 'Explore our course catalog and start learning today'}
            </p>
            <Link
              to={isProvider() ? '/create-course' : '/'}
              className="btn btn-primary"
            >
              {isProvider() ? 'Create Course' : 'Browse Courses'}
            </Link>
          </div>
        ) : (
          <>
            <div className="courses-stats">
              <div className="stat-card">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">
                  {isProvider() ? 'Total Courses' : 'Enrolled Courses'}
                </div>
              </div>
              {isProvider() && (
                <>
                  <div className="stat-card">
                    <div className="stat-number">
                      {courses.filter(c => c.status === 'approved').length}
                    </div>
                    <div className="stat-label">Approved</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {courses.filter(c => c.status === 'pending').length}
                    </div>
                    <div className="stat-label">Pending</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
                    </div>
                    <div className="stat-label">Total Students</div>
                  </div>
                </>
              )}
            </div>

            <div className="courses-grid">
              {courses.map(course => (
                <div key={course._id} className="course-item">
                  {isCustomer() && course.progress !== undefined && (
                    <div className="progress-badge">
                      {course.progress}% Complete
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
                      <Link
                        to={`/course/${course._id}/lessons`}
                        className="btn btn-primary btn-sm"
                      >
                        Manage Lessons
                      </Link>
                      <Link
                        to={`/course/${course._id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {!isProvider() && course.lessons && course.lessons.length > 0 && (
                    <div className="course-actions">
                      <Link
                        to={`/courses/${course._id}/lessons/${course.lessons[0]._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Continue Learning →
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
