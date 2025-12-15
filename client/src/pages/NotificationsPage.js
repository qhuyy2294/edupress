/**
 * NotificationsPage Component
 * Display user notifications with filtering and actions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
      const response = await notificationService.getMyNotifications(params);
      
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setError('');
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu là đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setError('');
      setSuccess('');
      await notificationService.markAllAsRead();
      setSuccess('Tất cả thông báo được đánh dấu là đã đọc');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu tất cả là đã đọc');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) {
      return;
    }

    try {
      setError('');
      await notificationService.deleteNotification(notificationId);
      setSuccess('Thông báo đã bị xóa');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được thông báo');
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo đã đọc không?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await notificationService.clearReadNotifications();
      setSuccess(`Cleared ${response.data.deletedCount} read notifications`);
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được thông báo');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return '🎓';
      case 'review':
        return '⭐';
      case 'course_approved':
        return '✅';
      case 'course_rejected':
        return '❌';
      case 'provider_approved':
        return '🎉';
      case 'provider_rejected':
        return '😔';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="notifications-page">
      <div className="page-header07">
        <h1>Thông báo</h1>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} chưa đọc</span>
        )}
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        <div className="action-buttons">
          {unreadCount > 0 && (
            <button className="btn-action" onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả là đã đọc
            </button>
          )}
          <button className="btn-action" onClick={handleClearRead}>
            Xóa thông báo đã đọc
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Không có thông báo</h3>
            <p>Bạn không có thông báo nào</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                
                {notification.relatedCourse && (
                  <div className="related-course">
                    📚 {notification.relatedCourse.title}
                  </div>
                )}

                <div className="notification-meta">
                  <span className="timestamp">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="notification-actions">
                {notification.link && (
                  <Link to={notification.link} className="btn-goto">
                    Đi đến
                  </Link>
                )}
                
                {!notification.read && (
                  <button
                    className="btn-mark-read"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    Đánh dấu là đã đọc
                  </button>
                )}
                
                <button
                  className="btn-delete3"
                  onClick={() => handleDelete(notification._id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
