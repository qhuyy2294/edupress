import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHourglassHalf, FaMoneyBillWave, FaLayerGroup, FaUsers, FaChartLine, FaClock, FaGem, FaArrowLeft, FaArrowRight, FaStream } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import './BecomeProviderPage.css';

const BecomeProviderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pendingRequested, setPendingRequested] = useState(false);

  if (user?.role === 'provider') {
    return (
      <div className="become-provider-page">
        <div className="container-become-provider center-content">
          <div className="status-card success">
            <div className="status-icon"><FaCheckCircle /></div>
            <h2>Bạn đã là Nhà cung cấp!</h2>
            <p>Bắt đầu hành trình chia sẻ kiến thức của bạn ngay hôm nay.</p>
            <button onClick={() => navigate('/my-courses')} className="btn btn-primary">
              Đi đến Khóa học của tôi <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'pending_provider' || pendingRequested) {
    return (
      <div className="become-provider-page">
        <div className="container-become-provider center-content">
          <div className="status-card pending">
            <div className="status-icon"><FaHourglassHalf /></div>
            <h2>Yêu cầu đang chờ xử lý</h2>
            <p>Hồ sơ của bạn đang được đội ngũ quản trị viên xem xét. <br/>Chúng tôi sẽ thông báo ngay khi có kết quả.</p>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              <FaArrowLeft /> Trở lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn gửi yêu cầu trở thành nhà cung cấp không?')) {
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
      <div className="container-become-provider">
        <div className="page-header04">
          <h1>Trở thành Giảng viên</h1>
          <p>Chia sẻ kiến thức, truyền cảm hứng và tạo thu nhập thụ động bền vững.</p>
        </div>

        <div className="content-grid">
          <div className="content-card benefits-card">
            <h2>Lợi ích tham gia</h2>
            <ul className="benefits-list">
              <li>
                <div className="icon-box"><FaMoneyBillWave /></div>
                <div>
                  <strong>Thu nhập hấp dẫn</strong>
                  <p>Nhận doanh thu chia sẻ cao trên mỗi lượt đăng ký khóa học.</p>
                </div>
              </li>
              <li>
                <div className="icon-box"><FaLayerGroup /></div>
                <div>
                  <strong>Không giới hạn khóa học</strong>
                  <p>Tự do sáng tạo và xuất bản không giới hạn.</p>
                </div>
              </li>
              <li>
                <div className="icon-box"><FaUsers /></div>
                <div>
                  <strong>Mở rộng tầm ảnh hưởng</strong>
                  <p>Tiếp cận hàng nghìn học viên tiềm năng trên toàn hệ thống.</p>
                </div>
              </li>
              <li>
                <div className="icon-box"><FaChartLine /></div>
                <div>
                  <strong>Báo cáo chi tiết</strong>
                  <p>Hệ thống phân tích doanh thu và hiệu quả giảng dạy trực quan.</p>
                </div>
              </li>
              <li>
                <div className="icon-box"><FaClock /></div>
                <div>
                  <strong>Linh hoạt thời gian</strong>
                  <p>Làm chủ thời gian, giảng dạy bất cứ khi nào bạn muốn.</p>
                </div>
              </li>
              <li>
                <div className="icon-box"><FaGem /></div>
                <div>
                  <strong>Công cụ chuyên nghiệp</strong>
                  <p>Hỗ trợ các công cụ tạo bài giảng, quiz và quản lý học viên.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="content-card">
            <h2>Điều kiện cần thiết</h2>
            <div className="req-list">
              <div className="requirement-item">
                <FaCheckCircle className="check-icon" />
                <p>Tài khoản đã được xác thực email</p>
              </div>
              <div className="requirement-item">
                <FaCheckCircle className="check-icon" />
                <p>Có chuyên môn sâu về lĩnh vực giảng dạy</p>
              </div>
              <div className="requirement-item">
                <FaCheckCircle className="check-icon" />
                <p>Cam kết chất lượng nội dung chuẩn HD</p>
              </div>
              <div className="requirement-item">
                <FaCheckCircle className="check-icon" />
                <p>Tuân thủ chính sách cộng đồng</p>
              </div>
              <div className="requirement-item">
                <FaCheckCircle className="check-icon" />
                <p>Có tài khoản ngân hàng để nhận thanh toán</p>
              </div>
            </div>
          </div>

          <div className="content-card steps-card">
            <h3><FaStream style={{color: '#6366f1'}}/> Quy trình hoạt động</h3>
            <div className="steps-container-horizontal">
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Gửi yêu cầu</h3>
                    <p>Nhấn nút đăng ký bên dưới để gửi hồ sơ.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Xét duyệt</h3>
                    <p>Admin sẽ xem xét trong 1-2 ngày làm việc.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Bắt đầu dạy</h3>
                    <p>Được duyệt? Tạo khóa học và kiếm tiền ngay!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-large btn-block"
                disabled={loading}
              >
                {loading ? (
                  <><span>Đang xử lý...</span></>
                ) : (
                  <><span>Đăng ký làm Giảng viên ngay</span></>
                )}
              </button>
              <p className="note">
                Bằng cách đăng ký, bạn đồng ý với <span>Điều khoản & Chính sách</span> của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeProviderPage;