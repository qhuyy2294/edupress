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
          <p>Your gateway to online learning excellence</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect With Us</h4>
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
