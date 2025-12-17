import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingCart, FaQrcode, FaTimes, FaTimesCircle } from 'react-icons/fa';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      if (!data || data.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(data);
      // if (data.discountCode) {
      //   setDiscountCode(data.discountCode);
      // }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setCreatingOrder(true);
      setError('');
      const order = await orderService.createOrder();
      setCurrentOrder(order); 
      setShowQRModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      fetchCart();
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleApplyDiscount = async () => {
    // if (!discountCode.trim()) return;
    try {
      setApplyingDiscount(true);
      setError('');
      await cartService.applyDiscountCode(discountCode);
      await fetchCart(); // Cập nhật lại UI ngay lập tức
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể áp dụng mã giảm giá');
      fetchCart();
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      setApplyingDiscount(true);
      setDiscountCode(''); // Xóa input
      await cartService.applyDiscountCode('');
      await fetchCart();
    } catch (error) {
      console.error(error);
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirmingPayment(true);
      setError('');
      await orderService.markOrderPaid(currentOrder._id);
      setSuccess('Đã xác nhận thanh toán! Đơn hàng đang chờ admin duyệt.');
      setShowQRModal(false);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xác nhận thanh toán');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const closeModal = () => {
    if (window.confirm('Bạn chưa xác nhận thanh toán. Bạn có chắc muốn đóng?')) {
      if (currentOrder?._id && currentOrder?.status === 'pending') {
        orderService.cancelOrder(currentOrder._id).catch(() => {});
      }
      setShowQRModal(false);
      // navigate('/orders');
      setCurrentOrder(null);
    }
  };

  if (loading && !cart) return <Loader />;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Thanh toán</h1>
        <div className="checkout-steps">
          <div className="checkout-step active">
            <FaShoppingCart /> Giỏ hàng
          </div>
          <div className="checkout-step active">
            <FaQrcode /> Thanh toán
          </div>
          <div className="checkout-step">
            <FaCheckCircle /> Hoàn tất
          </div>
        </div>
      </div>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}

      <div className="checkout-content">
        <div className="order-summary">
          <h2>Thông tin đơn hàng</h2>
          
          <div className="order-items">
            {cart?.items.map((item) => (
              <div key={item.course._id} className="order-item">
                <span className="order-item-name">{item.course.title}</span>
                <span className="order-item-price">
                  {item.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            ))}
          </div>

          <div className="discount-section">
            <h3>Mã giảm giá</h3>
            <div className="discount-input-group">
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              />
              <button
                onClick={handleApplyDiscount}
                disabled={!discountCode || applyingDiscount}
              >
                {applyingDiscount ? 'Đang kiểm tra...' : 'Áp dụng'}
              </button>
            </div>
            {/* {discountCode && (
              <div className="discount-applied">
                Mã giảm giá sẽ được áp dụng khi tạo đơn hàng
              </div>
            )} */}
          </div>

          <div className="order-total">
            <div className="total-row">
              <span>Tạm tính:</span>
              <span>{cart?.subTotal?.toLocaleString('vi-VN')} ₫</span>
            </div>
            {cart?.discountAmount > 0 && (
              <div className="discount-applied">
                <div style={{color: 'green'}}>
                  <span>Giảm giá ({cart.discountCode}):</span>
                  <span className="discount-amount">-{cart.discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <button
                  className="btn-remove-discount"
                  onClick={handleRemoveDiscount}
                  disabled={applyingDiscount}
                >
                  {applyingDiscount ? '...' : 'Hủy'}
                </button>
              </div>
            )}
            <div className="total-row final">
              <span>Tổng cộng:</span>
              <span>{cart?.finalTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>

        <div className="checkout-actions">
          <button
            className="btn2 btn-secondary2"
            onClick={() => navigate('/cart')}
          >
            Quay lại giỏ hàng
          </button>
          <button
            className="btn2 btn-primary2"
            onClick={handleCreateOrder}
            disabled={creatingOrder}
          >
            {creatingOrder ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && currentOrder && (
        <div className="qr-modal-overlay" onClick={(e) => {
          if (e.target.className === 'qr-modal-overlay') closeModal();
        }}>
          <div className="qr-modal">
            <button className="qr-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>

            <div className="qr-modal-header">
              <h2>Quét mã QR để thanh toán</h2>
              <p>Đơn hàng: #{currentOrder._id.slice(-8)}</p>
            </div>

            <div className="qr-code-container">
              <img 
                src="/QR.png" 
                alt="QR Code thanh toán"
                className="qr-code-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=QR+Code';
                }}
              />
            </div>

            <div className="payment-info">
              <div className="payment-info-row">
                <span className="payment-info-label">Số tiền:</span>
                <span className="payment-info-value payment-amount">
                  {currentOrder.finalAmount.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="payment-info-row">
                <span className="payment-info-label">Nội dung CK:</span>
                <span className="payment-info-value">{currentOrder.paymentNote}</span>
              </div>
            </div>

            <div className="payment-note">
              <strong>Lưu ý quan trọng:</strong>
              <p>Vui lòng ghi CHÍNH XÁC nội dung chuyển khoản để đơn hàng được duyệt nhanh chóng!</p>
            </div>

            <div className="payment-instructions">
              <h4>Hướng dẫn thanh toán:</h4>
              <ol>
                <li>Mở ứng dụng Banking trên điện thoại</li>
                <li>Quét mã QR code bên trên</li>
                <li>Kiểm tra số tiền và nội dung chuyển khoản</li>
                <li>Xác nhận thanh toán</li>
                <li>Quay lại đây và nhấn "Đã thanh toán"</li>
              </ol>
            </div>

            <div className="qr-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Hủy
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
              >
                <FaCheckCircle /> {confirmingPayment ? 'Đang xử lý...' : 'Đã thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
