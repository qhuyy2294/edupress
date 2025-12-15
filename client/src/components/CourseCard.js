import React from 'react';
import { Link } from 'react-router-dom';
import { MdStar } from 'react-icons/md';
import './CourseCard.css';

// HÀM ĐỊNH DẠNG SỐ TIỀN ĐƯỢC THÊM TRỰC TIẾP VÀO ĐÂY
const formatVnd = (number) => {
  if (typeof number !== 'number') return number;
  // Sử dụng locale 'vi-VN' để định dạng dấu chấm là dấu phân cách hàng nghìn.
  return new Intl.NumberFormat('vi-VN').format(number);
};

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <Link to={`/course/${course._id}`}>
        <div className="course-image">
          <img src={course.thumbnailUrl} alt={course.title} />
          <span className="course-category01">{course.category}</span>
        </div>

        <div className="course-content01">
          <h3 className="course-title">{course.title}</h3>

          <p className="course-description">
            {course.description.length > 100
              ? `${course.description.substring(0, 100)}...`
              : course.description}
          </p>

          {course.provider && (
            <div className="course-provider">
              <img
                src={course.provider.avatarUrl || 'https://placehold.co/40x40?text=Avatar'}
                alt={course.provider.fullName}
                className="provider-avatar"
              />
              <span>{course.provider.fullName}</span>
            </div>
          )}

          <div className="course-footer">
            <div className="course-stats">
              {course.averageRating > 0 && (
                <span className="rating">
                  <MdStar size={18} color="#ffc107" />
                  {course.averageRating.toFixed(1)} ({course.totalReviews})
                </span>
              )}
              {course.enrollmentCount > 0 && (
                <span className="enrollment-count">
                  {course.enrollmentCount} học viên
                </span>
              )}
            </div>

            <div className="course-price-section">
              <span className="course-price">
                {course.price === 0 ? 'Miễn phí' : `${formatVnd(course.price)} ₫`}
              </span>
              <span className="btn-view-course">
                Xem khóa học
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;