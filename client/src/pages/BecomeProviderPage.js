import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
// import Message from '../components/Message';
import './BecomeProviderPage.css';

const BecomeProviderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pendingRequested, setPendingRequested] = useState(false);

  // Check if already provider or pending
  if (user?.role === 'provider') {
    return (
      <div className="become-provider-page">
        <div className="container">
          <div className="status-card success">
            <div className="icon">✅</div>
            <h2>Bạn đã là Nhà cung cấp rồi!</h2>
            <p>Bắt đầu tạo và quản lý khóa học của bạn.</p>
            <button onClick={() => navigate('/my-courses')} className="btn btn-primary">
              Đi đến Khóa học của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'pending_provider' || pendingRequested) {
    return (
      <div className="become-provider-page">
        <div className="container">
          <div className="status-card pending">
            <div className="icon">⏳</div>
            <h2>Yêu cầu đang chờ xử lý</h2>
            <p>Yêu cầu trở thành nhà cung cấp của bạn đang được nhóm quản trị của chúng tôi xem xét.</p>
            <p>Bạn sẽ được thông báo khi yêu cầu của bạn được chấp thuận.</p>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Trở lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn trở thành nhà cung cấp khóa học không? Việc này cần được quản trị viên phê duyệt..')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.post('/users/request-provider');

      if (response.data.success) {
        setSuccess('Đang chờ phê duyệt');
        setPendingRequested(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="become-provider-page">
      <div className="container">
        <div className="page-header04">
          <h1>🎓 Trở thành nhà cung cấp khóa học</h1>
          <p>Chia sẻ kiến ​​thức của bạn và kiếm tiền bằng cách tạo các khóa học trực tuyến</p>
        </div>

        {/* {error && <Message type="error">{error}</Message>}
        {success && <Message type="success">{success}</Message>} */}

        <div className="content-grid">
          {/* Benefits Section */}
          <div className="benefits-card">
            <h2>✨ Lợi ích của nhà cung cấp</h2>
            <ul className="benefits-list">
              <li>
                <span className="icon">💰</span>
                <div>
                  <strong>Kiếm tiền</strong>
                  <p>Được trả tiền cho mỗi học viên đăng ký khóa học của bạn</p>
                </div>
              </li>
              <li>
                <span className="icon">📚</span>
                <div>
                  <strong>Tạo khóa học không giới hạn</strong>
                  <p>Chia sẻ chuyên môn của bạn về nhiều chủ đề</p>
                </div>
              </li>
              <li>
                <span className="icon">👥</span>
                <div>
                  <strong>Xây dựng đối tượng của bạn</strong>
                  <p>Tiếp cận hàng ngàn sinh viên trên toàn thế giới</p>
                </div>
              </li>
              <li>
                <span className="icon">📊</span>
                <div>
                  <strong>Theo dõi thành công của bạn</strong>
                  <p>Truy cập phân tích chi tiết và báo cáo doanh thu</p>
                </div>
              </li>
              <li>
                <span className="icon">🎯</span>
                <div>
                  <strong>Lịch trình linh hoạt</strong>
                  <p>Tạo và quản lý các khóa học theo tốc độ của riêng bạn</p>
                </div>
              </li>
              <li>
                <span className="icon">💎</span>
                <div>
                  <strong>Tính năng cao cấp</strong>
                  <p>Truy cập các công cụ quản lý khóa học nâng cao</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Requirements Section */}
          <div className="requirements-card">
            <h2>📋 Yêu cầu</h2>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Tài khoản đang hoạt động và có uy tín tốt</p>
            </div>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Chuyên môn trong môn học giảng dạy của bạn</p>
            </div>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Cam kết về nội dung chất lượng</p>
            </div>
            <div className="requirement-item">
              <span className="check">✓</span>
              <p>Cần có sự chấp thuận của quản trị viên</p>
            </div>

            <h2 style={{ marginTop: '30px' }}>⚙️ Nó hoạt động như thế nào</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Gửi yêu cầu</h3>
                  <p>Nhấp vào nút bên dưới để yêu cầu quyền truy cập của nhà cung cấp</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Đánh giá của quản trị viên</h3>
                  <p>Nhóm của chúng tôi sẽ xem xét yêu cầu của bạn trong vòng 1-2 ngày làm việc</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Được chấp thuận</h3>
                  <p>Sau khi được chấp thuận, bạn có thể bắt đầu tạo khóa học ngay lập tức</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Bắt đầu giảng dạy</h3>
                  <p>Tạo khóa học đầu tiên của bạn và bắt đầu kiếm tiền</p>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Yêu cầu quyền truy cập của nhà cung cấp'}
              </button>
              <p className="note">
                Bằng cách gửi, bạn đồng ý tuân theo hướng dẫn về nội dung và điều khoản dịch vụ của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeProviderPage;
