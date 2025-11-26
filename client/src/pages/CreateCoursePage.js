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
      setError(err.response?.data?.message || 'Không tải được khóa học');
    } finally {
      setFetchingCourse(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Giá' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Vui lòng điền vào tất cả các trường bắt buộc');
      return;
    }

    if (formData.price < 0) {
      setError('Giá không thể âm');
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
        setSuccessMessage('Khóa học đã được tạo thành công! Đang chờ quản trị viên phê duyệt.');
      }

      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không lưu được khóa học');
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
            ← Quay lại Khóa học của tôi
          </button>

          <div className="create-course-card">
            <h1 className="page-title">
              {isEditMode ? 'Chỉnh sửa khóa học' : 'Thêm khóa học'}
            </h1>
            <p className="page-subtitle">
              {isEditMode
                ? 'Cập nhật thông tin khóa học của bạn'
                : 'Điền thông tin để tạo khóa học. Tất cả khóa học phải được quản trị viên phê duyệt trước khi được phát hành.'}
            </p>

            {successMessage && <Message type="success" message={successMessage} />}
            {error && <Message type="error" message={error} />}

            <form onSubmit={handleSubmit} className="course-form">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Tên khóa học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Nhập tiêu đề khóa học (ví dụ: Khóa đào tạo phát triển web hoàn chỉnh)"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  Mô tả <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Mô tả những gì sinh viên sẽ học trong khóa học này..."
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
                    Thể loại <span className="required">*</span>
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
                    Giá (VND) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-hint">Nhập 0 cho các khóa học miễn phí</small>
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
                  Cung cấp liên kết trực tiếp đến hình ảnh thu nhỏ của khóa học
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
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : isEditMode
                    ? 'Cập nhật khóa học'
                    : 'Tạo khóa học'}
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
