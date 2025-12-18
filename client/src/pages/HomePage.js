import React, { useState, useEffect } from 'react';
// Import các icon cần thiết
import { FaSearch, FaLayerGroup, FaSortAmountDown, FaBoxOpen } from 'react-icons/fa';
import { BiFilterAlt } from 'react-icons/bi';

import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import courseService from '../services/courseService';
import './HomePage.css';
import { assets } from '../assets/img';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, category, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (category) filters.category = category;
      if (sortBy) filters.sort = sortBy;

      const response = await courseService.getAllCourses(filters);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-bg-wrapper">
            <img className='hero-bg-img' src={assets.backgroundHero} alt='Edupress Background'/>
            <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Khởi đầu hành trình <br/> tri thức cùng <span className="highlight">Edupress</span></h1>
          <p className="hero-subtitle">Nền tảng học tập trực tuyến hàng đầu. Khám phá hàng ngàn khóa học từ các chuyên gia.</p>
          <a href="#courses-section" className="hero-btn">Khám phá ngay</a>
        </div>
      </section>

      <section className="search-wrapper container">
        <div className="glass-search-bar">
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <FaSearch className="input-icon" /> 
              <input
                type="text"
                placeholder="Bạn muốn học gì hôm nay?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-search">Tìm kiếm</button>
          </form>
        
          <div className="filters-group">
            <div className="select-wrapper">
              <FaLayerGroup className="select-icon" />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tất cả danh mục</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
              </select>
              <BiFilterAlt className="select-arrow" />
            </div>

            <div className="select-wrapper">
              <FaSortAmountDown className="select-icon" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">Sắp xếp theo</option>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
              <BiFilterAlt className="select-arrow" />
            </div>
          </div>
        </div>
      </section>

      <section className="courses-section" id="courses-section">
        <div className="container">
          {error && <Message type="error" message={error} />}

          {loading ? (
            <Loader message="Đang tải khóa học..." />
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <div className="empty-state-icon">
                <FaBoxOpen />
              </div>
              <h3>Không tìm thấy khóa học nào</h3>
              <p>Hãy thử từ khóa khác hoặc xóa bộ lọc xem sao nhé!</p>
            </div>
          ) : (
            <>
              <div className="section-header">
                  <h2 className="section-title-home">Khóa học nổi bật</h2>
                  <span className="course-count">{courses.length} kết quả</span>
              </div>
              <div className="courses-grid">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;