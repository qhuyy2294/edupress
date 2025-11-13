/**
 * BecomeProviderPage Component
 * Customer request to become a course provider
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Message from '../components/Message';
import './BecomeProviderPage.css';

const BecomeProviderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Check if already provider or pending
  if (user?.role === 'provider') {
    return (
      <div className="become-provider-page">
        <div className="container">
          <div className="status-card success">
            <div className="icon">✅</div>
            <h2>You are already a Provider!</h2>
            <p>Start creating and managing your courses.</p>
            <button onClick={() => navigate('/my-courses')} className="btn btn-primary">
              Go to My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'pending_provider') {
    return (
      <div className="become-provider-page">
        <div className="container">
          <div className="status-card pending">
            <div className="icon">⏳</div>
            <h2>Request Pending</h2>
            <p>Your request to become a provider is being reviewed by our admin team.</p>
            <p>You will be notified once your request is approved.</p>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to become a course provider? This will require admin approval.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.post('/users/request-provider');

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          window.location.reload(); // Reload to update user status
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="become-provider-page">
      <div className="container">
        <div className="page-header">
          <h1>🎓 Become a Course Provider</h1>
          <p>Share your knowledge and earn by creating online courses</p>
        </div>

        {error && <Message type="error">{error}</Message>}
        {success && <Message type="success">{success}</Message>}

        <div className="content-grid">
          {/* Benefits Section */}
          <div className="benefits-card">
            <h2>✨ Provider Benefits</h2>
            <ul className="benefits-list">
              <li>
                <span className="icon">💰</span>
                <div>
                  <strong>Earn Money</strong>
                  <p>Get paid for every student who enrolls in your courses</p>
                </div>
              </li>
              <li>
                <span className="icon">📚</span>
                <div>
                  <strong>Create Unlimited Courses</strong>
                  <p>Share your expertise across multiple topics</p>
                </div>
              </li>
              <li>
                <span className="icon">👥</span>
                <div>
                  <strong>Build Your Audience</strong>
                  <p>Reach thousands of students worldwide</p>
                </div>
              </li>
              <li>
                <span className="icon">📊</span>
                <div>
                  <strong>Track Your Success</strong>
                  <p>Access detailed analytics and revenue reports</p>
                </div>
              </li>
              <li>
                <span className="icon">🎯</span>
                <div>
                  <strong>Flexible Schedule</strong>
                  <p>Create and manage courses at your own pace</p>
                </div>
              </li>
              <li>
                <span className="icon">💎</span>
                <div>
                  <strong>Premium Features</strong>
                  <p>Access advanced course management tools</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Requirements Section */}
          <div className="requirements-card">
            <h2>📋 Requirements</h2>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Active account in good standing</p>
            </div>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Expertise in your teaching subject</p>
            </div>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Commitment to quality content</p>
            </div>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Admin approval required</p>
            </div>

            <h2 style={{ marginTop: '30px' }}>⚙️ How It Works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Submit Request</h3>
                  <p>Click the button below to request provider access</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Admin Review</h3>
                  <p>Our team will review your request within 1-2 business days</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Get Approved</h3>
                  <p>Once approved, you can start creating courses immediately</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Start Teaching</h3>
                  <p>Create your first course and start earning</p>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Submitting...' : '🚀 Request Provider Access'}
              </button>
              <p className="note">
                By submitting, you agree to follow our content guidelines and terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeProviderPage;
