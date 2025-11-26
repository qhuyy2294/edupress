/**
 * CourseReviewPage Component
 * Form for writing or editing a course review
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../services/reviewService';
import courseService from '../services/courseService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CourseReviewPage.css';

const CourseReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch course details
      const courseResponse = await courseService.getCourseById(id);
      setCourse(courseResponse.data);

      // Fetch existing review if any
      try {
        const reviewResponse = await reviewService.getMyReview(id);
        if (reviewResponse.data) {
          setExistingReview(reviewResponse.data);
          setRating(reviewResponse.data.rating);
          setComment(reviewResponse.data.comment);
        }
      } catch (err) {
        // No existing review - that's ok
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được thông tin chi tiết về khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.trim().length < 10) {
      setError('Bình luận đánh giá phải dài ít nhất 10 ký tự');
      return;
    }

    if (comment.length > 500) {
      setError('Bình luận đánh giá không được vượt quá 500 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (existingReview) {
        // Update existing review
        await reviewService.updateReview(existingReview._id, {
          rating,
          comment,
        });
        setSuccessMessage('Đánh giá đã được cập nhật thành công!');
      } else {
        // Create new review
        await reviewService.createReview({
          courseId: id,
          rating,
          comment,
        });
        setSuccessMessage('Đã gửi đánh giá thành công!');
      }

      setTimeout(() => {
        navigate(`/courses/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá của mình không?')) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await reviewService.deleteReview(existingReview._id);
      setSuccessMessage('Đánh giá đã được xóa thành công!');

      setTimeout(() => {
        navigate(`/courses/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được đánh giá');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Đang tải..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="course-review-page">
      <div className="container">
        <div className="review-form-wrapper">
          <button
            className="btn-back"
            onClick={() => navigate(`/courses/${id}`)}
          >
            ← Quay lại khóa học
          </button>

          <div className="course-info-header">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="course-thumb-small"
            />
            <div>
              <h2>{course.title}</h2>
              <p className="course-instructor">by {course.provider?.fullName}</p>
            </div>
          </div>

          <div className="review-form-card">
            <h1 className="form-title">
              {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h1>

            {successMessage && (
              <Message type="success" message={successMessage} />
            )}
            {error && <Message type="error" message={error} />}

            <form onSubmit={handleSubmit}>
              {/* Rating Selection */}
              <div className="form-group">
                <label className="form-label">Đánh giá *</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${
                        star <= (hoveredRating || rating) ? 'active' : ''
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="rating-text">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="form-group">
                <label className="form-label">Đánh giá của bạn *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Chia sẻ kinh nghiệm của bạn với khóa học này... (10-500 ký tự)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="6"
                  required
                />
                <span className="char-count">
                  {comment.length}/500 ký tự
                </span>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(`/courses/${id}`)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                
                {existingReview && (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    Xóa Đánh giá
                  </button>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Submitting...'
                    : existingReview
                    ? 'Update Review'
                    : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReviewPage;
