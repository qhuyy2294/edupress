// src/pages/ForgotPassword.js (hoặc src/components/ForgotPassword.js)
import React, { useState } from 'react';
import './FogotPassword.css';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        if (!email) {
            setError('Vui lòng nhập địa chỉ email của bạn.');
            setIsLoading(false);
            return;
        }
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Quên mật khẩu?</h2>
                <p className="forgot-password-intro">
                    Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                </p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="forgot-password-form">
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
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại'}
                    </button>
                </form>

                <div className="back-to-login">
                    <a href="/login">Quay lại Đăng nhập</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;