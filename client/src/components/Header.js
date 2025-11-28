/**
 * Header Component
 * Navigation bar for the application
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Edupress</h1>
        </Link>

        <nav className="nav">
          {/* <Link to="/" className="nav-link">
            Khóa học
          </Link> */}

          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <>
                  <Link to="/my-courses" className="nav-link">
                    Khóa học của tôi
                  </Link>
                  <Link to="/become-provider" className="nav-link">
                    Trở thành nhà cung cấp
                  </Link>
                </>
              )}

              {user?.role === 'provider' && (
                <>
                  <Link to="/my-courses" className="nav-link">
                    Khóa học của tôi
                  </Link>
                  <Link to="/course/create" className="nav-link">
                    Tạo khóa học mới
                  </Link>
                  <Link to="/provider/revenue" className="nav-link">
                    Báo cáo doanh thu
                  </Link>
                  <Link to="/provider/discounts" className="nav-link">
                    Mã giảm giá
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">
                  Bảng điều khiển quản trị
                </Link>
              )}

              <Link to="/notifications" className="nav-link">
                🔔 Thông báo
              </Link>

              <Link to="/profile" className="nav-link">
                Hồ sơ
              </Link>

              <button onClick={handleLogout} className="btn btn-logout">
                Đăng xuất
              </button>

              <span className="user-greeting">
                Xin chào, {user?.fullName}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
