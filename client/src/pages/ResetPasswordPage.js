/**
 * ResetPasswordPage Component
 * Allows user to set a new password using a token from the URL.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import axios from 'axios';
import './ForgotPasswordPage.css'; // Dùng lại CSS

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Lấy token từ URL params
    const { token } = useParams(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (!token) {
            setError('Token đặt lại mật khẩu bị thiếu.');
            return;
        }

        setIsLoading(true);

        try {
            // Gửi PUT request đến API reset password
            const config = { headers: { 'Content-Type': 'application/json' } };
            const response = await axios.put(`/api/auth/reset-password/${token}`, { password }, config);
            
            setMessage(response.data.message);
            
            // Chuyển đến trang Home sau 3 giây
            setTimeout(() => {
                navigate('/'); 
            }, 3000);

        } catch (err) {
            // Xử lý lỗi (token hết hạn, không hợp lệ)
            const errMsg = err.response && err.response.data && err.response.data.error 
                         ? err.response.data.error 
                         : 'Token không hợp lệ hoặc đã xảy ra lỗi.';
            setError(errMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="container">
                <div className="forgot-card">
                    <div className="icon">🔑</div>
                    <h2>Đặt lại Mật khẩu</h2>
                    <p className="subtitle">
                        Nhập mật khẩu mới của bạn.
                    </p>

                    {isLoading && <Loader />}
                    {message && <Message type="success">{message}</Message>}
                    {error && <Message type="danger">{error}</Message>}

                    {message ? (
                        <p className="redirect-note">
                            Mật khẩu đã được đặt lại thành công! Bạn sẽ được chuyển hướng về trang chủ sau vài giây...
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="forgot-form">
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu Mới</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận Mật khẩu Mới</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Xác nhận mật khẩu mới"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                                {isLoading ? 'Đang cập nhật...' : 'Đặt lại Mật khẩu'}
                            </button>
                        </form>
                    )}
                    
                    <div className="help-text">
                        <p>
                            <Link to="/login">Quay lại trang đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;