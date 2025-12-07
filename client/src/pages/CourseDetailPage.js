import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import courseService from '../services/courseService';
import reviewService from '../services/reviewService';
import cartService from '../services/cartService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CourseDetailPage.css';
import { MdStar, MdStarBorder } from "react-icons/md";


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
  const [addingToCart, setAddingToCart] = useState(false);

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
      setError(err.response?.data?.message || 'Không tải được thông tin chi tiết về khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getCourseReviews(id);
      setReviews(response.data);
    } catch (err) {
      console.error('Không tải được đánh giá:', err);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await reviewService.getMyReview(id);
      setMyReview(response.data);
    } catch (err) {
      console.error('Không tải được bài đánh giá của tôi:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      setError('');
      await cartService.addToCart(id);
      setSuccessMessage('Đã thêm vào giỏ hàng!');
      setTimeout(() => {
        navigate('/cart');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
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
      setSuccessMessage('Đã đăng ký khóa học thành công!');
      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đăng ký khóa học');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loader message="Đang tải thông tin chi tiết về khóa học..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  const calculateRatingStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: [
          { star: 5, count: 0, percent: 0 },
          { star: 4, count: 0, percent: 0 },
          { star: 3, count: 0, percent: 0 },
          { star: 2, count: 0, percent: 0 },
          { star: 1, count: 0, percent: 0 },
        ]
      };
    }
    const total = reviews.length;
    // Tính điểm trung bình
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = (sum / total).toFixed(1); 
    // Tính toán phân phối đánh giá
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
    reviews.forEach(review => {
      const round = Math.round(review.rating); // Làm tròn điểm đánh giá
      if (counts[round] !== undefined) {
        counts[round]++;
      }
    });

    const distribution = Object.keys(counts)
      .sort((a, b) => b - a) // Sắp xếp từ cao đến thấp
      .map(star => ({
        star: parseInt(star), // Số sao
        count: counts[star], // Số lượng đánh giá
        percent: ((counts[star] / total) * 100).toFixed(0) // Tính phần trăm
      }));

    return { average, total, distribution }; // Trả về điểm trung bình, tổng số đánh giá và phân phối
  };
  // Gọi hàm tính toán mỗi khi reviews thay đổi (hoặc tính trực tiếp khi render)
  const stats = calculateRatingStats(reviews);

  return (
    <div className="course-detail-page">
      <div className="course-hero">
        <div className="container">
          <div className="course-hero-content">
            <span className="course-category-badge">{course.category}</span>
            <h1 className="course-title01">{course.title}</h1>
            <p className="course-description01">{course.description}</p>
            
            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Giảng viên:</span>
                <span className="meta-value">{course.provider?.fullName}</span>
              </div>
              {course.averageRating > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Đánh giá:</span>
                  <span className="meta-value">
                    ⭐ {course.averageRating.toFixed(1)} ({course.totalReviews} reviews)
                  </span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Học sinh:</span>
                <span className="meta-value">{course.enrollmentCount} đã đăng ký</span>
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
              
              <div className="course-price-section01">
                <h2 className="course-price01">
                  {course.price === 0 ? 'Miễn phí' : `${course.price}₫`}
                </h2>
                
                {user?.role === 'customer' && !isEnrolled && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="btn-add-cart"
                    >
                      <FaShoppingCart /> {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </button>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="btn-enroll"
                    >
                      {enrolling ? 'Đang đăng ký...' : 'Mua ngay'}
                    </button>
                  </>
                )}
                {isEnrolled && (
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="btn-enrolled"
                  >
                    Đã đăng ký - Vào học
                  </button>
                )}
                
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-enroll"
                  >
                    Đăng nhập để tham gia
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
            <h3>Giới thiệu về khóa học này</h3>
            <p>{course.description}</p>

            {course.lessons && course.lessons.length > 0 && (
              <div className="course-lessons">
                <h3>Nội dung khóa học({course.lessons.length} lessons)</h3>
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
              <h3>Đánh giá của học viên</h3>
              {/* {isEnrolled && !myReview && ( */}
                <button
                  className="btn-write-review"
                  onClick={() => navigate(`/courses/${id}/review`)}
                >
                  Viết đánh giá
                </button>
              {/* )} */}
              {isEnrolled && myReview && (
                <button
                  className="btn-edit-review"
                  onClick={() => navigate(`/courses/${id}/review`)}
                >
                  Chỉnh sửa đánh giá của tôi
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này!</p>
            ) : (
              <div className="reviews-list">
                <div className="rating-bars">
                  {stats.distribution.map((item) => (
                    <div key={item.star} className="rating-bar-item">
                      <div className="star-label">{item.star} sao</div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${item.percent}%` }} 
                        ></div>
                      </div>
                      <div className="rating-count">
                        {item.percent}% ({item.count})
                      </div>
                    </div>
                  ))}
                </div>

                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-avatar-section">
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
                    </div>

                    <div className="review-content">
                      <div className="review-header">
                        <h4 className="reviewer-name">{review.user.fullName}</h4>
                        <span className="review-date">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </span>
                      </div>
                      <div className="review-row">
                        <p className="review-comment">{review.comment}</p>
                        <div className="review-rating">
                          {[...Array(5)].map((_, index) => {
                            return index < review.rating ? (
                              <MdStar key={index} size={18} color="#ffc107" />
                              ) : (
                              <MdStarBorder key={index} size={18} color="#cbd5e1" />
                            );
                          })}
                        </div>
                      </div>
                    </div>
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
