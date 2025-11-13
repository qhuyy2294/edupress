/**
 * CreateCoursePage Component
 * Form for providers to create or edit courses
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CreateCoursePage.css';

const CreateCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Programming',
    thumbnailUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingCourse, setFetchingCourse] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Health & Fitness',
    'Language',
    'Other',
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchCourse();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchCourse = async () => {
    try {
      setFetchingCourse(true);
      const response = await courseService.getCourseById(id);
      const course = response.data;

      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        thumbnailUrl: course.thumbnailUrl || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setFetchingCourse(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditMode) {
        await courseService.updateCourse(id, formData);
        setSuccessMessage('Course updated successfully!');
      } else {
        await courseService.createCourse(formData);
        setSuccessMessage('Course created successfully! Waiting for admin approval.');
      }

      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCourse) {
    return <Loader message="Loading course..." />;
  }

  return (
    <div className="create-course-page">
      <div className="container">
        <div className="create-course-wrapper">
          <button className="btn-back" onClick={() => navigate('/my-courses')}>
            ← Back to My Courses
          </button>

          <div className="create-course-card">
            <h1 className="page-title">
              {isEditMode ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="page-subtitle">
              {isEditMode
                ? 'Update your course information'
                : 'Fill in the details to create your course. All courses must be approved by admin before going live.'}
            </p>

            {successMessage && <Message type="success" message={successMessage} />}
            {error && <Message type="error" message={error} />}

            <form onSubmit={handleSubmit} className="course-form">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Course Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter course title (e.g., Complete Web Development Bootcamp)"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Describe what students will learn in this course..."
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category and Price Row */}
              <div className="form-row">
                {/* Category */}
                <div className="form-group">
                  <label className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="form-group">
                  <label className="form-label">
                    Price (USD) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-hint">Enter 0 for free courses</small>
                </div>
              </div>

              {/* Thumbnail URL */}
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  type="url"
                  name="thumbnailUrl"
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                />
                <small className="form-hint">
                  Provide a direct link to your course thumbnail image
                </small>
                {formData.thumbnailUrl && (
                  <div className="thumbnail-preview">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Thumbnail preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/my-courses')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : isEditMode
                    ? 'Update Course'
                    : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
