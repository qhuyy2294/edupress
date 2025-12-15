import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaReceipt, FaShoppingBag, FaSync } from 'react-icons/fa';
import orderService from '../services/orderService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await orderService.getUserOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
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

  if (loading) return <Loader />;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1><FaReceipt /> Lịch sử đơn hàng</h1>
          <p className="orders-count">{orders.length} đơn hàng</p>
        </div>
        <button 
          className="btn-refresh" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSync className={refreshing ? 'spinning' : ''} /> 
          {refreshing ? 'Đang làm mới...' : 'Làm mới'}
        </button>
      </div>

      {error && <Message type="error">{error}</Message>}

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <FaReceipt />
          </div>
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bạn chưa thực hiện đơn hàng nào</p>
          <button 
            className="btn-view"
            onClick={() => navigate('/courses')}
          >
            Khám phá khóa học
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">Đơn hàng #{order._id.slice(-8)}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <div className={`order-status ${order.status}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-courses">
                <h4>Khóa học ({order.courses.length}):</h4>
                {order.courses.map((item, index) => (
                  <div key={index} className="order-course-item">
                    <span className="order-course-name">
                      {item.course?.title || 'Khóa học'}
                    </span>
                    <span className="order-course-price">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))}
              </div>

              {order.discountCode && (
                <div className="discount-info">
                  <FaShoppingBag />
                  <span>Mã giảm giá: <strong>{order.discountCode}</strong> - Giảm {order.discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}

              {order.status === 'rejected' && order.rejectedReason && (
                <div className="rejected-reason">
                  <strong>Lý do từ chối:</strong>
                  <p>{order.rejectedReason}</p>
                </div>
              )}

              {order.status === 'approved' && order.approvedAt && (
                <div className="discount-info">
                  <span>Đã duyệt lúc: {formatDate(order.approvedAt)}</span>
                </div>
              )}

              <div className="order-footer">
                <div className="order-total">
                  Tổng cộng: {order.finalAmount.toLocaleString('vi-VN')} ₫
                </div>
                <div className="order-actions">
                  {order.status === 'approved' && (
                    <button 
                      className="btn-view"
                      onClick={() => navigate('/my-courses')}
                    >
                      Xem khóa học
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
