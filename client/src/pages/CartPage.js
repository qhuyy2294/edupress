import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash } from 'react-icons/fa';
import cartService from '../services/cartService';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    if (!window.confirm('Bạn có chắc muốn xóa khóa học này khỏi giỏ hàng?')) return;

    try {
      setRemoving(courseId);
      const data = await cartService.removeFromCart(courseId);
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa khóa học');
    } finally {
      setRemoving(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả khóa học khỏi giỏ hàng?')) return;

    try {
      await cartService.clearCart();
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <Loader />;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1><FaShoppingCart /> Giỏ hàng của bạn</h1>
          <p className="cart-count">
            {cart?.items?.length || 0} khóa học
          </p>
        </div>
      </div>

      {error && <Message type="error">{error}</Message>}

      {!cart || cart.items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <FaShoppingCart />
          </div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có khóa học nào trong giỏ hàng</p>
          <button 
            className="checkout-btn"
            onClick={() => navigate('/courses')}
          >
            Khám phá khóa học
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.course._id} className="cart-item">
                <img 
                  src={item.course.thumbnailUrl || item.course.thumbnail || 'https://placehold.co/150x100?text=Course'}
                  alt={item.course.title}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <div>
                    <h3 className="cart-item-title">{item.course.title}</h3>
                    <p className="cart-item-provider">
                      Giảng viên: {item.course.provider?.name || 'N/A'}
                    </p>
                    <span className="cart-item-category">
                      {item.course.category}
                    </span>
                  </div>
                  <div className="cart-item-actions">
                    <span className="cart-item-price">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFromCart(item.course._id)}
                      disabled={removing === item.course._id}
                    >
                      <FaTrash /> {removing === item.course._id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>
            
            <div className="summary-row">
              <span className="summary-label">Số khóa học:</span>
              <span className="summary-value">{cart.items.length}</span>
            </div>

            <div className="summary-row total">
              <span className="summary-label">Tổng cộng:</span>
              <span className="summary-value price">
                {cart.totalAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Tiến hành thanh toán
            </button>

            <button 
              className="clear-cart-btn"
              onClick={handleClearCart}
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
