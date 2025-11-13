/**
 * CourseCard Component
 * Displays course information in a card format
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={course.thumbnailUrl} alt={course.title} />
        <span className="course-category">{course.category}</span>
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        
        <p className="course-description">
          {course.description.length > 100
            ? `${course.description.substring(0, 100)}...`
            : course.description}
        </p>

        {course.provider && (
          <div className="course-provider">
            <img
              src={course.provider.avatarUrl || 'default_avatar.png'}
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
                ⭐ {course.averageRating.toFixed(1)} ({course.totalReviews})
              </span>
            )}
            {course.enrollmentCount > 0 && (
              <span className="enrollment-count">
                👥 {course.enrollmentCount} students
              </span>
            )}
          </div>

          <div className="course-price-section">
            <span className="course-price">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </span>
            <Link to={`/course/${course._id}`} className="btn-view-course">
              View Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
