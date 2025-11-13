/**
 * Discount Management Page
 * Provider can create and manage discount codes
 */

import React, { useState, useEffect } from 'react';
import discountService from '../services/discountService';
import courseService from '../services/courseService';
import './DiscountManagementPage.css';

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
      setError(err.response?.data?.message || 'Failed to load data');
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
        setSuccess('Discount updated successfully! ✅');
      } else {
        await discountService.createDiscount(data);
        setSuccess('Discount created successfully! 🎉');
      }

      setTimeout(() => {
        setShowForm(false);
        setEditingDiscount(null);
        resetForm();
        fetchData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save discount');
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
    if (!window.confirm('Are you sure you want to delete this discount?')) return;

    setError('');
    try {
      await discountService.deleteDiscount(id);
      setSuccess('Discount deleted successfully! 🗑️');
      setTimeout(() => setSuccess(''), 2000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete discount');
    }
  };

  const handleToggle = async (id) => {
    setError('');
    try {
      await discountService.toggleDiscountStatus(id);
      setSuccess('Status updated! 🔄');
      setTimeout(() => setSuccess(''), 2000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status');
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
    return <div className="loading">Loading discounts...</div>;
  }

  return (
    <div className="discount-management-page">
      <div className="page-header">
        <h1>Discount Code Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingDiscount(null);
            resetForm();
          }}
        >
          + Create Discount Code
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="discount-form-modal">
          <div className="discount-form-container">
            <h2>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</h2>
            <form onSubmit={handleSubmit} className="discount-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SUMMER2024"
                    required
                    disabled={editingDiscount}
                  />
                </div>

                <div className="form-group">
                  <label>Course *</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                    disabled={editingDiscount}
                  >
                    <option value="">Select course</option>
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
                  <label>Discount Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Value * {formData.type === 'percentage' ? '(%)' : '(VND)'}
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
                  <label>Max Uses (optional)</label>
                  <input
                    type="number"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
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
                <label>Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="200"
                  placeholder="Brief description of this discount..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingDiscount ? 'Update' : 'Create'} Discount
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Course:</label>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="discounts-list">
        {discounts.length === 0 ? (
          <div className="no-discounts">
            <p>No discount codes found.</p>
            <p>Create your first discount to start promoting your courses!</p>
          </div>
        ) : (
          <div className="discounts-table">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Uses</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                        {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </td>
                      <td>
                        {discount.type === 'percentage'
                          ? `${discount.value}%`
                          : `${discount.value.toLocaleString()} VND`}
                      </td>
                      <td>
                        {discount.usedCount}
                        {discount.maxUses ? ` / ${discount.maxUses}` : ' / ∞'}
                      </td>
                      <td className="date-cell">
                        <div>{new Date(discount.startDate).toLocaleDateString()}</div>
                        <div>{new Date(discount.endDate).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            discount.active && !isExpired && !isNotStarted && !isMaxedOut
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {isExpired
                            ? 'Expired'
                            : isNotStarted
                            ? 'Not Started'
                            : isMaxedOut
                            ? 'Max Reached'
                            : discount.active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(discount)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-toggle"
                          onClick={() => handleToggle(discount._id)}
                          title={discount.active ? 'Deactivate' : 'Activate'}
                        >
                          {discount.active ? '🔴' : '🟢'}
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(discount._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
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
