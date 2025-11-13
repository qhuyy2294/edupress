/**
 * ForgotPasswordPage Component
 * Request password reset (simplified version - contact admin)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Message from '../components/Message';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  // const [message, setMessage] = useState('');
  // const [error, setError] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // setMessage('');
    // setError('');
    // setIsLoading(true);
    setSubmitted(true);
  };

  // if (!email) {
  //   setError('Vui lòng nhập địa chỉ email của bạn.');
  //   setIsLoading(false);
  //   return;
  // }

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="forgot-card">
            <div className="success-icon">✅</div>
            <h2>Request Submitted</h2>
            <Message type="info">
              <p>
                Your password reset request has been received for <strong>{email}</strong>.
              </p>
              <p>
                Please contact our admin team at <strong>admin@edupress.com</strong> with your
                registered email to reset your password.
              </p>
              <p>
                Our team will verify your identity and help you regain access to your account
                within 24 hours.
              </p>
            </Message>
            <Link to="/login" className="btn btn-primary">
              Back to Login
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

          {/* {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>} */}

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
                  // disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Gửi yêu cầu
            </button>
          </form>

          <div className="help-text">
            <p>
              <Link to="/login">Quay lại trang đăng nhập</Link>
            </p>
            <p className="note">
              Note: Password reset requires admin verification for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
