import React, { useState, useEffect } from 'react';
import discountService from '../services/discountService';
import courseService from '../services/courseService';
import './DiscountManagementPage.css';
import { FiEdit2, FiTrash2, FiPower } from 'react-icons/fi';

const DiscountManagementPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  
  // Filter states
  const [filterCourse, setFilterCourse] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    courseId: '',
    type: 'percentage',
    value: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourse, filterActive]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterCourse) filters.courseId = filterCourse;
      if (filterActive) filters.active = filterActive;

      const [discountsRes, coursesRes] = await Promise.all([
        discountService.getMyDiscounts(filters),
        courseService.getMyCourses(),
      ]);

      setDiscounts(discountsRes.data);
      setCourses(coursesRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      };

      if (editingDiscount) {
        await discountService.updateDiscount(editingDiscount._id, data);
        setSuccess('Cập nhật mã giảm giá thành công! ✅');
      } else {
        await discountService.createDiscount(data);
        setSuccess('Tạo mã giảm giá thành công! 🎉');
      }

      setTimeout(() => {
        setShowForm(false);
        setEditingDiscount(null);
        resetForm();
        fetchData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu mã giảm giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      courseId: discount.course._id,
      type: discount.type,
      value: discount.value,
      maxUses: discount.maxUses || '',
      startDate: discount.startDate.substring(0, 10),
      endDate: discount.endDate.substring(0, 10),
      description: discount.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) return;

    setError('');
    try {
      await discountService.deleteDiscount(id);
      setSuccess('Đã xóa mã giảm giá thành công! 🗑️');
      setTimeout(() => setSuccess(''), 2000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa mã giảm giá');
    }
  };

  const handleToggle = async (id) => {
    setError('');
    try {
      await discountService.toggleDiscountStatus(id);
      setSuccess('Đã cập nhật trạng thái! 🔄');
      setTimeout(() => setSuccess(''), 2000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      courseId: '',
      type: 'percentage',
      value: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDiscount(null);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Đang tải mã giảm giá...</div>;
  }

  return (
    <div className="discount-management-page">
      <div className="page-header02">
        <h1>Quản Lý Mã Giảm Giá</h1>
        <button
          className="btn1 btn-primary1"
          onClick={() => {
            setShowForm(true);
            setEditingDiscount(null);
            resetForm();
          }}
        >
          + Tạo Mã Giảm Giá
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="discount-form-modal">
          <div className="discount-form-container">
            <h2>{editingDiscount ? 'Chỉnh Sửa Mã' : 'Tạo Mã Mới'}</h2>
            <form onSubmit={handleSubmit} className="discount-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Giảm Giá</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="ví dụ: SUMMER2025"
                    required
                    disabled={editingDiscount}
                  />
                </div>

                <div className="form-group">
                  <label>Khóa Học</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                    disabled={editingDiscount}
                  >
                    <option value="">Chọn khóa học</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại Giảm Giá</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Giá Trị {formData.type === 'percentage' ? '(%)' : '(VND)'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Lượt Dùng Tối Đa (tùy chọn)</label>
                  <input
                    type="number"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Bắt Đầu</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày Kết Thúc</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô Tả (tùy chọn)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="200"
                  placeholder="Mô tả ngắn gọn về mã giảm giá này..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : editingDiscount ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary1" 
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Lọc theo Khóa học:</label>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            <option value="">Tất cả khóa học</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Ngưng hoạt động</option>
          </select>
        </div>
      </div>

      <div className="discounts-list">
        {discounts.length === 0 ? (
          <div className="no-discounts">
            <p>Không tìm thấy mã giảm giá nào.</p>
            <p>Hãy tạo mã giảm giá đầu tiên để bắt đầu quảng bá khóa học của bạn!</p>
          </div>
        ) : (
          <div className="discounts-table">
            <table>
              <thead>
                <tr>
                  <th>Mã Code</th>
                  <th>Khóa Học</th>
                  <th>Loại</th>
                  <th>Giá Trị</th>
                  <th>Lượt Dùng</th>
                  <th>Thời Hạn</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => {
                  const now = new Date();
                  const isExpired = new Date(discount.endDate) < now;
                  const isNotStarted = new Date(discount.startDate) > now;
                  const isMaxedOut = discount.maxUses && discount.usedCount >= discount.maxUses;

                  return (
                    <tr key={discount._id}>
                      <td className="code-cell">
                        <strong>{discount.code}</strong>
                      </td>
                      <td>{discount.course?.title || 'N/A'}</td>
                      <td>
                        {discount.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                      </td>
                      <td>
                        {discount.type === 'percentage'
                          ? `${discount.value}%`
                          : `${discount.value.toLocaleString()} ₫`}
                      </td>
                      <td>
                        {discount.usedCount}
                        {discount.maxUses ? ` / ${discount.maxUses}` : ' / ∞'}
                      </td>
                      <td className="date-cell">
                        <div>{new Date(discount.startDate).toLocaleDateString('vi-VN')}</div>
                        <div>{new Date(discount.endDate).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td>
                        <span
                          className={`status-badge2 ${
                            discount.active && !isExpired && !isNotStarted && !isMaxedOut
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {isExpired
                            ? 'Đã hết hạn'
                            : isNotStarted
                            ? 'Chưa bắt đầu'
                            : isMaxedOut
                            ? 'Hết lượt dùng'
                            : discount.active
                            ? 'Đang hoạt động'
                            : 'Ngưng hoạt động'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <td className="actions-cell">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(discount)}
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 size={18} />
                          </button>

                          <button
                            className="btn-icon btn-toggle"
                            onClick={() => handleToggle(discount._id)}
                            title={discount.active ? 'Ngưng kích hoạt' : 'Kích hoạt'}
                          >
                            <FiPower 
                              size={18} 
                              color={discount.active ? "#2ecc71" : "#e74c3c"} 
                              style={{ fontWeight: 'bold' }}
                            />
                          </button>

                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(discount._id)}
                            title="Xóa"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManagementPage;