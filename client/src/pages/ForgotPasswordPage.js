import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader'; 
import axios from 'axios'; 
import './ForgotPasswordPage.css'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API Forgot Password
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      // Backend trả về message thành công (dù email tồn tại hay không)
      setMessage(response.data.message);
      setSubmitted(true); // Hiển thị thông báo thành công
      
    } catch (err) {
      // Xử lý lỗi từ server
      const errMsg = err.response && err.response.data && err.response.data.error 
                    ? err.response.data.error 
                    : 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị thông báo sau khi gửi yêu cầu thành công
  if (submitted && message) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="forgot-card">
            <div className="success-icon">✅</div>
            <h2>Yêu cầu đã được gửi</h2>
            <Message type="success">
              <p>{message}</p>
              <p>Vui lòng kiểm tra hộp thư email của bạn (bao gồm cả thư mục Spam/Junk) để tìm liên kết đặt lại mật khẩu.</p>
              <p>Liên kết sẽ hết hạn sau 15 phút.</p>
            </Message>
            <Link to="/login" className="btn btn-primary">
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-card">
          <div className="icon">🔐</div>
          <h2>Quên mật khẩu?</h2>
          <p className="subtitle">
            Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
          </p>

          {isLoading && <Loader />}
          {error && <Message type="danger">{error}</Message>}
          
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="form-group">
              <label htmlFor="email">Địa chỉ Email</label>
              <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>

          <div className="help-text">
            <p>
              <Link to="/login">Quay lại trang đăng nhập</Link>
            </p>
            <p className="note">
              Lưu ý: Liên kết đặt lại mật khẩu sẽ hết hạn sau 15 phút.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;