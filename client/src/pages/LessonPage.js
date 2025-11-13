/**
 * LessonPage Component
 * Video player page for enrolled students
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './LessonPage.css';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
    // eslint-disable-next-line
  }, [courseId]);

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
    }
    // eslint-disable-next-line
  }, [lessonId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch course details
      const courseResponse = await courseService.getCourseById(courseId);
      setCourse(courseResponse.data);

      // Fetch progress
      const progressResponse = await progressService.getCourseProgress(courseId);
      setProgress(progressResponse.data.progress);
      setCompletionPercentage(progressResponse.data.completionPercentage);

      // Load first lesson if no specific lesson
      if (!lessonId && courseResponse.data.lessons.length > 0) {
        const firstLessonId = courseResponse.data.lessons[0]._id;
        navigate(`/courses/${courseId}/lessons/${firstLessonId}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (id) => {
    try {
      const lesson = course?.lessons.find((l) => l._id === id);
      if (lesson) {
        setCurrentLesson(lesson);
        // Mark as accessed
        await progressService.markLessonAccessed(id);
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
    }
  };

  const handleLessonClick = (lesson) => {
    navigate(`/courses/${courseId}/lessons/${lesson._id}`);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    try {
      const response = await progressService.markLessonCompleted(currentLesson._id);
      setCompletionPercentage(response.data.completionPercentage);
      
      // Update progress state
      const updatedProgress = [...progress];
      const existingIndex = updatedProgress.findIndex(
        (p) => p.lesson._id === currentLesson._id
      );
      
      if (existingIndex >= 0) {
        updatedProgress[existingIndex] = response.data.progress;
      } else {
        updatedProgress.push(response.data.progress);
      }
      
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Failed to mark lesson as completed:', err);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress.some((p) => p.lesson._id === lessonId && p.completed);
  };

  if (loading) {
    return <Loader message="Loading course..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Message type="error" message={error} />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="lesson-page">
      {/* Video Player Section */}
      <div className="video-section">
        {currentLesson ? (
          <>
            <div className="video-container">
              {currentLesson.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  allowFullScreen
                  className="video-player"
                />
              ) : (
                <div className="no-video">
                  <p>📹 Video not available</p>
                </div>
              )}
            </div>

            <div className="lesson-info">
              <div className="lesson-header">
                <div>
                  <h2>{currentLesson.title}</h2>
                  <p className="lesson-description">{currentLesson.description}</p>
                </div>
                <button
                  className={`btn-complete ${
                    isLessonCompleted(currentLesson._id) ? 'completed' : ''
                  }`}
                  onClick={handleMarkComplete}
                  disabled={isLessonCompleted(currentLesson._id)}
                >
                  {isLessonCompleted(currentLesson._id) ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>

              {currentLesson.content && (
                <div className="lesson-content">
                  <h3>Lesson Content</h3>
                  <p>{currentLesson.content}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-lesson-selected">
            <p>Select a lesson from the sidebar to start learning</p>
          </div>
        )}
      </div>

      {/* Sidebar with Lesson List */}
      <div className="lessons-sidebar">
        <div className="course-header-sidebar">
          <button className="btn-back" onClick={() => navigate(`/courses/${courseId}`)}>
            ← Back to Course
          </button>
          <h3>{course.title}</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">{completionPercentage}% Complete</span>
          </div>
        </div>

        <div className="lessons-list-sidebar">
          <h4>Course Content</h4>
          {course.lessons.map((lesson, index) => (
            <div
              key={lesson._id}
              className={`lesson-item-sidebar ${
                currentLesson?._id === lesson._id ? 'active' : ''
              } ${isLessonCompleted(lesson._id) ? 'completed' : ''}`}
              onClick={() => handleLessonClick(lesson)}
            >
              <div className="lesson-number">{index + 1}</div>
              <div className="lesson-details">
                <h5>{lesson.title}</h5>
                <span className="lesson-duration">{lesson.duration} min</span>
              </div>
              {isLessonCompleted(lesson._id) && (
                <span className="completion-icon">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
