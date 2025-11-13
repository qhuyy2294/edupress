/**
 * LoginPage Component
 * User login form
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirect based on user role
        if (result.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.data.role === 'provider') {
          navigate('/provider/courses');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Login to Edupress</h2>
          <p className="auth-subtitle">Welcome back! Please enter your details.</p>

          {error && <Message type="error" message={error} />}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="form-input"
                minLength="6"
              />
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? <Loader size="small" /> : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
