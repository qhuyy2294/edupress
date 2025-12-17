import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglass, FaClock } from 'react-icons/fa';
import orderService from '../services/orderService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './OrderManagementPage.css';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (filter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filter));
    }
  };

  const handleApprove = async (orderId) => {
    if (!window.confirm('Xác nhận duyệt đơn hàng này?')) return;

    try {
      setProcessingId(orderId);
      setError('');
      await orderService.approveOrder(orderId);
      
      // Cập nhật state ngay lập tức
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'approved', approvedAt: new Date() }
          : order
      ));
      
      setSuccess('Đã duyệt đơn hàng thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt đơn hàng');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (orderId) => {
    setRejectOrderId(orderId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessingId(rejectOrderId);
      setError('');
      await orderService.rejectOrder(rejectOrderId, rejectReason);
      
      // Cập nhật state ngay lập tức
      setOrders(orders.map(order => 
        order._id === rejectOrderId 
          ? { ...order, status: 'rejected', rejectedReason: rejectReason }
          : order
      ));
      
      setSuccess('Đã từ chối đơn hàng');
      setShowRejectModal(false);
      setRejectOrderId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối đơn hàng');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      rejected: orders.filter(o => o.status === 'rejected').length
    };
  };

  if (loading) return <Loader />;

  const stats = getStats();

  return (
    <div className="order-management-page">
      <div className="order-management-header">
        <h1>Quản lý đơn hàng</h1>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Tổng đơn hàng</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Chờ duyệt</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Đã duyệt</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Đã từ chối</div>
        </div>
      </div>

      <div className="order-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <FaHourglass /> Chờ duyệt ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          <FaCheckCircle /> Đã duyệt ({stats.approved})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          <FaTimesCircle /> Đã từ chối ({stats.rejected})
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            Không có đơn hàng nào
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order._id} 
              className={`admin-order-card ${order.status}`}
            >
              <div className="admin-order-header">
                <div className="order-user-info">
                  <img
                    src={order.user?.avatarUrl || `https://ui-avatars.com/api/?name=${order.user?.fullName || order.user?.email || 'User'}&background=random`}
                    alt={order.user?.fullName || order.user?.email}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <h4>{order.user?.fullName || order.user?.email || 'N/A'}</h4>
                    <p>{order.user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label">Mã đơn hàng</span>
                  <span className="order-info-value">#{order._id.slice(-8)}</span>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label"><FaClock /> Thời gian</span>
                  <span className="order-info-value">{formatDate(order.createdAt)}</span>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label">Tổng tiền</span>
                  <span className="order-info-value amount">
                    {order.finalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <div className="admin-order-courses">
                <h5>Khóa học ({order.courses.length}):</h5>
                <div className="course-list">
                  {order.courses.map((item, index) => (
                    <div key={index} className="course-item">
                      <div>
                        <div className="course-item-name">
                          {item.course?.title || 'Khóa học'}
                        </div>
                        <div className="course-item-provider">
                          Provider: {item.provider?.fullName || item.course?.provider?.fullName || 'N/A'}
                        </div>
                      </div>
                      <span className="course-item-price">
                        {item.price.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {order.discountCode && (
                <div className="payment-note-box">
                  <strong>Mã giảm giá:</strong> {order.discountCode} (-{order.discountAmount.toLocaleString('vi-VN')} ₫)
                </div>
              )}

              <div className="payment-note-box">
                <strong>Nội dung CK:</strong> {order.paymentNote}
              </div>

              {order.status === 'pending' && (
                <div className="admin-order-actions">
                  <button
                    className="btn-reject"
                    onClick={() => openRejectModal(order._id)}
                    disabled={processingId === order._id}
                    title="Từ chối đơn hàng này"
                  >
                    <FaTimesCircle /> {processingId === order._id ? 'Đang xử lý...' : 'Từ chối'}
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(order._id)}
                    disabled={processingId === order._id}
                    title="Duyệt đơn hàng này"
                  >
                    <FaCheckCircle /> {processingId === order._id ? 'Đang xử lý...' : 'Duyệt đơn hàng'}
                  </button>
                </div>
              )}

              {order.status === 'approved' && (
                <div className="approval-info">
                  Đã duyệt bởi {order.approvedBy?.name || 'Admin'} lúc {formatDate(order.approvedAt)}
                </div>
              )}

              {order.status === 'rejected' && order.rejectedReason && (
                <div className="rejected-reason">
                  <strong>Lý do từ chối:</strong>
                  <p>{order.rejectedReason}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="reject-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Từ chối đơn hàng</h3>
            <textarea
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="reject-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-reject"
                onClick={handleReject}
                disabled={processingId}
              >
                {processingId ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
