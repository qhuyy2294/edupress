/* cspell:disable-next-line */
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
          <h3><i>EDUPRESS</i></h3>
          <p>Cổng thông tin của bạn đến với sự xuất sắc trong học tập trực tuyến</p>
        </div>

        <div className="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/">Khóa học <i>Edupress</i></a></li>
            <li><a href="/about">Giới thiệu về chúng tôi</a></li>
            <li><a href="/contact">Thông tin liên hệ</a></li>
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
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
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
