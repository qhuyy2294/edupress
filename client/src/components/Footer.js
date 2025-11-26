/**
 * Footer Component
 * Footer section for the application
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Edupress</h3>
          <p>Cổng thông tin của bạn đến với sự xuất sắc trong học tập trực tuyến</p>
        </div>

        <div className="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/courses">Khóa học</a></li>
            <li><a href="/about">Giới thiệu về chúng tôi</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Trung tâm trợ giúp</a></li>
            <li><a href="/terms">Điều khoản dịch vụ</a></li>
            <li><a href="/privacy">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-links">
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Edupress. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
