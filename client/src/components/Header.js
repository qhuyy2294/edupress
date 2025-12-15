import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import cartService from '../services/cartService';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchCartCount();
      }
    } else {
      // Reset cart count khi không đăng nhập
      setCartCount(0);
    }
  }, [isAuthenticated, user]);

  const fetchCartCount = async () => {
    try {
      const data = await cartService.getCartCount();
      setCartCount(data.count);
    } catch (err) {
      // Chỉ log error, không hiển thị cho user
      if (err.response?.status !== 401 && err.response?.status !== 400) {
        console.error('Failed to fetch cart count:', err);
      }
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    setCartCount(0); // Reset cart count
    navigate('/login');
    setIsMobileMenuOpen(false); // Đóng menu khi logout
  };

  // Bật tắt menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        
        <Link to="/" className="logo" onClick={closeMenu}>
          <h1>Edupress</h1>
        </Link>

        {/* Nút Hamburger cho giao diện Moblie */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Overlay nền mờ khi menu mở */}
      <div 
        className={`nav-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      ></div>

        <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Nút đóng menu (dấu X) bên trong sidebar */}
          <button className="close-menu-btn" onClick={closeMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* <Link to="/" className="nav-link">
            Khóa học
          </Link> */}

          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                Xin chào, <strong>{user?.fullName}</strong>
              </div>

              {user?.role === 'customer' && (
                <>
                  <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                    <FaShoppingCart />
                    <span>Giỏ hàng</span>
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                  <Link to="/orders" className="nav-link" onClick={closeMenu}>
                    Đơn hàng
                  </Link>
                  <Link to="/my-courses" className="nav-link" onClick={closeMenu}>
                    Khóa học của tôi
                  </Link>
                  <Link to="/become-provider" className="nav-link" onClick={closeMenu}>
                    Trở thành nhà cung cấp
                  </Link>
                </>
              )}

              {user?.role === 'provider' && (
                <>
                  <Link to="/my-courses" className="nav-link" onClick={closeMenu}>
                    Khóa học của tôi
                  </Link>
                  <Link to="/course/create" className="nav-link" onClick={closeMenu}>
                    Tạo khóa học mới
                  </Link>
                  <Link to="/provider/revenue" className="nav-link" onClick={closeMenu}>
                    Báo cáo doanh thu
                  </Link>
                  <Link to="/provider/discounts" className="nav-link" onClick={closeMenu}>
                    Mã giảm giá
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>
                    Bảng điều khiển quản trị
                  </Link>
                  <Link to="/admin/orders" className="nav-link" onClick={closeMenu}>
                    Quản lý đơn hàng
                  </Link>
                </>
              )}

              <Link to="/notifications" className="nav-link" onClick={closeMenu}>
                🔔 Thông báo
              </Link>

              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                Hồ sơ
              </Link>

              <button onClick={handleLogout} className="btn01 btn-logout">
                Đăng xuất
              </button>

              <span className="user-greeting">Xin chào, {user?.fullName}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="btn01 btn-primary" onClick={closeMenu}>
                Đăng nhập
              </Link>
              <Link to="/register" className="btn01 btn-primary" onClick={closeMenu}>
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