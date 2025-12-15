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
      const response = await axios.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      setSubmitted(true);
    } catch (err) {
      const errMsg = err.response && err.response.data && err.response.data.error 
                    ? err.response.data.error 
                    : 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-card-wrapper">
        {submitted ? (
          <div className="forgot-card success-state">
            <div className="icon-circle success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Đã gửi yêu cầu!</h2>
            <div className="message-content">
              {message && <p className="main-msg">{message}</p>}
              <p className="sub-message">Vui lòng kiểm tra hộp thư (bao gồm cả thư mục Spam) để nhận liên kết đặt lại mật khẩu.</p>
              <span className="timing">Link hết hạn sau 15 phút</span>
            </div>
            <Link to="/login" className="btn btn-primary btn-block">
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <div className="forgot-card">
            <div className="icon-circle key-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            
            <div className="header-text">
              <h2>Quên mật khẩu?</h2>
              <p>Đừng lo lắng, hãy nhập email đăng ký của bạn, chúng tôi sẽ giúp bạn lấy lại mật khẩu.</p>
            </div>

            {isLoading && <div className="loader-container"><Loader /></div>}
            {error && <Message type="danger">{error}</Message>}
            
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="form-group">
                <label htmlFor="email">Email đăng ký</label>
                <div className="input-wrapper">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Vui lòng nhập email của bạn"
                      required
                      disabled={isLoading}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Gửi liên kết xác nhận'}
              </button>
            </form>

            <div className="card-footer">
              <Link to="/login" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;