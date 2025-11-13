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
      setError(err.response?.data?.message || 'Failed to load courses');
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
      
      setSuccess('Course approved successfully');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve course');
    }
  };

  const handleReject = async (courseId) => {
    if (!window.confirm('Are you sure you want to reject this course?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.put(`/admin/reject-course/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Course rejected');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject course');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to DELETE this course? This action cannot be undone!')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
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

  return (
    <div className="course-management-page">
      <div className="page-header">
        <h1>Course Management</h1>
        <p>Manage all courses in the system</p>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, description, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-stats">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <Message type="info">No courses found</Message>
        ) : (
          filteredCourses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-image">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} />
                ) : (
                  <div className="image-placeholder">📚</div>
                )}
                <span className={`status-badge ${course.status}`}>
                  {course.status}
                </span>
              </div>

              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">
                  {course.description?.substring(0, 100)}
                  {course.description?.length > 100 ? '...' : ''}
                </p>

                <div className="course-meta">
                  <span className="category-badge">{course.category}</span>
                  <span className="price">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>

                <div className="instructor-info">
                  <span className="label">Instructor:</span>
                  <span className="instructor-name">
                    {course.instructor?.fullName || 'N/A'}
                  </span>
                </div>

                <div className="course-stats">
                  <span>👥 {course.enrollmentCount || 0} students</span>
                  <span>⭐ {course.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>

                <div className="action-buttons">
                  <Link to={`/course/${course._id}`} className="btn-view" target="_blank">
                    View
                  </Link>
                  
                  {course.status === 'pending' && (
                    <>
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(course._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(course._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {course.status === 'rejected' && (
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprove(course._id)}
                    >
                      Approve
                    </button>
                  )}

                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(course._id)}
                  >
                    Delete
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
