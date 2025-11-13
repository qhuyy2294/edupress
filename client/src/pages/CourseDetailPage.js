/**
 * CourseDetailPage Component
 * Detailed view of a single course
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
import reviewService from '../services/reviewService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchReviews();
    if (isAuthenticated) {
      fetchMyReview();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await courseService.getCourseById(id);
      setCourse(response.data);
      
      // Check if user is enrolled
      if (user && response.data.enrolledStudents) {
        const enrolled = response.data.enrolledStudents.some(
          student => student._id === user._id
        );
        setIsEnrolled(enrolled);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getCourseReviews(id);
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await reviewService.getMyReview(id);
      setMyReview(response.data);
    } catch (err) {
      console.error('Failed to load my review:', err);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      setError('');
      await courseService.enrollInCourse(id);
      setSuccessMessage('Successfully enrolled in the course!');
      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loader message="Loading course details..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-hero">
        <div className="container">
          <div className="course-hero-content">
            <span className="course-category-badge">{course.category}</span>
            <h1 className="course-title">{course.title}</h1>
            <p className="course-description">{course.description}</p>
            
            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Instructor:</span>
                <span className="meta-value">{course.provider?.fullName}</span>
              </div>
              {course.averageRating > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Rating:</span>
                  <span className="meta-value">
                    ⭐ {course.averageRating.toFixed(1)} ({course.totalReviews} reviews)
                  </span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Students:</span>
                <span className="meta-value">{course.enrollmentCount} enrolled</span>
              </div>
            </div>
          </div>

          <div className="course-sidebar">
            <div className="course-card-detail">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="course-thumbnail"
              />
              
              <div className="course-price-section">
                <h2 className="course-price">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </h2>
                
                {user?.role === 'customer' && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-enroll"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
                
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-enroll"
                  >
                    Login to Enroll
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-content-section">
          {successMessage && (
            <Message type="success" message={successMessage} />
          )}
          {error && (
            <Message type="error" message={error} />
          )}

          <div className="course-details">
            <h3>About This Course</h3>
            <p>{course.description}</p>

            {course.lessons && course.lessons.length > 0 && (
              <div className="course-lessons">
                <h3>Course Content ({course.lessons.length} lessons)</h3>
                {/* <ul className="lessons-list">
                  {course.lessons.map((lesson, index) => (
                    <li key={lesson._id} className="lesson-item">
                      <span className="lesson-number">{index + 1}</span>
                      <span className="lesson-title">{lesson.title}</span>
                      <span className="lesson-duration">{lesson.duration} min</span>
                    </li>
                  ))}
                </ul> */}

                <ul className="lessons-list">
                    {course.lessons.map((lesson, index) => (
                  <li
                  key={lesson._id}
                  className="lesson-item clickable"
                  onClick={() => navigate(`/courses/${id}/lessons/${lesson._id}`)}
                  >
                  <span className="lesson-number">{index + 1}</span>
                  <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-duration">{lesson.duration} min</span>
                  </li>
                  ))}
                </ul>

              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="course-reviews-section">
            <div className="reviews-header">
              <h3>Student Reviews</h3>
              {isEnrolled && !myReview && (
                <button
                  className="btn-write-review"
                  onClick={() => navigate(`/courses/${id}/review`)}
                >
                  Write a Review
                </button>
              )}
              {isEnrolled && myReview && (
                <button
                  className="btn-edit-review"
                  onClick={() => navigate(`/courses/${id}/review`)}
                >
                  Edit My Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this course!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        {review.user.avatarUrl ? (
                          <img
                            src={review.user.avatarUrl}
                            alt={review.user.fullName}
                            className="reviewer-avatar"
                          />
                        ) : (
                          <div className="reviewer-avatar-placeholder">
                            {review.user.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="reviewer-name">{review.user.fullName}</h4>
                          <div className="review-rating">
                            {'⭐'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
