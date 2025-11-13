/**
 * LessonManagementPage Component
 * Manage lessons for a course (Provider only)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import lessonService from '../services/lessonService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './LessonManagementPage.css';

const LessonManagementPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for adding/editing lesson
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [courseRes, lessonsRes] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getCourseLessons(courseId),
      ]);

      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      content: '',
    });
    setShowForm(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
      content: lesson.content || '',
    });
    setShowForm(true);
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Lesson title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingLesson) {
        await lessonService.updateLesson(editingLesson._id, formData);
        setSuccessMessage('Lesson updated successfully!');
      } else {
        await lessonService.createLesson({
          courseId,
          ...formData,
        });
        setSuccessMessage('Lesson created successfully!');
      }

      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      setError('');
      await lessonService.deleteLesson(lessonId);
      setSuccessMessage('Lesson deleted successfully!');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return <Loader message="Loading course..." />;
  }

  if (error && !course) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="lesson-management-page">
      <div className="container">
        <button className="btn-back" onClick={() => navigate('/my-courses')}>
          ← Back to My Courses
        </button>

        <div className="page-header">
          <div>
            <h1>📝 Manage Lessons</h1>
            <p className="course-title">{course?.title}</p>
          </div>
          <button className="btn-add-lesson" onClick={handleAddLesson}>
            + Add Lesson
          </button>
        </div>

        {successMessage && <Message type="success" message={successMessage} />}
        {error && <Message type="error" message={error} />}

        {/* Lesson Form */}
        {showForm && (
          <div className="lesson-form-card">
            <h3>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
            <form onSubmit={handleSubmitLesson}>
              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter lesson title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Brief description of the lesson..."
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Video URL</label>
                  <input
                    type="url"
                    name="videoUrl"
                    className="form-input"
                    placeholder="https://youtube.com/embed/..."
                    value={formData.videoUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  name="content"
                  className="form-textarea"
                  placeholder="Detailed lesson content..."
                  rows="4"
                  value={formData.content}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingLesson ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div className="lessons-section">
          <h3>Lessons ({lessons.length})</h3>
          {lessons.length === 0 ? (
            <div className="no-lessons">
              <p>No lessons yet. Click "Add Lesson" to create your first lesson.</p>
            </div>
          ) : (
            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="lesson-card">
                  <div className="lesson-number">{index + 1}</div>
                  <div className="lesson-info">
                    <h4>{lesson.title}</h4>
                    <p className="lesson-meta">
                      {lesson.duration} min
                      {lesson.videoUrl && ' • Has video'}
                    </p>
                    {lesson.description && (
                      <p className="lesson-desc">{lesson.description}</p>
                    )}
                  </div>
                  <div className="lesson-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditLesson(lesson)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteLesson(lesson._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonManagementPage;
