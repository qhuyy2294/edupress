import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './NotificationsPage.css';
import { FaGraduationCap, FaStar, FaCheckCircle, FaTimesCircle, FaChalkboardTeacher, FaBell, FaEnvelope, FaTrashAlt, FaCheckDouble, FaExternalLinkAlt } from 'react-icons/fa';
import { BiTrash } from 'react-icons/bi';
import { MdMarkEmailRead } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

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
      setError(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setError('');
      setSuccess('');
      await notificationService.markAllAsRead();
      setSuccess('Đã đánh dấu tất cả là đã đọc');
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    try {
      setError('');
      await notificationService.deleteNotification(notificationId);
      setSuccess('Đã xóa thông báo');
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được thông báo');
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm('Xóa tất cả thông báo đã đọc?')) return;
    try {
      setError('');
      setSuccess('');
      await notificationService.clearReadNotifications();
      setSuccess('Đã dọn dẹp các thông báo cũ');
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  const getNotificationVisuals = (type) => {
    switch (type) {
      case 'enrollment':
        return { icon: <FaGraduationCap />, className: 'type-enrollment' };
      case 'review':
        return { icon: <FaStar />, className: 'type-review' };
      case 'course_approved':
      case 'provider_approved':
        return { icon: <FaCheckCircle />, className: 'type-success' };
      case 'course_rejected':
      case 'provider_rejected':
        return { icon: <FaTimesCircle />, className: 'type-danger' };
      case 'system':
        return { icon: <FaBell />, className: 'type-system' };
      default:
        return { icon: <FaEnvelope />, className: 'type-default' };
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="page-header07">
          <div className="header-title">
            <h1>Thông báo</h1>
            {unreadCount > 0 && <span className="badge-pulse">{unreadCount} mới</span>}
          </div>
          <div className="header-actions">
          </div>
        </div>

        {error && <Message type="error">{error}</Message>}
        {success && <Message type="success">{success}</Message>}

        <div className="toolbar-card">
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Chưa đọc
            </button>
          </div>

          <div className="bulk-actions">
            {unreadCount > 0 && (
              <button className="btn-text btn-mark-all" onClick={handleMarkAllAsRead} title="Đánh dấu tất cả đã đọc">
                <MdMarkEmailRead /> <span>Đọc tất cả</span>
              </button>
            )}
            <button className="btn-text btn-clear-read" onClick={handleClearRead} title="Xóa thông báo đã đọc">
              <BiTrash /> <span>Dọn dẹp</span>
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <FiInbox />
              </div>
              <h3>Không có thông báo nào</h3>
              <p>Bạn đã xem hết tất cả thông báo hiện tại.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const { icon, className } = getNotificationVisuals(notification.type);
              
              return (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'is-unread' : ''}`}
                >
                  <div className={`notification-avatar ${className}`}>
                    {icon}
                  </div>

                  <div className="notification-body">
                    <div className="notification-main-info">
                      <h3 className="notification-title">
                        {notification.title}
                        {!notification.read && <span className="dot-unread"></span>}
                      </h3>
                      <p className="notification-message">{notification.message}</p>
                      
                      {notification.relatedCourse && (
                        <div className="related-tag">
                          <FaChalkboardTeacher /> {notification.relatedCourse.title}
                        </div>
                      )}
                      
                      <span className="time-ago">
                        {new Date(notification.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="notification-controls">
                    {notification.link && (
                      <Link to={notification.link} className="ctrl-btn btn-link" title="Đi đến trang">
                        <FaExternalLinkAlt />
                      </Link>
                    )}
                    
                    {!notification.read && (
                      <button
                        className="ctrl-btn btn-check"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Đánh dấu đã đọc"
                      >
                        <FaCheckDouble />
                      </button>
                    )}
                    
                    <button
                      className="ctrl-btn btn-remove"
                      onClick={() => handleDelete(notification._id)}
                      title="Xóa thông báo"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;