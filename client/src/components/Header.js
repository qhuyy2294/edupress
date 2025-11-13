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
          <Link to="/" className="nav-link">
            Courses
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <>
                  <Link to="/my-courses" className="nav-link">
                    My Courses
                  </Link>
                  <Link to="/become-provider" className="nav-link">
                    Become Provider
                  </Link>
                </>
              )}

              {user?.role === 'provider' && (
                <>
                  <Link to="/my-courses" className="nav-link">
                    My Courses
                  </Link>
                  <Link to="/course/create" className="nav-link">
                    Create Course
                  </Link>
                  <Link to="/provider/revenue" className="nav-link">
                    Revenue Report
                  </Link>
                  <Link to="/provider/discounts" className="nav-link">
                    Discount Codes
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">
                  Admin Dashboard
                </Link>
              )}

              <Link to="/notifications" className="nav-link">
                🔔 Notifications
              </Link>

              <Link to="/profile" className="nav-link">
                Profile
              </Link>

              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>

              <span className="user-greeting">
                Hello, {user?.fullName}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
