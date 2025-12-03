import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // đóng dropdown khi click ngoài vùng
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <header className="border-bottom bg-white shadow-sm py-2">
      <div className="container d-flex justify-content-between align-items-center">
        
        <Link to="/" className="text-dark text-decoration-none">
          <h2 className="fw-bold m-0">Edupress</h2>
        </Link>

        <nav className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* CUSTOMER */}
              {user?.role === "customer" && (
                <>
                  <Link to="/my-courses" className="nav-link px-2">
                    Khóa học của tôi
                  </Link>
                  <Link to="/become-provider" className="nav-link px-2">
                    Trở thành nhà cung cấp
                  </Link>
                </>
              )}

              {/* PROVIDER */}
              {user?.role === "provider" && (
                <>
                  <Link to="/my-courses" className="nav-link px-2">
                    Khóa học của tôi
                  </Link>
                  <Link to="/course/create" className="nav-link px-2">
                    Tạo khóa học mới
                  </Link>
                  <Link to="/provider/revenue" className="nav-link px-2">
                    Báo cáo doanh thu
                  </Link>
                  <Link to="/provider/discounts" className="nav-link px-2">
                    Mã giảm giá
                  </Link>
                </>
              )}

              {/* DROPDOWN USER */}
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle"
                  onClick={() => setOpen(!open)}
                >
                  <img
                    src={`https://i.pravatar.cc/40?u=${user?.fullName}`}
                    alt="avatar"
                    className="rounded-circle"
                    width="32"
                    height="32"
                  />
                  <span className="fw-medium">{user?.fullName}</span>
                </button>

                <ul
                  className={`dropdown-menu dropdown-menu-end ${open ? "show" : ""}`}
                >
                  {user?.role === "admin" && (
                    <li>
                      <Link className="dropdown-item" to="/admin/dashboard">
                        Bảng điều khiển quản trị
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link className="dropdown-item" to="/notifications">
                      🔔 Thông báo
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Hồ sơ
                    </Link>
                  </li>

                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link px-2">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary px-3">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
